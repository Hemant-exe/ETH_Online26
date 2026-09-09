import { NextResponse, type NextRequest } from 'next/server';

import { resolveAgent } from '@/app/lib/identity/agent-book';
import { hashRequest, publishReceipt } from '@/app/lib/hedera/hcs-receipts';
import { runInference } from '@/app/lib/inference/claude';
import { quoteInference, x402Price } from '@/app/lib/x402/pricing';
import {
  PAY_TO_ACCOUNT,
  getResourceServer,
  inferenceRouteConfig,
  isX402Configured,
} from '@/app/lib/x402/resource-server';

/**
 * Paid twin inference.
 *
 * The one endpoint that ties all three sponsor integrations together:
 *
 *   World AgentKit  — the caller must present an agent id that AgentBook
 *                     resolves to a verified human. Checked *first*, so an
 *                     unbacked agent is refused before any payment is quoted.
 *   Hedera x402     — the call is then gated behind a metered HBAR payment,
 *                     settled through the facilitator.
 *   Hedera HCS      — on success, a receipt is published to the audit topic.
 *
 * The order is deliberate. Human-backing is an eligibility question and must
 * be answered before money moves; otherwise a bot could make a real user's
 * agent pay for calls it never authorised.
 */

const ROUTE_PATH = '/api/twin/infer';

export interface InferenceRequestBody {
  prompt: string;
  system?: string;
  maxTokens?: number;
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  /** AgentBook id of the calling twin. */
  agentId: string;
  /** Screening session this call belongs to, for receipt correlation. */
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  // Read the body from a clone so the original stream is still intact for the
  // x402 wrapper and the inner handler.
  let body: InferenceRequestBody;
  try {
    body = (await request.clone().json()) as InferenceRequestBody;
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  if (!body.agentId?.trim()) {
    return NextResponse.json(
      { error: 'agentId is required', code: 'AGENT_REQUIRED' },
      { status: 400 },
    );
  }

  /* ---------- 1. Human-backing, before anything is charged ---------- */
  const agent = await resolveAgent(body.agentId.trim());

  if (!agent.humanBacked) {
    return NextResponse.json(
      {
        error: 'This agent does not resolve to a verified human',
        code: 'AGENT_NOT_HUMAN_BACKED',
        agentId: agent.agentId,
        source: agent.source,
      },
      { status: 403 },
    );
  }

  /* ---------- 2. Meter the call ---------- */
  const quote = quoteInference({
    prompt: body.prompt,
    system: body.system,
    maxTokens: body.maxTokens,
  });

  const requestHash = hashRequest({
    prompt: body.prompt,
    system: body.system,
    maxTokens: quote.maxTokens,
    agentId: agent.agentId,
  });

  /**
   * The work, run only once payment has been verified.
   *
   * `withX402` settles after a successful response, so throwing in here means
   * the user is not charged for a call that failed.
   */
  const handler = async (): Promise<NextResponse> => {
    const result = await runInference({
      prompt: body.prompt,
      system: body.system,
      maxTokens: quote.maxTokens,
      effort: body.effort,
    });

    const receipt = await publishReceipt({
      payer: PAY_TO_ACCOUNT ? `${agent.agentId}→${PAY_TO_ACCOUNT}` : agent.agentId,
      agentId: agent.agentId,
      priceHbar: quote.priceHbar,
      timestamp: new Date().toISOString(),
      requestHash,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      sessionId: body.sessionId,
    });

    return NextResponse.json({
      text: result.text,
      model: result.model,
      live: result.live,
      refused: result.refused ?? false,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      },
      payment: {
        priceHbar: quote.priceHbar,
        breakdown: quote.breakdown,
        payTo: PAY_TO_ACCOUNT || null,
        settled: true,
      },
      agent: {
        agentId: agent.agentId,
        humanBacked: agent.humanBacked,
        source: agent.source,
      },
      receipt,
    });
  };

  /* ---------- 3. Gate on payment ---------- */
  if (!isX402Configured()) {
    // No payee account configured. Serve the call unpaid rather than 500, and
    // say so in the response so the UI can show "unmetered" instead of a
    // price it did not actually charge.
    const response = await handler();
    const payload = await response.json();
    return NextResponse.json({
      ...payload,
      payment: { ...payload.payment, settled: false, unmetered: true },
    });
  }

  try {
    const { withX402 } = await import('@x402/next');
    const server = await getResourceServer();

    const guarded = withX402(
      handler,
      inferenceRouteConfig(
        ROUTE_PATH,
        x402Price(quote),
        `Twin inference — ${quote.estimatedPromptTokens} prompt tokens, up to ${quote.maxTokens} output tokens`,
      ),
      server,
    );

    return await guarded(request);
  } catch (error) {
    console.error('[x402] payment gate failed', error);
    return NextResponse.json(
      { error: 'Payment gate unavailable', detail: String(error) },
      { status: 502 },
    );
  }
}

/**
 * Price quote without paying.
 *
 * Lets the UI show what a call will cost before the user commits to it —
 * which matters when a screening conversation is several paid turns and the
 * user is deciding whether to start one.
 */
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const prompt = params.get('prompt') ?? '';
  const maxTokens = Number.parseInt(params.get('maxTokens') ?? '1024', 10);

  const quote = quoteInference({ prompt, maxTokens });

  return NextResponse.json({
    ...quote,
    payTo: PAY_TO_ACCOUNT || null,
    metered: isX402Configured(),
  });
}
