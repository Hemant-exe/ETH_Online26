/**
 * Per-call inference pricing.
 *
 * Hedera's agentic-payments track asks for *metered* pricing rather than a
 * flat per-request fee, and the distinction is the whole point of x402 for an
 * LLM endpoint: a four-turn screening conversation with long twin profiles
 * costs materially more to serve than a one-line reply, and charging both the
 * same is either overcharging the cheap call or subsidising the expensive one.
 *
 * The quote is therefore computed from the actual request before the 402
 * challenge is issued, and the challenge carries that exact amount.
 */

/** Base charge per call, covering fixed overhead. HBAR. */
const BASE_HBAR = Number.parseFloat(process.env.TWIN_INFERENCE_PRICE_HBAR || '0.01');

/** Marginal charge per 1,000 prompt tokens. HBAR. */
const PROMPT_HBAR_PER_1K = Number.parseFloat(
  process.env.TWIN_INFERENCE_PROMPT_HBAR_PER_1K || '0.004',
);

/** Marginal charge per 1,000 tokens of requested output. HBAR. */
const COMPLETION_HBAR_PER_1K = Number.parseFloat(
  process.env.TWIN_INFERENCE_COMPLETION_HBAR_PER_1K || '0.02',
);

/** HBAR has 8 decimal places (tinybars); quotes are rounded to that. */
const HBAR_DECIMALS = 8;

export interface InferenceQuote {
  priceHbar: string;
  estimatedPromptTokens: number;
  maxTokens: number;
  breakdown: {
    baseHbar: string;
    promptHbar: string;
    completionHbar: string;
  };
}

/**
 * Estimates prompt tokens without calling the model.
 *
 * The price has to be known *before* the model runs — it goes in the 402
 * challenge — so an exact count is not available. Four characters per token is
 * the standard rough ratio for English prose and is what the twin profiles and
 * conversation transcripts here are made of.
 *
 * Deliberately an over-estimate rather than an under-estimate: the charge is
 * quoted up front and never revised upward after the fact.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Prices one inference request. */
export function quoteInference(params: {
  prompt: string;
  system?: string;
  maxTokens?: number;
}): InferenceQuote {
  const estimatedPromptTokens = estimateTokens(`${params.system ?? ''}\n${params.prompt}`);
  const maxTokens = params.maxTokens ?? 1024;

  const promptHbar = (estimatedPromptTokens / 1000) * PROMPT_HBAR_PER_1K;
  const completionHbar = (maxTokens / 1000) * COMPLETION_HBAR_PER_1K;
  const total = BASE_HBAR + promptHbar + completionHbar;

  return {
    priceHbar: format(total),
    estimatedPromptTokens,
    maxTokens,
    breakdown: {
      baseHbar: format(BASE_HBAR),
      promptHbar: format(promptHbar),
      completionHbar: format(completionHbar),
    },
  };
}

function format(value: number): string {
  // Trim trailing zeros so the meter in the UI reads "0.0324" and not
  // "0.03240000", while staying within HBAR's precision.
  return Number.parseFloat(value.toFixed(HBAR_DECIMALS)).toString();
}

/**
 * The x402 `price` string for a quote.
 *
 * x402 expects an asset-qualified amount. HBAR is the native asset, so the
 * amount is expressed directly rather than as a USD-denominated value (which
 * would need an oracle to settle).
 */
export function x402Price(quote: InferenceQuote): string {
  return `${quote.priceHbar} HBAR`;
}
