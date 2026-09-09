'use client';

import { accountSession } from '../account/session';
import { migrateAnonymousData } from '../account/migrate';
import { ProfileService } from '../profile-service';
import type { HumanVerification } from './world-config';

/**
 * Client half of the Selfie Check flow.
 *
 * Deliberately thin. It fetches a server-signed request context, hands the
 * resulting proof straight back to the server, and applies whatever the server
 * says. It never inspects a proof, never derives a nullifier, and never
 * decides that verification succeeded — all three are the server's job (see
 * `app/api/world/verify/route.ts`).
 */

export interface RequestContext {
  live: boolean;
  action: string;
  rp_context: {
    rp_id: string;
    nonce: string;
    created_at: number;
    expires_at: number;
    signature: string;
  };
}

export class SelfieCheckError extends Error {
  readonly code?: string;
  readonly conflict?: { accountId: string; verifiedAt: string };

  constructor(message: string, options?: { code?: string; conflict?: SelfieCheckError['conflict'] }) {
    super(message);
    this.name = 'SelfieCheckError';
    this.code = options?.code;
    this.conflict = options?.conflict;
  }
}

/**
 * Asks the server for a signed IDKit request context.
 *
 * `live: false` means World credentials are not configured and the caller
 * should run `verifySandbox` instead of opening the widget.
 */
export async function fetchRequestContext(): Promise<RequestContext> {
  const response = await fetch('/api/world/context', { method: 'POST' });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new SelfieCheckError(detail?.error || 'Could not start World ID verification');
  }
  return (await response.json()) as RequestContext;
}

/**
 * Submits an IDKit proof for server-side verification.
 *
 * The payload is forwarded unchanged, as World's docs require.
 */
export async function verifyProof(payload: unknown): Promise<HumanVerification> {
  await accountSession.connect();
  const accountId = accountSession.getAccountId();

  return await postVerification({ payload, accountId });
}

/**
 * Sandbox equivalent of `verifyProof`.
 *
 * `seed` stands in for a person: the same seed is the same human, so entering
 * a seed that has already been used exercises the duplicate-rejection path
 * exactly as a repeat Selfie Check would.
 */
export async function verifySandbox(seed: string): Promise<HumanVerification> {
  await accountSession.connect();
  const accountId = accountSession.getAccountId();

  return await postVerification({ sandboxSeed: seed, accountId });
}

async function postVerification(body: Record<string, unknown>): Promise<HumanVerification> {
  const response = await fetch('/api/world/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new SelfieCheckError(result?.error || 'Verification failed', {
      code: result?.code,
      conflict: result?.conflict,
    });
  }

  const verification = result as HumanVerification;
  await applyVerification(verification);
  return verification;
}

/**
 * Promotes the local session to verified and carries existing data across.
 *
 * Verifying changes the account id (it becomes a function of the nullifier),
 * so anything the user entered while anonymous has to be re-keyed or it is
 * orphaned. The profile row is then re-saved so `humanAnchor` lands on it.
 */
async function applyVerification(verification: HumanVerification): Promise<void> {
  const { previousAccountId, accountId } = await accountSession.attachHumanAnchor({
    nullifierHash: verification.nullifierHash,
    verifiedAt: verification.verifiedAt,
    credentialType: verification.credentialType,
  });

  await migrateAnonymousData(previousAccountId, accountId);

  // Stamps humanAnchor / verifiedAt / credentialType onto the profile. Reads
  // them from the session rather than the argument, which is the same source
  // of truth the rest of the app uses.
  const existing = await ProfileService.getProfile(accountId);
  if (existing) {
    await ProfileService.saveProfile({ did: accountId });
  }
}

/** Current verification state, for badges and gating. */
export function getVerificationState(): {
  isVerified: boolean;
  nullifierHash: string | null;
  verifiedAt: string | null;
  credentialType: string | null;
} {
  const snapshot = accountSession.getSnapshot();
  return {
    isVerified: Boolean(snapshot?.humanAnchor),
    nullifierHash: snapshot?.humanAnchor ?? null,
    verifiedAt: snapshot?.verifiedAt ?? null,
    credentialType: snapshot?.credentialType ?? null,
  };
}
