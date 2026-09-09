'use client';

import { useCallback, useEffect, useState } from 'react';

import { accountSession, type AccountSnapshot } from './session';

/**
 * React bindings for the account session.
 *
 * The session itself is a plain singleton so non-React code (services, API
 * route helpers) can use it too. These hooks exist only to get its state into
 * the render cycle and to re-render on change.
 */

export interface AccountSessionHandle {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  isConnected: () => boolean;
  getDid: () => string | null;
  getAccountId: () => string | null;
  getClient: () => AccountSnapshot | null;
  getHumanAnchor: () => string | null;
  isVerifiedHuman: () => boolean;
  init: () => Promise<void>;
}

/**
 * Primary session hook.
 *
 * `client` is null until the session has loaded from browser storage, so
 * callers must guard on it — every consumer already does, since the previous
 * implementation loaded its client asynchronously too.
 */
export const useAccountSession = () => {
  const [client, setClient] = useState<AccountSessionHandle | null>(null);
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await accountSession.init();
        if (cancelled) return;

        setClient({
          connect: () => accountSession.connect(),
          disconnect: () => accountSession.disconnect(),
          isConnected: () => accountSession.isConnected(),
          getDid: () => accountSession.getDid(),
          getAccountId: () => accountSession.getAccountId(),
          getClient: () => accountSession.getClient(),
          getHumanAnchor: () => accountSession.getHumanAnchor(),
          isVerifiedHuman: () => accountSession.isVerifiedHuman(),
          init: () => accountSession.init(),
        });
        setSnapshot(accountSession.getSnapshot());
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load account session:', err);
        setError(err instanceof Error ? err : new Error('Failed to load account session'));
        setIsLoading(false);
      }
    };

    load();
    const unsubscribe = accountSession.subscribe(setSnapshot);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const getAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      return accountSession.isConnected();
    } catch (err) {
      console.error('Failed to check auth status:', err);
      return false;
    }
  }, []);

  /**
   * The account key, as a promise.
   *
   * Kept async even though the value is now synchronous, because ~10
   * components await it.
   */
  const getDidId = useCallback(async (): Promise<string | null> => {
    try {
      await accountSession.init();
      return accountSession.getAccountId();
    } catch (err) {
      console.error('Failed to get account id:', err);
      return null;
    }
  }, []);

  return {
    client,
    snapshot,
    isLoading,
    error,
    getAuthStatus,
    getDidId,
    /** True once Selfie Check has passed for this account. */
    isVerifiedHuman: Boolean(snapshot?.humanAnchor),
    humanAnchor: snapshot?.humanAnchor ?? null,
  };
};

/**
 * Loads the profile repository.
 *
 * Kept as an async-loading hook returning `{ service, isLoading, error }`
 * because eight components destructure exactly that shape. The dynamic import
 * is retained so the repository and its storage backend stay out of the
 * initial bundle.
 */
export const useProfileRepository = () => {
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { ProfileRepository } = await import('../profile-repository');
        if (cancelled) return;
        setService(ProfileRepository);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load profile repository:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile repository'));
        setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { service, isLoading, error };
};
