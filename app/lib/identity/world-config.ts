/**
 * World ID configuration.
 *
 * Shared by the client widget and the server verification route. Values that
 * must never reach the browser (the RP signing key) are read only in
 * server-side modules and are deliberately absent from this file's public
 * exports.
 */

/**
 * Selfie Check's credential (issuer schema) id.
 *
 * Documented at https://docs.world.org/world-id/credentials/11 — the
 * credential is id 11, valid for 90 days, issued by Tools for Humanity.
 *
 * The server asserts this id against `issuer_schema_id` in the returned
 * proof. That matters: the *preset* used to request a credential is what the
 * client asks for, but `issuer_schema_id` is what World actually issued. A
 * client that asked for a weaker credential, or a replayed payload from a
 * different flow, is caught by checking the issued id rather than trusting
 * the request.
 */
export const SELFIE_CHECK_SCHEMA_ID = 11;

/** Credential validity, per the Selfie Check docs. Used to show expiry. */
export const SELFIE_CHECK_VALIDITY_DAYS = 90;

/**
 * The action this app verifies against.
 *
 * Nullifiers are scoped per (action, person), so this string is load-bearing:
 * change it and every existing verified user becomes a new person. World's
 * uniqueness constraint is on `(nullifier, action)`.
 */
export const WORLD_ACTION = process.env.NEXT_PUBLIC_WORLD_ACTION_ID || 'proof-of-heart-signup';

export const WORLD_APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || '';
export const WORLD_RP_ID = process.env.NEXT_PUBLIC_WORLD_RP_ID || '';

/**
 * Which credential preset the widget requests.
 *
 * Configurable because the Selfie Check credential page does not document its
 * preset identifier, and the sandbox testing guide says to obtain it from a
 * World point of contact. Recorded in FEEDBACK.md as a documentation gap.
 *
 * Whatever value is used here, the server still enforces
 * `issuer_schema_id === SELFIE_CHECK_SCHEMA_ID`, so a misconfigured preset
 * fails closed rather than silently accepting a weaker credential.
 */
export const WORLD_CREDENTIAL_PRESET =
  process.env.NEXT_PUBLIC_WORLD_CREDENTIAL_PRESET || 'selfieCheck';

/** World's hosted verification endpoint for the v4 protocol. */
export function worldVerifyEndpoint(rpId: string): string {
  return `https://developer.world.org/api/v4/verify/${rpId}`;
}

/**
 * Whether real World credentials are configured.
 *
 * When false the app runs its sandbox path instead: the flow, the server
 * round-trip, the uniqueness enforcement and the UI are all identical, but
 * the proof is locally generated and clearly labelled as unverified. This
 * keeps the app demonstrable before Sandbox access is granted, without ever
 * letting a fake proof masquerade as a real one.
 */
export function isWorldConfigured(): boolean {
  return Boolean(WORLD_APP_ID && WORLD_RP_ID);
}

export interface HumanVerification {
  /** The nullifier hash, hex. Unique per person per action. */
  nullifierHash: string;
  verifiedAt: string;
  credentialType: string;
  /** Issued credential id. 11 for Selfie Check. */
  issuerSchemaId: number;
  /** False when produced by the local sandbox path rather than World. */
  live: boolean;
}
