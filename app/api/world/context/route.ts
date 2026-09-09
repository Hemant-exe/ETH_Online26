import { NextResponse } from 'next/server';

import { WORLD_ACTION, WORLD_RP_ID, isWorldConfigured } from '@/app/lib/identity/world-config';

/**
 * Mints a signed request context for the IDKit widget.
 *
 * IDKit requires an `rp_context` — `{ rp_id, nonce, created_at, expires_at,
 * signature }` — signed with the relying party's signing key. World's docs are
 * explicit: "Never generate RP signatures on the client and never expose your
 * RP signing key." So the key is read here, server-side only, and never
 * appears in a `NEXT_PUBLIC_*` variable.
 *
 * The nonce also binds the verification to a single attempt, which is what
 * stops a captured proof from being replayed into a second signup.
 */

/** Context lifetime. Short, because it only has to survive one modal flow. */
const CONTEXT_TTL_SECONDS = 5 * 60;

export async function POST() {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const createdAt = Math.floor(Date.now() / 1000);
  const expiresAt = createdAt + CONTEXT_TTL_SECONDS;

  if (!isWorldConfigured()) {
    // Sandbox path: hand back an unsigned context, clearly flagged. The client
    // then runs its local mock flow instead of opening IDKit. Nothing here is
    // presented as a real proof.
    return NextResponse.json({
      live: false,
      action: WORLD_ACTION,
      rp_context: {
        rp_id: 'sandbox',
        nonce,
        created_at: createdAt,
        expires_at: expiresAt,
        signature: '',
      },
    });
  }

  const signingKey = process.env.WORLD_RP_SIGNING_KEY;
  if (!signingKey) {
    return NextResponse.json(
      {
        error:
          'WORLD_RP_SIGNING_KEY is not set. Add it from the World Developer Portal, or clear NEXT_PUBLIC_WORLD_APP_ID to run the sandbox path.',
      },
      { status: 500 },
    );
  }

  try {
    // Imported lazily so a missing optional dependency degrades to a 500 on
    // this one route rather than breaking every server render.
    const { signRequest } = await import('@worldcoin/idkit-core/signing');

    const signature = await signRequest(
      {
        rp_id: WORLD_RP_ID,
        nonce,
        created_at: createdAt,
        expires_at: expiresAt,
      },
      signingKey,
    );

    return NextResponse.json({
      live: true,
      action: WORLD_ACTION,
      rp_context: {
        rp_id: WORLD_RP_ID,
        nonce,
        created_at: createdAt,
        expires_at: expiresAt,
        signature,
      },
    });
  } catch (error) {
    console.error('[world] failed to sign request context', error);
    return NextResponse.json({ error: 'Could not sign the World ID request' }, { status: 500 });
  }
}
