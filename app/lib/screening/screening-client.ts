'use client';

import { accountSession } from '../account/session';
import { getUserAiTwin } from '../twin-profile-service';
import { COLLECTIONS, findOne } from '../storage';

/**
 * Client side of the screening flow.
 *
 * Starts a screening and reads back reports. The conversation itself runs
 * entirely on the server — the browser never sees a payment key and never
 * decides the verdict.
 */

export interface ScreeningTurnView {
  index: number;
  speaker: 'A' | 'B';
  agentId: string;
  twinName: string;
  text: string;
  priceHbar: string | null;
  paymentStatus: string;
  receipt: {
    sequenceNumber: string | null;
    transactionId: string | null;
    hashscanUrl: string | null;
    onChain: boolean;
  } | null;
  live: boolean;
}

export interface ScreeningReportView {
  matchId: string;
  sessionId: string;
  createdAt: string;
  compatibilityScore: number;
  sharedInterests: string[];
  frictionPoints: string[];
  summary: string;
  transcript: ScreeningTurnView[];
  totalCostHbar: string;
  hcsMessageIds: string[];
  topicUrl: string | null;
  agents: {
    a: { agentId: string; humanBacked: boolean; source: string; twinName: string };
    b: { agentId: string; humanBacked: boolean; source: string; twinName: string };
  };
  live: boolean;
  unlockThreshold: number;
  unlocked: boolean;
}

export class ScreeningRequestError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ScreeningRequestError';
    this.status = status;
    this.code = code;
  }
}

/** Order-independent match id, mirroring the server's construction. */
export function matchIdFor(accountA: string, accountB: string): string {
  return [accountA, accountB].sort().join('~');
}

/**
 * Starts a screening between the current user and another account.
 *
 * Both twin profiles are read from local storage and posted, because that is
 * where this app keeps them — the server holds agent identity and payment
 * keys, not user content.
 */
export async function startScreening(
  targetAccountId: string,
  turns = 4,
): Promise<ScreeningReportView> {
  await accountSession.connect();
  const accountId = accountSession.getAccountId();

  if (!accountId) {
    throw new ScreeningRequestError('No active account session', 401);
  }

  const twinA = await getUserAiTwin();
  if (!twinA) {
    throw new ScreeningRequestError(
      'Create your AI twin before running a screening',
      403,
      'OWN_TWIN_MISSING',
    );
  }

  const twinB = await findOne<Record<string, any>>(COLLECTIONS.TWIN_PROFILE, {
    did: targetAccountId,
  });

  if (!twinB) {
    throw new ScreeningRequestError(
      'That person has not created an AI twin yet',
      409,
      'TARGET_TWIN_MISSING',
    );
  }

  const response = await fetch('/api/screening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, targetAccountId, twinA, twinB, turns }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ScreeningRequestError(
      result?.error || 'Screening failed',
      response.status,
      result?.code,
    );
  }

  return result as ScreeningReportView;
}

/** Reads an existing report, or null if the pair has not been screened. */
export async function fetchReport(matchId: string): Promise<ScreeningReportView | null> {
  const response = await fetch(`/api/screening?matchId=${encodeURIComponent(matchId)}`);
  if (!response.ok) return null;
  return (await response.json()) as ScreeningReportView;
}

/**
 * Whether direct human chat is unlocked with an account.
 *
 * Reads the server's verdict rather than caching it locally, so the gate
 * cannot be lifted by editing browser storage.
 */
export async function isChatUnlockedWith(targetAccountId: string): Promise<boolean> {
  const accountId = accountSession.getAccountId();
  if (!accountId) return false;

  const report = await fetchReport(matchIdFor(accountId, targetAccountId));
  return Boolean(report?.unlocked);
}
