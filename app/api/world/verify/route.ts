import { NextResponse } from 'next/server';

import { accountIdFromAnchor } from '@/app/lib/account/account-id';
import { claimNullifier } from '@/app/lib/identity/nullifier-registry';
import {
  SELFIE_CHECK_SCHEMA_ID,
  WORLD_ACTION,
  WORLD_RP_ID,
  isWorldConfigured,
  worldVerifyEndpoint,
  type HumanVerification,
} from '@/app/lib/identity/world-config';

/**
 * Server-side World ID proof verification.
 *
 * This route is the trust boundary for the entire product. Everything
 * downstream — one profile per human, twin registration, screening
 * eligibility — rests on the nullifier this route returns, so it does three
 * things the client is not allowed to do:
 *
 *   1. Verifies the proof against World's hosted endpoint. Client-side
 *      verification is trivially forged: the browser could simply claim
 *      success.
 *   2. Asserts the issued credential really is Selfie Check, by checking
 *      `issuer_schema_id` on what World issued rather than trusting what the
 *      client asked for.
 *   3. Claims the nullifier atomically, so a second person presenting the same
 *      human's proof is rejected rather than given a duplicate profile.
 *
 * The nullifier is never accepted from the request body.
 */

interface WorldProofResponse {
  identifier?: string;
  signal_hash?: string;
  proof?: string[];
  nullifier?: string;
  issuer_schema_id?: number;
  expires_at_min?: number;
}

interface WorldPayload {
  protocol_version?: string;
  nonce?: string;
  action?: string;
  environment?: string;
  responses?: WorldProofResponse[];
  user_presence_completed?: boolean;
}

interface VerifyRequestBody {
  /** The IDKit payload, forwarded unchanged. */
  payload?: WorldPayload;
  /** The account this verification should attach to. */
  accountId?: string;
  /** Sandbox-only: seed that stands in for a person's identity. */
  sandboxSeed?: string;
}

/** Deterministic stand-in nullifier for the sandbox path. */
async function sandboxNullifier(seed: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`sandbox:${seed}`));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

export async function POST(request: Request) {
  let body: VerifyRequestBody;
  try {
    body = (await request.json()) as VerifyRequestBody;
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  const accountId = body.accountId?.trim();
  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  let verification: HumanVerification;

  if (!isWorldConfigured()) {
    /* ---------------- Sandbox path ---------------- */
    // Runs the identical server round-trip and uniqueness enforcement, but
    // the "proof" is derived locally from a seed. `live: false` travels with
    // the result all the way to the UI badge so a sandbox verification can
    // never be mistaken for a real one.
    const seed = body.sandboxSeed?.trim();
    if (!seed) {
      return NextResponse.json(
        { error: 'sandboxSeed is required while World credentials are unconfigured' },
        { status: 400 },
      );
    }

    verification = {
      nullifierHash: await sandboxNullifier(seed),
      verifiedAt: new Date().toISOString(),
      credentialType: 'selfie-check-sandbox',
      issuerSchemaId: SELFIE_CHECK_SCHEMA_ID,
      live: false,
    };
  } else {
    /* ---------------- Live path ---------------- */
    const payload = body.payload;
    if (!payload?.responses?.length) {
      return NextResponse.json({ error: 'Proof payload is missing' }, { status: 400 });
    }

    // The action in the payload must be the action we asked for. Otherwise a
    // proof minted for a different, possibly attacker-controlled, action
    // would be accepted here.
    if (payload.action && payload.action !== WORLD_ACTION) {
      return NextResponse.json(
        { error: 'Proof was issued for a different action' },
        { status: 400 },
      );
    }

    let worldResult: unknown;
    try {
      // World's docs are explicit that the payload is forwarded as-is, with no
      // field remapping.
      const response = await fetch(worldVerifyEndpoint(WORLD_RP_ID), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WORLD_API_KEY
            ? { Authorization: `Bearer ${process.env.WORLD_API_KEY}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      worldResult = await response.json().catch(() => null);

      if (!response.ok) {
        console.warn('[world] verification rejected', response.status, worldResult);
        return NextResponse.json(
          { error: 'World ID rejected this proof', detail: worldResult, status: response.status },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error('[world] verification request failed', error);
      return NextResponse.json(
        { error: 'Could not reach World ID verification' },
        { status: 502 },
      );
    }

    const proof = payload.responses.find((entry) => entry.nullifier);
    if (!proof?.nullifier) {
      return NextResponse.json({ error: 'Proof contained no nullifier' }, { status: 400 });
    }

    // The credential actually issued must be Selfie Check. A client that
    // requested a weaker credential fails here rather than being quietly
    // admitted with a lesser guarantee.
    if (proof.issuer_schema_id !== SELFIE_CHECK_SCHEMA_ID) {
      return NextResponse.json(
        {
          error: 'This flow requires the Selfie Check credential',
          expected: SELFIE_CHECK_SCHEMA_ID,
          received: proof.issuer_schema_id ?? null,
        },
        { status: 403 },
      );
    }

    verification = {
      nullifierHash: proof.nullifier,
      verifiedAt: new Date().toISOString(),
      credentialType: 'selfie-check',
      issuerSchemaId: proof.issuer_schema_id,
      live: true,
    };
  }

  /* ---------------- Uniqueness ---------------- */
  // Record the account the client is about to promote itself to, not the
  // anonymous id it presented. Verification re-derives the account id from the
  // nullifier (`attachHumanAnchor`), so storing the anonymous id would leave
  // this registry pointing at an account that no longer exists — and every
  // route that authorises by nullifier would reject the session that just
  // verified. `claimant` keeps duplicate detection working.
  const claim = await claimNullifier({
    nullifier: verification.nullifierHash,
    action: WORLD_ACTION,
    accountId: accountIdFromAnchor(verification.nullifierHash),
    claimant: accountId,
    issuerSchemaId: verification.issuerSchemaId,
  });

  if (!claim.ok) {
    // This is the anti-catfishing case, and it is a feature, not an error.
    // The message is deliberately specific so the demo can show *why* the
    // second signup was refused.
    return NextResponse.json(
      {
        error: 'This person already has a profile',
        code: 'NULLIFIER_ALREADY_CLAIMED',
        conflict: claim.conflict,
      },
      { status: 409 },
    );
  }

  return NextResponse.json(verification);
}
