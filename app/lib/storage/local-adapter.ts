/**
 * Browser-local implementation of `StorageAdapter`.
 *
 * IndexedDB is the primary store. Two fallbacks sit behind it because this code
 * is imported by modules that also run during server rendering and inside
 * private-browsing modes where IndexedDB is present but unusable:
 *
 *   IndexedDB  ->  localStorage  ->  in-memory
 *
 * The fallback is chosen once, lazily, on first use. Callers never see which
 * one they got; they only see that data written before a refresh is still there
 * (IndexedDB, localStorage) or is not (in-memory, i.e. server rendering).
 */

import { openDB, type IDBPDatabase } from "idb";

import {
  ALL_COLLECTIONS,
  type CollectionName,
  type StorageAdapter,
  type StorageFilter,
  type Stored,
} from "./types";

const DB_NAME = "proof_of_heart";
const DB_VERSION = 1;

/** Prefix for the localStorage fallback's flattened keys. */
const LS_PREFIX = "poh:";

/**
 * Matches a record against a filter.
 *
 * An array filter value is an "in" test; anything else is equality. Nested
 * paths are supported with dots (`metadata.age`) because the profile schema
 * nests a good deal of its data.
 */
function matches(record: Record<string, unknown>, filter?: StorageFilter): boolean {
  if (!filter) return true;

  return Object.entries(filter).every(([path, expected]) => {
    const actual = path.includes(".")
      ? path.split(".").reduce<unknown>((node, key) => {
          if (node === null || typeof node !== "object") return undefined;
          return (node as Record<string, unknown>)[key];
        }, record)
      : record[path];

    if (Array.isArray(expected)) return expected.includes(actual);
    return actual === expected;
  });
}

/** Stamps adapter-managed metadata onto a value about to be written. */
function withMeta<T>(id: string, value: T, previousRev: string | null): Stored<T> {
  const nextRev = String(Number(previousRev ?? "0") + 1);
  return {
    ...(value as Record<string, unknown>),
    _id: id,
    _rev: nextRev,
    _updatedAt: new Date().toISOString(),
  } as Stored<T>;
}

/* ------------------------------------------------------------------ */
/* Backends                                                            */
/* ------------------------------------------------------------------ */

interface Backend {
  readonly kind: "indexeddb" | "localstorage" | "memory";
  get(collection: CollectionName, id: string): Promise<unknown>;
  all(collection: CollectionName): Promise<unknown[]>;
  put(collection: CollectionName, id: string, value: unknown): Promise<void>;
  delete(collection: CollectionName, id: string): Promise<void>;
  clear(collection: CollectionName): Promise<void>;
}

function createIndexedDbBackend(db: IDBPDatabase): Backend {
  return {
    kind: "indexeddb",
    async get(collection, id) {
      return (await db.get(collection, id)) ?? null;
    },
    async all(collection) {
      return await db.getAll(collection);
    },
    async put(collection, id, value) {
      await db.put(collection, value, id);
    },
    async delete(collection, id) {
      await db.delete(collection, id);
    },
    async clear(collection) {
      await db.clear(collection);
    },
  };
}

/**
 * localStorage backend.
 *
 * Records are stored one key per record (`poh:<collection>:<id>`) rather than
 * one blob per collection, so a single oversized photo cannot fail the write
 * for an unrelated record in the same collection.
 */
function createLocalStorageBackend(): Backend {
  const keyFor = (collection: CollectionName, id: string) => `${LS_PREFIX}${collection}:${id}`;

  const idsIn = (collection: CollectionName): string[] => {
    const prefix = `${LS_PREFIX}${collection}:`;
    const ids: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(prefix)) ids.push(key.slice(prefix.length));
    }
    return ids;
  };

  const read = (collection: CollectionName, id: string): unknown => {
    const raw = window.localStorage.getItem(keyFor(collection, id));
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      // A corrupt record should not poison reads of the whole collection.
      return null;
    }
  };

  return {
    kind: "localstorage",
    async get(collection, id) {
      return read(collection, id);
    },
    async all(collection) {
      return idsIn(collection)
        .map((id) => read(collection, id))
        .filter((record) => record !== null);
    },
    async put(collection, id, value) {
      window.localStorage.setItem(keyFor(collection, id), JSON.stringify(value));
    },
    async delete(collection, id) {
      window.localStorage.removeItem(keyFor(collection, id));
    },
    async clear(collection) {
      idsIn(collection).forEach((id) => window.localStorage.removeItem(keyFor(collection, id)));
    },
  };
}

/** Last-resort backend. Also what server rendering gets. */
function createMemoryBackend(): Backend {
  const tables = new Map<CollectionName, Map<string, unknown>>();
  const table = (collection: CollectionName) => {
    let existing = tables.get(collection);
    if (!existing) {
      existing = new Map();
      tables.set(collection, existing);
    }
    return existing;
  };

  return {
    kind: "memory",
    async get(collection, id) {
      return table(collection).get(id) ?? null;
    },
    async all(collection) {
      return [...table(collection).values()];
    },
    async put(collection, id, value) {
      table(collection).set(id, value);
    },
    async delete(collection, id) {
      table(collection).delete(id);
    },
    async clear(collection) {
      table(collection).clear();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Backend selection                                                   */
/* ------------------------------------------------------------------ */

async function selectBackend(): Promise<Backend> {
  if (typeof window === "undefined") return createMemoryBackend();

  if ("indexedDB" in window) {
    try {
      const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(database) {
          for (const collection of ALL_COLLECTIONS) {
            if (!database.objectStoreNames.contains(collection)) {
              database.createObjectStore(collection);
            }
          }
        },
        blocked() {
          console.warn("[storage] IndexedDB upgrade blocked by another open tab");
        },
      });
      return createIndexedDbBackend(db);
    } catch (error) {
      // Firefox private browsing and some hardened configurations expose
      // indexedDB but throw on open.
      console.warn("[storage] IndexedDB unavailable, falling back to localStorage", error);
    }
  }

  try {
    const probe = `${LS_PREFIX}probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return createLocalStorageBackend();
  } catch {
    console.warn("[storage] localStorage unavailable, falling back to in-memory storage");
    return createMemoryBackend();
  }
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Cached backend promise.
   *
   * Held as the promise rather than the resolved value so that concurrent
   * first-callers share one `openDB` call instead of racing to open the
   * database several times.
   */
  private backend: Promise<Backend> | null = null;

  private resolveBackend(): Promise<Backend> {
    this.backend ??= selectBackend();
    return this.backend;
  }

  /** Which backend is in use. Surfaced in settings for debugging. */
  async describe(): Promise<Backend["kind"]> {
    return (await this.resolveBackend()).kind;
  }

  async get<T>(collection: CollectionName, id: string): Promise<T | null> {
    const backend = await this.resolveBackend();
    return (await backend.get(collection, id)) as T | null;
  }

  async list<T>(collection: CollectionName, filter?: StorageFilter): Promise<T[]> {
    const backend = await this.resolveBackend();
    const records = (await backend.all(collection)) as Record<string, unknown>[];
    return records.filter((record) => matches(record, filter)) as T[];
  }

  async put<T>(collection: CollectionName, id: string, value: T): Promise<void> {
    const backend = await this.resolveBackend();
    const previous = (await backend.get(collection, id)) as Stored<unknown> | null;
    await backend.put(collection, id, withMeta(id, value, previous?._rev ?? null));
  }

  async delete(collection: CollectionName, id: string): Promise<void> {
    const backend = await this.resolveBackend();
    await backend.delete(collection, id);
  }

  async clear(collection: CollectionName): Promise<void> {
    const backend = await this.resolveBackend();
    await backend.clear(collection);
  }
}
