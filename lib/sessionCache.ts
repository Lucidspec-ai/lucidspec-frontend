'use client';

import type { Session } from '@supabase/supabase-js';

type Options = {
  allowStale?: boolean;
  staleMarginMs?: number;
};

const DEFAULT_STALE_MARGIN_MS = 60_000; // 1 minute

function getStorageKey() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) return null;
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function isFreshSession(session: Session | null, allowStale: boolean, staleMarginMs: number) {
  if (!session || !session.access_token) return false;
  if (allowStale) return true;
  if (!session.expires_at) return true;
  const expiresAtMs = session.expires_at * 1000;
  return expiresAtMs - staleMarginMs > Date.now();
}

/**
 * Read the most recent Supabase session from sessionStorage.
 * Returns null if there is no cached session or it is stale.
 */
export function readCachedSession(opts: Options = {}): Session | null {
  if (typeof window === 'undefined') return null;
  const allowStale = opts.allowStale ?? false;
  const staleMarginMs = opts.staleMarginMs ?? DEFAULT_STALE_MARGIN_MS;
  const storageKey = getStorageKey();
  if (!storageKey) return null;

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const baseSession = parsed?.currentSession ?? parsed;
    if (!baseSession) return null;

    const session: Session = { ...baseSession };

    if (!session.user) {
      const userRaw = window.sessionStorage.getItem(`${storageKey}-user`);
      if (userRaw) {
        const parsedUser = JSON.parse(userRaw);
        if (parsedUser?.user) {
          session.user = parsedUser.user;
        }
      }
    }

    return isFreshSession(session, allowStale, staleMarginMs) ? session : null;
  } catch (err) {
    console.warn('Failed to read cached Supabase session', err);
    return null;
  }
}
