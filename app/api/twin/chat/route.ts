import { NextResponse } from 'next/server';

import { getAgentByAccount } from '@/app/lib/identity/agent-registry';
import { PaidCallError, internalUrl, paidPost } from '@/app/lib/x402/pay-client';

/**
 * Twin chat, paid on the caller's behalf.
 *
 * The browser cannot pay for its own inference: settling an x402 challenge
 * needs a Hedera signing key, and putting one in client code would let anyone
 * spend it. So the browser asks here, and this route makes the paid call as
 * the user's registered agent.
 *
 * It is a thin orchestrator on purpose — the payment gate, the human-backing
 * check and the HCS receipt all live in `/api/twin/infer`, and this route goes
 * through that same endpoint rather than around it.
 */

interface ChatBody {
  prompt: string;
  system?: string;
  maxTokens?: number;
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  accountId?: string;
  agentId?: string;
  sessionId?: string;
}

export async function POST(request: Request) {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  // Resolve the caller's agent from their account rather than trusting an
  // agent id in the request body — otherwise a user could bill another
  // person's agent for their own twin's replies.
  let agentId = body.agentId?.trim();
  if (body.accountId) {
    const owned = await getAgentByAccount(body.accountId.trim());
    if (owned) agentId = owned.agentId;
  }

  if (!agentId) {
    return NextResponse.json(
      {
        error: 'Register your twin as an agent before chatting with it',
        code: 'AGENT_REQUIRED',
      },
      { status: 403 },
    );
  }

  try {
    const result = await paidPost<Record<string, unknown>>(internalUrl('/api/twin/infer'), {
      prompt: body.prompt,
      system: body.system,
      maxTokens: body.maxTokens,
      effort: body.effort,
      agentId,
      sessionId: body.sessionId,
    });

    return NextResponse.json({
      ...result.body,
      payment: {
        ...(result.body.payment as Record<string, unknown>),
        status: result.paymentStatus,
        settlementHeader: result.paymentHeader,
      },
    });
  } catch (error) {
    if (error instanceof PaidCallError) {
      return NextResponse.json(
        { error: error.message, detail: error.body },
        { status: error.status },
      );
    }

    console.error('[twin/chat] failed', error);
    return NextResponse.json({ error: 'Twin inference failed' }, { status: 500 });
  }
}
