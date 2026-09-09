/**
 * The app's single storage entry point.
 *
 * Import `storage` from here — never `LocalStorageAdapter` directly — so the
 * backing implementation can be replaced in one place.
 */

import { LocalStorageAdapter } from "./local-adapter";
import {
  COLLECTIONS,
  type CollectionName,
  type StorageAdapter,
  type StorageFilter,
  type Stored,
} from "./types";

export const storage: StorageAdapter = new LocalStorageAdapter();

export { COLLECTIONS, ALL_COLLECTIONS, OWNER_FIELD } from "./types";
export type {
  CollectionName,
  StorageAdapter,
  StorageFilter,
  Stored,
  StoredRecordMeta,
} from "./types";

/**
 * Reports which physical backend the adapter settled on.
 *
 * Surfaced in identity settings so a user (or a judge watching a demo) can see
 * whether their data is durable or in-memory only.
 */
export async function describeStorage(): Promise<string> {
  const adapter = storage as LocalStorageAdapter;
  return typeof adapter.describe === "function" ? await adapter.describe() : "unknown";
}

/** Collision-resistant record id. */
export function newId(prefix = "rec"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${random}`;
}

/**
 * Writes a record, reusing the id of the first existing match for `filter`.
 *
 * The legacy services all hand-rolled this: query for an existing record,
 * branch on whether one came back, then either patch it or insert a new one.
 * Centralising it keeps the save paths honest about being upserts, and keeps
 * the `_rev` bookkeeping in one place.
 *
 * Returns the id written.
 */
export async function upsert<T extends Record<string, unknown>>(
  collection: CollectionName,
  filter: StorageFilter,
  value: T,
  idPrefix?: string,
): Promise<string> {
  const existing = await storage.list<Stored<T>>(collection, filter);
  const id = existing[0]?._id ?? newId(idPrefix ?? collection);

  // Merge over the existing record so a partial save does not drop fields the
  // caller did not mention.
  const merged = existing[0] ? { ...existing[0], ...value } : value;
  await storage.put(collection, id, merged);
  return id;
}

/** Returns the first record matching `filter`, or null. */
export async function findOne<T>(
  collection: CollectionName,
  filter: StorageFilter,
): Promise<Stored<T> | null> {
  const records = await storage.list<Stored<T>>(collection, filter);
  return records[0] ?? null;
}

/**
 * Legacy alias for the collection map.
 *
 * The pre-existing services referred to collections as `DB_NAMES.PROFILE` etc.
 * Keeping the shape lets those files be ported by changing only their import.
 */
export const DB_NAMES = {
  PROFILE: COLLECTIONS.PROFILE,
  PREFERENCES: COLLECTIONS.PREFERENCES,
  PHOTOS: COLLECTIONS.PHOTOS,
  MATCHES: COLLECTIONS.MATCHES,
  MESSAGES: COLLECTIONS.MESSAGES,
  AI_TWIN: COLLECTIONS.TWIN_PROFILE,
  CHAT_MESSAGES: COLLECTIONS.CHAT_MESSAGES,
} as const;
