import 'server-only';

import { X402_NETWORK } from '../hedera/client';

/**
 * x402 resource-server configuration.
 *
 * This is the paid side of the protocol: it issues the 402 challenge, and it
 * verifies and settles the payment that comes back. Settlement goes through a
 * facilitator, which is what makes the Hedera scheme workable in a browser
 * context — the facilitator co-signs and submits the transfer and pays the
 * gas, so the payer only has to sign a transaction, not hold gas or wait for
 * consensus before their request is served.
 */

/**
 * Facilitator endpoint.
 *
 * Defaults to Blocky402, which supports both `hedera:testnet` and
 * `hedera:mainnet`. The x402 Foundation facilitator at
 * `https://x402.org/facilitator` also serves `hedera:testnet` and is a
 * drop-in alternative.
 */
export const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://api.blocky402.com';

/** Hedera account that receives inference payments. */
export const PAY_TO_ACCOUNT = process.env.X402_PAY_TO_ACCOUNT || '';

export function isX402Configured(): boolean {
  return Boolean(PAY_TO_ACCOUNT);
}

/**
 * Builds the resource server, registering the Hedera `exact` scheme.
 *
 * Cached: constructing it opens a facilitator client, and a route handler that
 * builds one per request leaks connections.
 */
let serverPromise: Promise<any> | null = null;

export function getResourceServer(): Promise<any> {
  serverPromise ??= (async () => {
    const { x402ResourceServer, HTTPFacilitatorClient } = await import('@x402/core/server');
    const { ExactHederaScheme } = await import('@x402/hedera/exact/server');

    const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
    const server = new x402ResourceServer(facilitator);

    // Wildcard so the same server handles testnet and mainnet without being
    // rebuilt when the network env changes.
    server.register('hedera:*', new ExactHederaScheme());

    return server;
  })();

  return serverPromise;
}

/**
 * Route configuration for a single priced call.
 *
 * Built per request rather than declared statically, because the price is
 * metered from the request body — see `pricing.ts`. `withX402` accepts the
 * config as an argument, so a fresh one per request is legitimate and is what
 * makes per-call metering expressible in the protocol.
 */
export function inferenceRouteConfig(routePath: string, price: string, description: string) {
  return {
    [routePath]: {
      accepts: [
        {
          scheme: 'exact' as const,
          price,
          network: X402_NETWORK,
          payTo: PAY_TO_ACCOUNT,
        },
      ],
      description,
      mimeType: 'application/json',
    },
  };
}
