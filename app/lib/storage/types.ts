/**
 * Storage contract for all user-owned dating data.
 *
 * Every profile, photo, preference, match, message and twin record in the app
 * moves through this one interface. Swapping where the data physically lives is
 * therefore a single-file change (`local-adapter.ts` today, a server or an
 * encrypted remote later) with no impact on the ~25 components that read it.
 */

/**
 * Physical collection keys.
 *
 * These strings are the on-disk identity of the data. They are deliberately
 * unchanged from the schema the app has always used, so records written by
 * earlier builds still deserialise into the same shapes.
 *
 * `favourite` is the twin-profile collection. The name is a historical artifact
 * and reads oddly, but renaming it would strand existing records, so the
 * physical key stays put and `TWIN_PROFILE` below is the name code should use.
 */
export type CollectionName =
  | "dating_profile"
  | "dating_preferences"
  | "dating_photos"
  | "dating_matches"
  | "dating_messages"
  | "favourite"
  | "social_chat_message";

/** Logical names for collections, so call sites never hardcode a raw string. */
export const COLLECTIONS = {
  PROFILE: "dating_profile",
  PREFERENCES: "dating_preferences",
  PHOTOS: "dating_photos",
  MATCHES: "dating_matches",
  MESSAGES: "dating_messages",
  TWIN_PROFILE: "favourite",
  CHAT_MESSAGES: "social_chat_message",
} as const satisfies Record<string, CollectionName>;

/** Every collection, for iteration (store creation, wipe-on-signout, export). */
export const ALL_COLLECTIONS: readonly CollectionName[] = Object.values(COLLECTIONS);

/**
 * A filter is matched field-by-field against each record.
 *
 * A scalar value must equal the record's field. An array value matches if the
 * record's field equals any member, which is what lets callers ask for
 * "messages in any of these groups" without a query language.
 */
export type StorageFilter = Record<string, unknown>;

export interface StorageAdapter {
  get<T>(collection: CollectionName, id: string): Promise<T | null>;
  list<T>(collection: CollectionName, filter?: StorageFilter): Promise<T[]>;
  put<T>(collection: CollectionName, id: string, value: T): Promise<void>;
  delete(collection: CollectionName, id: string): Promise<void>;
  /** Drops every record in a collection. Used by account reset. */
  clear(collection: CollectionName): Promise<void>;
}

/**
 * Fields the adapter maintains on every record it stores.
 *
 * Callers may read these but should never set them; `put` overwrites them.
 */
export interface StoredRecordMeta {
  _id: string;
  /**
   * Monotonic revision counter, incremented on every write.
   *
   * The legacy REST layer exposed an opaque CouchDB `_rev` string and several
   * components branch on its presence to decide insert-vs-update. Keeping the
   * field (as a stringified integer) means those branches keep working.
   */
  _rev: string;
  _updatedAt: string;
}

export type Stored<T> = T & StoredRecordMeta;

/** Records carry the id of the account that owns them. */
export const OWNER_FIELD = "did" as const;
