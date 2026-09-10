import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Server-side registry of which humans have claimed a profile.
 *
 * This is the anti-catfishing mechanism, and it only works server-side. The
 * browser cannot be trusted to tell us whether a nullifier is already taken —
 * that check has to happen somewhere the user cannot reach, or a second signup
 * simply lies about it.
 *
 * Storage is a JSON file rather than a database because the app has no
 * database and the demo needs to survive a page reload, not a production
 * load. The access pattern (read-modify-write under a promise chain) is
 * single-process only; a real deployment would put a unique index on
 * `(nullifier, action)` in Postgres, which is what World's docs recommend.
 */

const REGISTRY_PATH = join(process.cwd(), '.data', 'nullifiers.json');

interface RegistryEntry {
  /**
   * The nullifier, as a decimal string.
   *
   * World's docs specify `NUMERIC(78, 0)` for this value. Hex and decimal
   * representations of the same nullifier must not be treated as different
   * people, so everything is normalised to decimal on the way in.
   */
  nullifier: string;
  action: string;
  /**
   * The account this human owns, derived from the nullifier.
   *
   * Must match what the client session promotes itself to on verification, or
   * every later route that authorises by nullifier rejects the very session
   * that just verified.
   */
  accountId: string;
  /**
   * The session that presented the proof.
   *
   * `accountId` is a function of the nullifier, so it cannot distinguish a
   * second claimant from the first. This can: it records the id the session
   * held *before* promotion, which is what duplicate detection compares.
   */
  claimant?: string;
  issuerSchemaId: number;
  verifiedAt: string;
}

interface Registry {
  entries: RegistryEntry[];
}

/**
 * Serialises access so two concurrent verifications cannot both read "not
 * taken" and both write. Without this the uniqueness guarantee is racy.
 */
let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation, operation);
  // Keep the chain alive even if this operation rejects.
  queue = result.catch(() => undefined);
  return result;
}

/**
 * Normalises a nullifier to a decimal string.
 *
 * World returns hex (`0x…`). Storing decimal matches the documented
 * `NUMERIC(78, 0)` column type and makes the comparison representation-proof.
 */
export function normaliseNullifier(nullifier: string): string {
  const trimmed = nullifier.trim();
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    return BigInt(trimmed).toString(10);
  }
  if (/^[0-9]+$/.test(trimmed)) {
    return trimmed;
  }
  throw new Error('Nullifier is neither hex nor decimal');
}

async function read(): Promise<Registry> {
  try {
    const raw = await readFile(REGISTRY_PATH, 'utf8');
    return JSON.parse(raw) as Registry;
  } catch {
    return { entries: [] };
  }
}

async function write(registry: Registry): Promise<void> {
  await mkdir(dirname(REGISTRY_PATH), { recursive: true });
  await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
}

export interface ClaimResult {
  ok: boolean;
  /** Set when the claim was rejected because this human already has a profile. */
  conflict?: {
    accountId: string;
    verifiedAt: string;
  };
}

/**
 * Claims a nullifier for an account.
 *
 * Succeeds if this human has never claimed a profile for this action, or if
 * they are re-verifying onto the same account (a returning user on a new
 * device). Fails if a *different* account already holds this nullifier — that
 * is a second person trying to be the same human, or one person trying to run
 * two profiles.
 */
export async function claimNullifier(params: {
  nullifier: string;
  action: string;
  accountId: string;
  claimant: string;
  issuerSchemaId: number;
}): Promise<ClaimResult> {
  const nullifier = normaliseNullifier(params.nullifier);

  return await serialise(async () => {
    const registry = await read();

    const existing = registry.entries.find(
      (entry) => entry.nullifier === nullifier && entry.action === params.action,
    );

    if (existing) {
      // Two ways this is legitimately the same person: the session that first
      // claimed the nullifier is re-verifying, or an already-promoted session
      // is (its id is the derived account id by then).
      const sameClaimant =
        params.claimant === existing.claimant || params.claimant === existing.accountId;

      if (!sameClaimant) {
        return {
          ok: false,
          conflict: { accountId: existing.accountId, verifiedAt: existing.verifiedAt },
        };
      }

      // Same human, same account: refresh the timestamp so credential expiry
      // is measured from the most recent check.
      existing.verifiedAt = new Date().toISOString();
      await write(registry);
      return { ok: true };
    }

    registry.entries.push({
      nullifier,
      action: params.action,
      accountId: params.accountId,
      claimant: params.claimant,
      issuerSchemaId: params.issuerSchemaId,
      verifiedAt: new Date().toISOString(),
    });
    await write(registry);
    return { ok: true };
  });
}

/** Looks up the account holding a nullifier, if any. */
export async function accountForNullifier(
  nullifier: string,
  action: string,
): Promise<string | null> {
  const normalised = normaliseNullifier(nullifier);
  const registry = await read();
  return (
    registry.entries.find((entry) => entry.nullifier === normalised && entry.action === action)
      ?.accountId ?? null
  );
}

/** Whether an account has a live verification on record. */
export async function isAccountVerified(accountId: string): Promise<boolean> {
  const registry = await read();
  return registry.entries.some((entry) => entry.accountId === accountId);
}

/** Releases a claim, so the demo can be re-run without wiping the file by hand. */
export async function releaseNullifier(nullifier: string, action: string): Promise<void> {
  const normalised = normaliseNullifier(nullifier);
  await serialise(async () => {
    const registry = await read();
    registry.entries = registry.entries.filter(
      (entry) => !(entry.nullifier === normalised && entry.action === action),
    );
    await write(registry);
  });
}
