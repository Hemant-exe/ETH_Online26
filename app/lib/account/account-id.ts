/**
 * Account id derivation.
 *
 * Deliberately not in `session.ts`: that module is `'use client'`, and the
 * server needs this same function to record a nullifier against the account
 * the session will become. Two copies of this rule would drift, and a drift
 * here silently breaks authorisation on every route that resolves an account
 * from a nullifier.
 */

/**
 * The account id for a verified human.
 *
 * A pure function of the nullifier, so the account a person lands on is the
 * same one whichever device they verify from.
 */
export function accountIdFromAnchor(nullifierHash: string): string {
  return `poh_${nullifierHash.replace(/^0x/, '').slice(0, 40)}`;
}
