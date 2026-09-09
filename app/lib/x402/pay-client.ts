import 'server-only';

import { HEDERA_NETWORK, X402_NETWORK } from '../hedera/client';

/**
 * x402 paying client.
 *
 * The buyer half of the protocol: it takes the 402 challenge, signs a Hedera
 * transfer for the quoted amount, and retries the request with the signature
 * attached. The facilitator co-signs, submits and pays the gas.
 *
 * Server-side by necessity. A twin has to be able to pay for a turn of a
 * screening conversation while its owner's tab is closed, so the signing key
 * cannot live in the browser — and an agent key in client code could be
 * lifted and spent by anyone.
 */

export interface PaidCallResult<T> {
  body: T;
  /** Settlement state reported by the client. */
  paymentStatus: 'settled' | 'settle_failed' | 'unpaid' | 'unknown';
  /** Raw settlement header, base64 JSON, useful for a HashScan lookup. */
  paymentHeader: string | null;
}

export function isPayerConfigured(): boolean {
  return Boolean(process.env.HEDERA_AGENT_ACCOUNT_ID && process.env.HEDERA_AGENT_PRIVATE_KEY);
}

/**
 * Builds the payment-aware fetch and its response processor.
 *
 * Cached, because registering the scheme constructs a Hedera signer.
 */
let clientPromise: Promise<{ fetchWithPayment: typeof fetch; httpClient: any } | null> | null =
  null;

function getPayingClient() {
  clientPromise ??= (async () => {
    if (!isPayerConfigured()) return null;

    try {
      const { wrapFetchWithPayment, x402HTTPClient } = await import('@x402/fetch');
      const { x402Client } = await import('@x402/core/client');
      const { ExactHederaScheme } = await import('@x402/hedera/exact/client');
      const { createClientHederaSigner, PrivateKey } = await import('@x402/hedera');

      const signer = createClientHederaSigner(
        process.env.HEDERA_AGENT_ACCOUNT_ID as string,
        PrivateKey.fromStringECDSA(process.env.HEDERA_AGENT_PRIVATE_KEY as string),
        { network: X402_NETWORK },
      );

      const client = new x402Client();
      client.register('hedera:*', new ExactHederaScheme(signer));

      return {
        fetchWithPayment: wrapFetchWithPayment(fetch, client) as typeof fetch,
        httpClient: new x402HTTPClient(client),
      };
    } catch (error) {
      console.error('[x402] could not build paying client', error);
      return null;
    }
  })();

  return clientPromise;
}

/**
 * Makes a paid POST request.
 *
 * When no payer is configured the request is still made — the resource server
 * will serve it unmetered and say so — so the app remains demonstrable before
 * Hedera credentials are added. `paymentStatus` reflects what actually
 * happened rather than what was intended.
 */
export async function paidPost<T>(url: string, payload: unknown): Promise<PaidCallResult<T>> {
  const client = await getPayingClient();

  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };

  if (!client) {
    const response = await fetch(url, init);
    const body = (await response.json()) as T;
    if (!response.ok) {
      throw new PaidCallError('Inference request failed', response.status, body);
    }
    return { body, paymentStatus: 'unpaid', paymentHeader: null };
  }

  const response = await client.fetchWithPayment(url, init);

  // `processResponse` decodes the settlement header and surfaces whether the
  // facilitator accepted the payment.
  const processed = await client.httpClient.processResponse(response);

  if (!response.ok) {
    throw new PaidCallError('Paid inference request failed', response.status, processed.body);
  }

  return {
    body: processed.body as T,
    paymentStatus: (processed.paymentStatus as PaidCallResult<T>['paymentStatus']) ?? 'unknown',
    paymentHeader: processed.header ?? null,
  };
}

export class PaidCallError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'PaidCallError';
    this.status = status;
    this.body = body;
  }
}

/** Absolute URL for an internal route, needed because fetch runs server-side. */
export function internalUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return new URL(path, base).toString();
}

export { HEDERA_NETWORK };
