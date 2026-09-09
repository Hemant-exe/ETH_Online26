import { Wallet } from 'ethers';

import { getAgentById, markRegistered, type AgentRecord } from './agent-registry';

/**
 * World AgentBook integration.
 *
 * AgentBook is the registry that answers the one question this product needs
 * answered before two twins are allowed to talk: *is there a verified human
 * behind this agent?* `createAgentBookVerifier()` resolves a registered agent
 * against World Chain's canonical deployment and returns its anonymous human
 * identifier when it is verified.
 *
 * That resolution is the enforcement point for the whole screening feature.
 * An agent that does not resolve to a human-backed identity is refused before
 * any inference is paid for — which matters, because otherwise an unbacked bot
 * could burn a real user's HBAR by pretending to be someone's twin.
 */

/** Chain the agent signer identifies on. World Chain mainnet. */
const AGENT_CHAIN_ID = process.env.WORLD_AGENT_CHAIN_ID || 'eip155:480';

export interface AgentResolution {
  agentId: string;
  /** True only when AgentBook confirms a verified human behind this agent. */
  humanBacked: boolean;
  /** AgentBook's anonymous human identifier, when resolvable. */
  humanIdentifier: string | null;
  twinName?: string;
  /**
   * Where the answer came from.
   *
   * `agentbook` — resolved against World Chain. Authoritative.
   * `local`     — AgentBook was unreachable or unconfigured, so the answer
   *               comes from this server's own registry, which knows the agent
   *               was created against a verified nullifier but cannot prove it
   *               to a third party.
   * `unknown`   — no such agent.
   */
  source: 'agentbook' | 'local' | 'unknown';
}

/**
 * Lazily constructs the AgentBook verifier.
 *
 * Cached because building it opens a chain client. Returns null when the
 * package or configuration is missing, which callers treat as "fall back to
 * local resolution" rather than as a failure.
 */
let verifierPromise: Promise<any | null> | null = null;

function agentBookVerifier(): Promise<any | null> {
  verifierPromise ??= (async () => {
    try {
      const { createAgentBookVerifier } = await import('@worldcoin/agentkit');
      return createAgentBookVerifier();
    } catch (error) {
      console.warn('[agentbook] verifier unavailable, using local resolution', error);
      return null;
    }
  })();

  return verifierPromise;
}

/**
 * Resolves an agent and its human-backing status.
 *
 * Never throws: callers use this to *decide* whether to proceed, so a
 * resolution failure has to be expressible as "not human-backed" rather than
 * as an exception that skips the check.
 */
export async function resolveAgent(agentId: string): Promise<AgentResolution> {
  const local = await getAgentById(agentId);

  const verifier = await agentBookVerifier();
  if (verifier) {
    try {
      const record = await verifier.resolve(agentId);
      const humanIdentifier = record?.humanIdentifier ?? record?.human_identifier ?? null;

      if (record) {
        return {
          agentId,
          humanBacked: Boolean(humanIdentifier),
          humanIdentifier,
          twinName: local?.twinName,
          source: 'agentbook',
        };
      }
    } catch (error) {
      console.warn(`[agentbook] resolve failed for ${agentId}`, error);
    }
  }

  if (!local) {
    return { agentId, humanBacked: false, humanIdentifier: null, source: 'unknown' };
  }

  // Local fallback. The agent was only ever created against a verified
  // nullifier (see `ensureAgent`), so a local record does imply a verified
  // human — it just is not independently checkable.
  return {
    agentId,
    humanBacked: Boolean(local.humanAnchor),
    humanIdentifier: local.humanAnchor,
    twinName: local.twinName,
    source: 'local',
  };
}

/**
 * Registers an agent address in AgentBook.
 *
 * Registration is normally driven by the CLI
 * (`npx @worldcoin/agentkit-cli register <address>`), which prompts for World
 * App confirmation and submits through the hosted relay. That interactive step
 * cannot run inside a request, so this attempts the programmatic path and
 * records honestly whether it succeeded.
 *
 * Returns whether the agent is now in AgentBook.
 */
export async function registerAgentInAgentBook(agent: AgentRecord): Promise<boolean> {
  try {
    const agentkit = await import('@worldcoin/agentkit');

    // Not every build of the SDK exposes a non-interactive register; when it
    // is absent, fall through to marking the agent locally registered.
    const register = (agentkit as any).registerAgent ?? (agentkit as any).register;
    if (typeof register !== 'function') {
      console.warn('[agentbook] no programmatic register export; use the CLI to register');
      await markRegistered(agent.agentId, false);
      return false;
    }

    await register({ address: agent.agentId, chainId: AGENT_CHAIN_ID });
    await markRegistered(agent.agentId, true);
    return true;
  } catch (error) {
    console.warn(`[agentbook] registration failed for ${agent.agentId}`, error);
    await markRegistered(agent.agentId, false);
    return false;
  }
}

/**
 * Builds a fetch bound to an agent's identity.
 *
 * `agentkit.fetch()` attempts AgentKit verification first and falls back to a
 * standard x402 payment flow — which is exactly the shape this app needs. The
 * same call can reach a World-verified endpoint or our Hedera-settled paid
 * endpoint, and the agent's signature travels with it either way.
 *
 * Returns the global `fetch` when AgentKit is unavailable, so the caller still
 * works (it just pays through the plain x402 client instead).
 */
export async function createAgentFetch(agent: AgentRecord): Promise<typeof fetch> {
  try {
    const { createAgentkitClient } = await import('@worldcoin/agentkit');
    const wallet = new Wallet(agent.privateKey);

    const agentkit = createAgentkitClient({
      signer: {
        address: wallet.address,
        chainId: AGENT_CHAIN_ID,
        type: 'eip191',
        signMessage: (message: string) => wallet.signMessage(message),
      },
    });

    return agentkit.fetch.bind(agentkit) as typeof fetch;
  } catch (error) {
    console.warn('[agentbook] agent-bound fetch unavailable, using plain fetch', error);
    return fetch;
  }
}
