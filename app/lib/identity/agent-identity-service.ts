'use client';

import { accountSession } from '../account/session';
import { attachAgentId, getTwinAgentId } from '../twin-profile-service';

/**
 * Client half of twin agent identity.
 *
 * A twin only becomes an *agent* once it is registered in AgentBook against
 * its owner's verified humanity. Until then it is just a saved profile: it can
 * chat with its own owner, but it cannot enter a screening conversation,
 * because the other side has no way to check a person stands behind it.
 */

export interface RegisteredAgent {
  agentId: string;
  twinName: string;
  humanAnchor: string;
  accountId: string;
  createdAt: string;
  registeredAt?: string;
  registeredInAgentBook: boolean;
}

export interface AgentResolutionView {
  agentId: string;
  humanBacked: boolean;
  twinName: string | null;
  source: 'agentbook' | 'local' | 'unknown';
  humanIdentifierPreview: string | null;
}

export class AgentRegistrationError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AgentRegistrationError';
    this.code = code;
  }
}

/**
 * Registers the current user's twin as a human-backed agent.
 *
 * Requires a verified session — the server refuses otherwise, and refusing
 * client-side too just saves a round trip and gives a clearer message.
 *
 * The resulting agent id is persisted on the twin record, because every
 * outgoing twin message is checked against it later.
 */
export async function registerTwinAsAgent(
  nullifierHash?: string | null,
  twinProfile?: { name?: string },
): Promise<RegisteredAgent> {
  await accountSession.connect();

  const accountId = accountSession.getAccountId();
  const humanAnchor = nullifierHash ?? accountSession.getHumanAnchor();

  if (!humanAnchor) {
    throw new AgentRegistrationError(
      'Complete Selfie Check before registering your twin as an agent.',
      'NOT_VERIFIED',
    );
  }

  const response = await fetch('/api/agent/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      humanAnchor,
      twinName: twinProfile?.name,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AgentRegistrationError(
      result?.error || 'Could not register your twin as an agent.',
      result?.code,
    );
  }

  const agent = result.agent as RegisteredAgent;
  await attachAgentId(agent.agentId);
  return agent;
}

/** Resolves any agent's human-backing status. */
export async function resolveAgent(agentId: string): Promise<AgentResolutionView> {
  const response = await fetch(`/api/agent/resolve?agentId=${encodeURIComponent(agentId)}`);

  if (!response.ok) {
    return {
      agentId,
      humanBacked: false,
      twinName: null,
      source: 'unknown',
      humanIdentifierPreview: null,
    };
  }

  return (await response.json()) as AgentResolutionView;
}

/**
 * The current user's agent id, or null if their twin is not registered.
 *
 * Reads the twin record rather than asking the server, so badges render
 * without a network round trip.
 */
export async function getMyAgentId(): Promise<string | null> {
  try {
    return await getTwinAgentId();
  } catch {
    return null;
  }
}

/** Whether the current user's twin is registered and human-backed. */
export async function isMyTwinRegistered(): Promise<boolean> {
  const agentId = await getMyAgentId();
  if (!agentId) return false;
  const resolution = await resolveAgent(agentId);
  return resolution.humanBacked;
}
