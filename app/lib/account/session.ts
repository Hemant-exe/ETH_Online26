'use client';

/**
 * The user's local account session.
 *
 * An account in this app is not a custodial login. It is a locally-held
 * identifier plus, once the user has passed Selfie Check, a World ID nullifier
 * that acts as their *human anchor*. The nullifier is what makes the account
 * unique per person rather than per browser, and it is the value everything
 * downstream — profile uniqueness, agent registration, screening eligibility —
 * is keyed on.
 *
 * Three identifiers, deliberately kept distinct:
 *
 *   accountId    Stable key for this account's rows. Derived from the human
 *                anchor once verified, so one person always resolves to one
 *                account id. Anonymous until then.
 *   humanAnchor  The World ID nullifier hash. Proof a real, unique human is
 *                behind this account. Null until Selfie Check passes.
 *   walletAddress  EVM address, used only to mint and hold the profile NFT.
 *                Intentionally separable: a user can be a verified human with
 *                no wallet, or hold a wallet without being verified.
 */

const SESSION_KEY = 'poh:session';

export interface AccountSnapshot {
  accountId: string;
  humanAnchor: string | null;
  walletAddress: string | null;
  verifiedAt: string | null;
  credentialType: string | null;
}

/**
 * Derives the account id from a human anchor.
 *
 * Deterministic, so the same person re-verifying on a new device lands on the
 * same account id and finds their own data rather than a fresh empty account.
 * The nullifier is already a hash, so truncating it is sufficient here; it is
 * never used as a security boundary on its own.
 */
export function accountIdFromAnchor(nullifierHash: string): string {
  return `poh_${nullifierHash.replace(/^0x/, '').slice(0, 40)}`;
}

function anonymousAccountId(): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `anon_${random.slice(0, 32)}`;
}

type Listener = (snapshot: AccountSnapshot) => void;

class AccountSession {
  private snapshot: AccountSnapshot | null = null;
  private listeners = new Set<Listener>();
  private initialised = false;

  /**
   * Loads any persisted session from the browser.
   *
   * Safe to call repeatedly and safe to call during server rendering, where it
   * is a no-op. Several components call this before every operation as a
   * defensive "am I ready" check, so it must stay cheap.
   */
  public async init(): Promise<void> {
    if (this.initialised || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) this.snapshot = JSON.parse(raw) as AccountSnapshot;
    } catch {
      // A corrupt session should log the user out, not crash the app.
      this.snapshot = null;
    }

    this.initialised = true;
  }

  /**
   * Ensures a session exists, creating an anonymous one if needed.
   *
   * Returns true when a session is available. Unlike the wallet-vault flow
   * this replaces, it never opens a modal and never fails for network
   * reasons — an unverified user is a valid, if limited, state. Becoming a
   * *verified* user is a separate, explicit step (`attachHumanAnchor`).
   */
  public async connect(): Promise<boolean> {
    await this.init();
    if (typeof window === 'undefined') return false;

    if (!this.snapshot) {
      this.snapshot = {
        accountId: anonymousAccountId(),
        humanAnchor: null,
        walletAddress: null,
        verifiedAt: null,
        credentialType: null,
      };
      this.persist();
    }

    return true;
  }

  public disconnect(): void {
    this.snapshot = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SESSION_KEY);
      } catch {
        /* storage may be unavailable; the in-memory session is cleared regardless */
      }
    }
    this.emit();
  }

  public isConnected(): boolean {
    return this.snapshot !== null;
  }

  /** The account key that rows are stored under. */
  public getAccountId(): string | null {
    return this.snapshot?.accountId ?? null;
  }

  /**
   * @deprecated Use `getAccountId`. Retained because ~15 components still read
   * the account key under this name; removed in the rename pass.
   */
  public getDid(): string | null {
    return this.getAccountId();
  }

  /**
   * Truthy once `init` has run.
   *
   * Components use this as an "is the session layer ready" probe before
   * calling anything else, which is why it returns the snapshot rather than a
   * boolean — the previous implementation returned a client object here and
   * callers only ever tested it for truthiness.
   */
  public getClient(): AccountSnapshot | null {
    return this.snapshot;
  }

  /** The World ID nullifier, or null if this account has not passed Selfie Check. */
  public getHumanAnchor(): string | null {
    return this.snapshot?.humanAnchor ?? null;
  }

  public isVerifiedHuman(): boolean {
    return Boolean(this.snapshot?.humanAnchor);
  }

  /**
   * Promotes an anonymous session to a verified-human one.
   *
   * Call this *only* with a nullifier that came back from the server-side
   * verification route. Trusting a client-supplied nullifier would make the
   * whole human-uniqueness guarantee decorative.
   *
   * Because the account id is derived from the anchor, this changes the
   * account id. Any rows written while anonymous are re-keyed by the caller
   * (see `migrateAnonymousData` in `account/migrate.ts`).
   */
  public async attachHumanAnchor(params: {
    nullifierHash: string;
    verifiedAt: string;
    credentialType: string;
  }): Promise<{ previousAccountId: string | null; accountId: string }> {
    await this.connect();

    const previousAccountId = this.snapshot?.accountId ?? null;
    const accountId = accountIdFromAnchor(params.nullifierHash);

    this.snapshot = {
      accountId,
      humanAnchor: params.nullifierHash,
      walletAddress: this.snapshot?.walletAddress ?? null,
      verifiedAt: params.verifiedAt,
      credentialType: params.credentialType,
    };
    this.persist();

    return { previousAccountId, accountId };
  }

  public async attachWallet(walletAddress: string): Promise<void> {
    await this.connect();
    if (!this.snapshot) return;
    this.snapshot = { ...this.snapshot, walletAddress };
    this.persist();
  }

  public getWalletAddress(): string | null {
    return this.snapshot?.walletAddress ?? null;
  }

  public getSnapshot(): AccountSnapshot | null {
    return this.snapshot;
  }

  /** Subscribe to session changes. Returns an unsubscribe function. */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persist(): void {
    if (typeof window !== 'undefined' && this.snapshot) {
      try {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(this.snapshot));
      } catch {
        /* non-fatal: the session still works for this page load */
      }
    }
    this.emit();
  }

  private emit(): void {
    if (!this.snapshot) return;
    const current = this.snapshot;
    this.listeners.forEach((listener) => listener(current));
  }
}

export const accountSession = new AccountSession();
