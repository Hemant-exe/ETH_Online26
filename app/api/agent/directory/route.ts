import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { NextResponse } from 'next/server';

/**
 * Directory of twins available to screen against.
 *
 * A screening needs a counterpart whose twin is registered as a human-backed
 * agent, and only the server knows which those are. This exposes the minimum
 * needed to offer the choice: a display name, the agent id, and the owning
 * account key.
 *
 * Private keys and human anchors are never included — the anchor is the one
 * value that could correlate a person across contexts.
 */

const REGISTRY_PATH = join(process.cwd(), '.data', 'agents.json');

export async function GET(request: Request) {
  const exclude = new URL(request.url).searchParams.get('exclude')?.trim();

  let agents: any[] = [];
  try {
    await mkdir(join(process.cwd(), '.data'), { recursive: true });
    const parsed = JSON.parse(await readFile(REGISTRY_PATH, 'utf8'));
    agents = Array.isArray(parsed.agents) ? parsed.agents : [];
  } catch {
    agents = [];
  }

  const entries = agents
    .filter((agent) => agent.accountId !== exclude)
    .map((agent) => ({
      accountId: agent.accountId,
      agentId: agent.agentId,
      twinName: agent.twinName,
      registeredInAgentBook: Boolean(agent.registeredInAgentBook),
      // Presence of an anchor is reportable; its value is not.
      humanBacked: Boolean(agent.humanAnchor),
      createdAt: agent.createdAt,
    }));

  return NextResponse.json({ agents: entries });
}
