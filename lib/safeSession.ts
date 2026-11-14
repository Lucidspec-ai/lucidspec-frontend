'use client';

import { AuthError, type Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { readCachedSession } from './sessionCache';
import { TimeoutError, withTimeout } from './withTimeout';

type SessionResponse = Awaited<ReturnType<typeof supabase.auth.getSession>>;

type Options = {
  timeoutMs?: number;
  allowStale?: boolean;
  preferCache?: boolean;
};

export type SafeSessionResponse = SessionResponse & {
  source: 'network' | 'cache' | 'timeout';
};

const DEFAULT_TIMEOUT_MS = 4000;

export async function safeGetSession(options: Options = {}): Promise<SafeSessionResponse> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, allowStale = false, preferCache = false } = options;
  const cached = readCachedSession({ allowStale });

  if (preferCache && cached) {
    return { data: { session: cached }, error: null, source: 'cache' };
  }

  try {
    const result = await withTimeout(supabase.auth.getSession(), timeoutMs);
    return Object.assign({ source: 'network' as const }, result);
  } catch (err) {
    if (cached) {
      return { data: { session: cached }, error: null, source: 'cache' };
    }

    const message = err instanceof Error ? err.message : 'Unable to fetch session';
    const error =
      err instanceof AuthError ? err : new AuthError(message, err instanceof TimeoutError ? 408 : 0);
    const source = err instanceof TimeoutError ? 'timeout' : 'network';
    return { data: { session: null }, error, source };
  }
}
