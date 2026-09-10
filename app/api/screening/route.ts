import { NextResponse } from 'next/server';

import { getAgentByAccount } from '@/app/lib/identity/agent-registry';
import { getReport, matchIdFor, saveReport } from '@/app/lib/screening/report-store';
import { ScreeningError, runScreeningDate } from '@/app/lib/twin-negotiation-service';

/**
 * Runs a twin-to-twin screening date.
 *
 * Orchestrated server-side for two reasons: the turns have to be paid for
 * (which needs a signing key the browser must not hold), and the resulting
 * verdict gates whether two people may message each other (which the browser
 * must not be able to forge).
 *
 * Agent ids are looked up from account ids rather than accepted from the
 * request, so a caller cannot nominate somebody else's agent — and therefore
 * somebody else's HBAR — to pay for a conversation.
 */

interface ScreeningBody {
  /** Initiating account. */
  accountId?: string;
  /** Account being screened against. */
  targetAccountId?: string;
  /** Twin profiles, supplied by the client that holds them locally. */
  twinA?: any;
  twinB?: any;
  turns?: number;
}

export async function POST(request: Request) {
  let body: ScreeningBody;
  try {
    body = (await request.json()) as ScreeningBody;
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  const accountId = body.accountId?.trim();
  const targetAccountId = body.targetAccountId?.trim();

  if (!accountId || !targetAccountId) {
    return NextResponse.json(
      { error: 'accountId and targetAccountId are both required' },
      { status: 400 },
    );
  }

  if (accountId === targetAccountId) {
    return NextResponse.json({ error: 'Cannot screen against yourself' }, { status: 400 });
  }

  const [agentA, agentB] = await Promise.all([
    getAgentByAccount(accountId),
    getAgentByAccount(targetAccountId),
  ]);

  if (!agentA) {
    return NextResponse.json(
      {
        error: 'Register your twin as an agent before running a screening',
        code: 'OWN_AGENT_MISSING',
      },
      { status: 403 },
    );
  }

  if (!agentB) {
    return NextResponse.json(
      {
        error: 'That person has not registered their twin as an agent yet',
        code: 'TARGET_AGENT_MISSING',
      },
      { status: 409 },
    );
  }

  try {
    const report = await runScreeningDate({
      agentIdA: agentA.agentId,
      agentIdB: agentB.agentId,
      twinA: body.twinA,
      twinB: body.twinB,
      turns: body.turns,
    });

    const matchId = matchIdFor(accountId, targetAccountId);
    const stored = await saveReport(matchId, report);

    return NextResponse.json(stored);
  } catch (error) {
    if (error instanceof ScreeningError) {
      // 402 for a payment failure so the client can distinguish "could not
      // pay" from "not allowed"; 403 for the eligibility refusals.
      const status = error.code === 'PAYMENT_FAILED' ? 402 : 403;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error('[screening] failed', error);
    return NextResponse.json({ error: 'Screening failed' }, { status: 500 });
  }
}

/** Fetches an existing report by match id. */
export async function GET(request: Request) {
  const matchId = new URL(request.url).searchParams.get('matchId')?.trim();

  if (!matchId) {
    return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
  }

  const report = await getReport(matchId);
  if (!report) {
    return NextResponse.json({ error: 'No screening found for this pair' }, { status: 404 });
  }

  return NextResponse.json(report);
}
