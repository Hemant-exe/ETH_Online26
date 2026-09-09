import { NextResponse } from 'next/server';

import { registerAgentInAgentBook } from '@/app/lib/identity/agent-book';
import { ensureAgent, publicView } from '@/app/lib/identity/agent-registry';
import { accountForNullifier } from '@/app/lib/identity/nullifier-registry';
import { WORLD_ACTION } from '@/app/lib/identity/world-config';

/**
 * Registers a user's twin as a human-backed agent.
 *
 * The order of checks matters. Before an agent exists at all, this route
 * confirms that the claimed human anchor really belongs to the claimed
 * account, by looking it up in the server's own nullifier registry. A client
 * could otherwise post someone else's nullifier and obtain an agent that
 * appears human-backed by a person who never authorised it.
 */

interface RegisterBody {
  accountId?: string;
  humanAnchor?: string;
  twinName?: string;
}

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  const accountId = body.accountId?.trim();
  const humanAnchor = body.humanAnchor?.trim();

  if (!accountId || !humanAnchor) {
    return NextResponse.json(
      { error: 'accountId and humanAnchor are both required' },
      { status: 400 },
    );
  }

  // An agent may only be created for a human this server verified itself.
  const owner = await accountForNullifier(humanAnchor, WORLD_ACTION).catch(() => null);

  if (!owner) {
    return NextResponse.json(
      {
        error: 'Complete Selfie Check before registering your twin as an agent',
        code: 'NOT_VERIFIED',
      },
      { status: 403 },
    );
  }

  if (owner !== accountId) {
    return NextResponse.json(
      { error: 'This human anchor belongs to a different account', code: 'ANCHOR_MISMATCH' },
      { status: 403 },
    );
  }

  const agent = await ensureAgent({
    accountId,
    humanAnchor,
    twinName: body.twinName?.trim() || 'AI Twin',
  });

  const inAgentBook = await registerAgentInAgentBook(agent);

  return NextResponse.json({
    agent: publicView({ ...agent, registeredInAgentBook: inAgentBook }),
    registeredInAgentBook: inAgentBook,
  });
}
