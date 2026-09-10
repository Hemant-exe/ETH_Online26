import 'server-only';

/**
 * Twin inference.
 *
 * This is the work the x402 payment actually buys: a completion generated in
 * the voice of somebody's AI twin. It runs server-side only — the API key
 * never reaches the browser, and the call is only reached after payment has
 * been verified.
 */

/** Default model. Opus 5 for the quality of the persona work. */
const MODEL = process.env.LLM_MODEL || 'claude-opus-5';

export interface InferenceRequest {
  prompt: string;
  system?: string;
  maxTokens?: number;
  /**
   * How much reasoning to spend.
   *
   * `low` for conversational turns — a twin's reply should read as quick and
   * natural, and deep deliberation makes it stilted as well as expensive.
   * `high` for the compatibility analysis, which is a genuine judgement call
   * over two long profiles and a transcript.
   */
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
}

export interface InferenceResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
  /** False when produced by the local sandbox path rather than a real model. */
  live: boolean;
  /** Set when the model declined the request. */
  refused?: boolean;
}

export function isInferenceConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/**
 * Runs one completion.
 *
 * Falls back to a clearly-labelled canned response when no API key is
 * configured, so the payment flow, the HCS receipt and the screening UI can
 * all be demonstrated end to end without an LLM account. The `live: false`
 * flag travels with the result into the transcript.
 */
export async function runInference(request: InferenceRequest): Promise<InferenceResult> {
  if (!isInferenceConfigured()) {
    return sandboxCompletion(request);
  }

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({
    apiKey: process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY,
    ...(process.env.LLM_BASE_URL ? { baseURL: process.env.LLM_BASE_URL } : {}),
  });

  const maxTokens = request.maxTokens ?? 1024;

  // Cast at the boundary: `fallbacks` and `output_config.effort` are recent
  // additions, and pinning an SDK minor that predates their types would turn a
  // working request into a compile error. The wire format is what matters here.
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    ...(request.system ? { system: request.system } : {}),
    output_config: { effort: request.effort ?? 'low' },
    // A safety decline mid-screening would strand a conversation the user has
    // already paid for, so let the API re-run the turn on a fallback model
    // inside the same call rather than returning nothing.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: request.prompt }],
  } as unknown as Parameters<typeof client.beta.messages.create>[0];

  const response = (await client.beta.messages.create(params)) as any;

  // `stop_details` is only populated on a refusal, so check `stop_reason`
  // before reading content.
  if (response.stop_reason === 'refusal') {
    return {
      text: "My twin declined to answer that one. Let's move on to something else.",
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      model: response.model,
      live: true,
      refused: true,
    };
  }

  const text = (response.content as Array<{ type: string; text?: string }>)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('\n')
    .trim();

  return {
    text,
    promptTokens: response.usage.input_tokens,
    completionTokens: response.usage.output_tokens,
    model: response.model,
    live: true,
  };
}

/**
 * Deterministic stand-in used when no model is configured.
 *
 * Deliberately generic and self-identifying: it must never be mistaken for a
 * real twin response in a transcript or a demo recording.
 */
function sandboxCompletion(request: InferenceRequest): InferenceResult {
  const promptTokens = Math.ceil((request.prompt.length + (request.system?.length ?? 0)) / 4);

  const text =
    '[sandbox response — no LLM key configured] ' +
    'This is where the twin\'s reply would appear. The payment, the HCS receipt and ' +
    'the cost meter around it are all real; only this text is generated locally.';

  return {
    text,
    promptTokens,
    completionTokens: Math.ceil(text.length / 4),
    model: 'sandbox',
    live: false,
  };
}
