import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { Wallet } from 'ethers';

/**
 * Server-side registry of twin agents.
 *
 * Every user's twin gets its own EVM keypair. That address is what gets
 * registered in AgentBook, and it is what signs the twin's requests — which is
 * how a paid inference call, or a message in a screening conversation, can be
 * attributed to a specific agent rather than to "the app".
 *
 * The keys live server-side and never reach the browser. A twin has to be able
 * to act during a screening conversation while its owner is not watching, so
 * the signing key cannot live in their tab; and an agent key in client code
 * could be lifted and used to impersonate that twin.
 *
 * Storage is a JSON file for the same reason as the nullifier registry: this
 * app has no database. A real deployment would use a KMS for the keys and a
 * table for the bindings.
 */

const REGISTRY_PATH = join(process.cwd(), '.data', 'agents.json');

export interface AgentRecord {
  /** AgentBook identity: the agent's EVM address. */
  agentId: string;
  /** Private key for signing as this agent. Server-only. */
  privateKey: string;
  /** The World ID nullifier of the human this agent speaks for. */
  humanAnchor: string;
  /** Local account key of the owner. */
  accountId: string;
  /** Display name, for transcripts and badges. */
  twinName: string;
  createdAt: string;
  /** When AgentBook registration was confirmed, if it has been. */
  registeredAt?: string;
  /**
   * Whether registration went through AgentBook for real.
   *
   * False means the agent exists and signs locally, but is not in AgentBook —
   * either the registration relay was unreachable or credentials are missing.
   * The badge in the UI reflects this honestly rather than claiming a
   * registration that did not happen.
   */
  registeredInAgentBook: boolean;
}

interface Registry {
  agents: AgentRecord[];
}

let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation, operation);
  queue = result.catch(() => undefined);
  return result;
}

async function read(): Promise<Registry> {
  try {
    return JSON.parse(await readFile(REGISTRY_PATH, 'utf8')) as Registry;
  } catch {
    return { agents: [] };
  }
}

async function write(registry: Registry): Promise<void> {
  await mkdir(dirname(REGISTRY_PATH), { recursive: true });
  await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
}

/**
 * Returns the agent for a human, creating its keypair on first call.
 *
 * Keyed on the human anchor rather than the account id, so one verified person
 * gets exactly one agent. Without that, a user could mint a fresh agent per
 * browser and run several "human-backed" twins from one verification.
 */
export async function ensureAgent(params: {
  humanAnchor: string;
  accountId: string;
  twinName: string;
}): Promise<AgentRecord> {
  return await serialise(async () => {
    const registry = await read();

    const existing = registry.agents.find((agent) => agent.humanAnchor === params.humanAnchor);
    if (existing) {
      // Keep the display name and owning account current without reissuing keys.
      existing.twinName = params.twinName || existing.twinName;
      existing.accountId = params.accountId;
      await write(registry);
      return existing;
    }

    const wallet = Wallet.createRandom();
    const record: AgentRecord = {
      agentId: wallet.address,
      privateKey: wallet.privateKey,
      humanAnchor: params.humanAnchor,
      accountId: params.accountId,
      twinName: params.twinName,
      createdAt: new Date().toISOString(),
      registeredInAgentBook: false,
    };

    registry.agents.push(record);
    await write(registry);
    return record;
  });
}

/** Marks an agent as confirmed in AgentBook. */
export async function markRegistered(agentId: string, inAgentBook: boolean): Promise<void> {
  await serialise(async () => {
    const registry = await read();
    const agent = registry.agents.find((entry) => entry.agentId === agentId);
    if (!agent) return;
    agent.registeredAt = new Date().toISOString();
    agent.registeredInAgentBook = inAgentBook;
    await write(registry);
  });
}

export async function getAgentById(agentId: string): Promise<AgentRecord | null> {
  const registry = await read();
  return (
    registry.agents.find((agent) => agent.agentId.toLowerCase() === agentId.toLowerCase()) ?? null
  );
}

export async function getAgentByAccount(accountId: string): Promise<AgentRecord | null> {
  const registry = await read();
  return registry.agents.find((agent) => agent.accountId === accountId) ?? null;
}

export async function getAgentByAnchor(humanAnchor: string): Promise<AgentRecord | null> {
  const registry = await read();
  return registry.agents.find((agent) => agent.humanAnchor === humanAnchor) ?? null;
}

/**
 * Strips the private key for anything that leaves the server.
 *
 * Always use this when serialising an agent into a response.
 */
export function publicView(agent: AgentRecord): Omit<AgentRecord, 'privateKey'> {
  const { privateKey: _omitted, ...rest } = agent;
  return rest;
}
