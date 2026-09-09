import { NextResponse } from 'next/server';

import { resolveAgent } from '@/app/lib/identity/agent-book';

/**
 * Resolves an agent's human-backing status through AgentBook.
 *
 * Read-only and deliberately public: the whole point of AgentBook is that
 * anyone can check whether an agent is backed by a verified human, and the UI
 * uses this to render the badge next to a twin in chat.
 *
 * The response never includes the human anchor when AgentBook is the source —
 * that identifier is scoped to the resolver, not to the page.
 */
export async function GET(request: Request) {
  const agentId = new URL(request.url).searchParams.get('agentId')?.trim();

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
  }

  const resolution = await resolveAgent(agentId);

  return NextResponse.json({
    agentId: resolution.agentId,
    humanBacked: resolution.humanBacked,
    twinName: resolution.twinName ?? null,
    source: resolution.source,
    // Truncated: enough to show two agents are different people, not enough
    // to correlate an agent with a profile elsewhere.
    humanIdentifierPreview: resolution.humanIdentifier
      ? `${resolution.humanIdentifier.slice(0, 10)}…`
      : null,
  });
}
