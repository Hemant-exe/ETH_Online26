import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { ScreeningReport } from '../twin-negotiation-service';

/**
 * Persistence for screening reports.
 *
 * Server-side, because a report is the record of money that was spent and of
 * which pairs are allowed to talk. If it lived in the browser, a user could
 * edit their own compatibility score and unlock a chat the screening actually
 * declined — which would make the whole gate decorative.
 */

const STORE_PATH = join(process.cwd(), '.data', 'screenings.json');

export interface StoredReport extends ScreeningReport {
  /** Stable key for the report's page: the pair, order-independent. */
  matchId: string;
  createdAt: string;
}

interface Store {
  reports: StoredReport[];
}

let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation, operation);
  queue = result.catch(() => undefined);
  return result;
}

async function read(): Promise<Store> {
  try {
    return JSON.parse(await readFile(STORE_PATH, 'utf8')) as Store;
  } catch {
    return { reports: [] };
  }
}

/**
 * Order-independent id for a pair of accounts.
 *
 * Sorted so a screening initiated from either side resolves to the same
 * report rather than producing two conflicting verdicts for one pair.
 */
export function matchIdFor(accountA: string, accountB: string): string {
  return [accountA, accountB].sort().join('~');
}

export async function saveReport(matchId: string, report: ScreeningReport): Promise<StoredReport> {
  return await serialise(async () => {
    const store = await read();
    const stored: StoredReport = { ...report, matchId, createdAt: new Date().toISOString() };

    // One current report per pair; re-screening replaces the old verdict.
    store.reports = store.reports.filter((entry) => entry.matchId !== matchId);
    store.reports.push(stored);

    await mkdir(dirname(STORE_PATH), { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
    return stored;
  });
}

export async function getReport(matchId: string): Promise<StoredReport | null> {
  const store = await read();
  return store.reports.find((entry) => entry.matchId === matchId) ?? null;
}

export async function getReportBySession(sessionId: string): Promise<StoredReport | null> {
  const store = await read();
  return store.reports.find((entry) => entry.sessionId === sessionId) ?? null;
}

/** Every report an account took part in, newest first. */
export async function listReportsFor(accountId: string): Promise<StoredReport[]> {
  const store = await read();
  return store.reports
    .filter((entry) => entry.matchId.split('~').includes(accountId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Whether a pair has cleared the screening threshold.
 *
 * This is the authority for unlocking direct human chat.
 */
export async function isChatUnlocked(accountA: string, accountB: string): Promise<boolean> {
  const report = await getReport(matchIdFor(accountA, accountB));
  return Boolean(report?.unlocked);
}
