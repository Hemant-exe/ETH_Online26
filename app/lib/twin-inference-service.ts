'use client';

import { accountSession } from './account/session';

/**
 * Client-side twin inference.
 *
 * Replaces the previous hosted-LLM client. Two things changed underneath:
 * inference now runs against our own endpoint rather than a vendor's, and
 * every call is metered and paid in HBAR over x402.
 *
 * The exported shapes are unchanged, including the `{ response: { output } }`
 * envelope that the chat and prompt layers destructure, so callers did not
 * have to change.
 */

export interface BasicPromptRequest {
  prompt: string;
  provider?: string;
  model?: string;
  tokenLimit?: number;
  customEndpoint?: string;
  customKey?: string;
}

export interface AgentPromptRequest {
  prompt: string;
  temperature?: number;
  /** System prompt, when the caller wants to set the twin's voice explicitly. */
  system?: string;
  /** Reasoning depth. Conversational turns default to `low`. */
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  /** Correlates receipts for a multi-turn screening session. */
  sessionId?: string;
}

export interface ProfilePromptRequest {
  schema: string;
  promptSearchTip?: string;
}

/** What a paid call cost, surfaced so the UI can show a running meter. */
export interface PaymentDetail {
  priceHbar: string | null;
  status: string | null;
  settled: boolean;
  unmetered: boolean;
  receipt: {
    sequenceNumber: string | null;
    transactionId: string | null;
    hashscanUrl: string | null;
    topicUrl: string | null;
    onChain: boolean;
  } | null;
}

export interface InferenceEnvelope {
  /** Preserved envelope shape: callers read `response.response.output`. */
  response: { output: string };
  text: string;
  live: boolean;
  refused: boolean;
  usage: { promptTokens: number; completionTokens: number } | null;
  payment: PaymentDetail;
}

export class InferenceError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'InferenceError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Running total for the current browser session.
 *
 * Held in memory rather than persisted: it is a live meter for the
 * conversation on screen, and the durable record is the HCS topic.
 */
let spentHbar = 0;
const spendListeners = new Set<(total: number) => void>();

export function getSessionSpendHbar(): number {
  return spentHbar;
}

export function onSpendChange(listener: (total: number) => void): () => void {
  spendListeners.add(listener);
  return () => spendListeners.delete(listener);
}

function recordSpend(priceHbar: string | null): void {
  const amount = Number.parseFloat(priceHbar ?? '0');
  if (!Number.isFinite(amount) || amount <= 0) return;
  spentHbar += amount;
  spendListeners.forEach((listener) => listener(spentHbar));
}

/** Issues one paid inference call. */
async function callInference(params: {
  prompt: string;
  system?: string;
  maxTokens?: number;
  effort?: AgentPromptRequest['effort'];
  sessionId?: string;
}): Promise<InferenceEnvelope> {
  await accountSession.connect();

  const response = await fetch('/api/twin/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, accountId: accountSession.getAccountId() }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new InferenceError(
      result?.error || 'Twin inference failed',
      response.status,
      result?.code,
    );
  }

  const payment: PaymentDetail = {
    priceHbar: result?.payment?.priceHbar ?? null,
    status: result?.payment?.status ?? null,
    settled: Boolean(result?.payment?.settled) && result?.payment?.status !== 'settle_failed',
    unmetered: Boolean(result?.payment?.unmetered),
    receipt: result?.receipt
      ? {
          sequenceNumber: result.receipt.sequenceNumber ?? null,
          transactionId: result.receipt.transactionId ?? null,
          hashscanUrl: result.receipt.hashscanUrl ?? null,
          topicUrl: result.receipt.topicUrl ?? null,
          onChain: Boolean(result.receipt.onChain),
        }
      : null,
  };

  recordSpend(payment.priceHbar);

  const text: string = result?.text ?? '';

  return {
    response: { output: text },
    text,
    live: Boolean(result?.live),
    refused: Boolean(result?.refused),
    usage: result?.usage ?? null,
    payment,
  };
}

/**
 * Fetches a price quote without paying.
 *
 * Used to show the cost of a screening conversation before the user starts
 * one.
 */
export async function quoteInferenceCost(
  prompt: string,
  maxTokens = 1024,
): Promise<{ priceHbar: string; metered: boolean } | null> {
  try {
    const response = await fetch(
      `/api/twin/infer?prompt=${encodeURIComponent(prompt.slice(0, 2000))}&maxTokens=${maxTokens}`,
    );
    if (!response.ok) return null;
    const quote = await response.json();
    return { priceHbar: quote.priceHbar, metered: Boolean(quote.metered) };
  } catch {
    return null;
  }
}

export async function sendBasicPrompt(request: BasicPromptRequest): Promise<InferenceEnvelope> {
  if (!request.prompt) {
    throw new Error('Prompt is required');
  }

  return await callInference({
    prompt: request.prompt,
    maxTokens: request.tokenLimit ?? 2000,
  });
}

/**
 * The twin's conversational path.
 *
 * `temperature` is accepted for signature compatibility but no longer sent:
 * the current model rejects sampling parameters, and reasoning depth is
 * controlled with `effort` instead.
 */
export async function sendAgentPrompt(request: AgentPromptRequest): Promise<InferenceEnvelope> {
  if (!request.prompt) {
    throw new Error('Prompt is required');
  }

  return await callInference({
    prompt: request.prompt,
    system: request.system,
    effort: request.effort ?? 'low',
    sessionId: request.sessionId,
  });
}

export async function generateProfile(request: ProfilePromptRequest): Promise<InferenceEnvelope> {
  if (!request.schema) {
    throw new Error('Schema is required');
  }

  const prompt = [
    'Generate a dating profile matching this schema. Return JSON only.',
    `Schema: ${request.schema}`,
    request.promptSearchTip ? `Guidance: ${request.promptSearchTip}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return await callInference({ prompt, maxTokens: 2000, effort: 'medium' });
}
