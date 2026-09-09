'use client';

import { ALL_COLLECTIONS, OWNER_FIELD, storage, type Stored } from '../storage';

/**
 * Re-keys rows written while anonymous onto a verified account id.
 *
 * A user can fill in a profile before passing Selfie Check. When they do
 * verify, their account id changes (it becomes a function of the nullifier),
 * which would otherwise orphan everything they had already entered. This walks
 * every collection and rewrites the owner field.
 *
 * Returns the number of rows moved, so the caller can report it.
 */
export async function migrateAnonymousData(
  previousAccountId: string | null,
  accountId: string,
): Promise<number> {
  if (!previousAccountId || previousAccountId === accountId) return 0;

  let moved = 0;

  for (const collection of ALL_COLLECTIONS) {
    const rows = await storage.list<Stored<Record<string, unknown>>>(collection, {
      [OWNER_FIELD]: previousAccountId,
    });

    for (const row of rows) {
      await storage.put(collection, row._id, { ...row, [OWNER_FIELD]: accountId });
      moved += 1;
    }
  }

  return moved;
}
