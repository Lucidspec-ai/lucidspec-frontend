// lib/supabase.ts
'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const pubKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!url || !pubKey) {
  console.warn(
    'Missing Supabase URL or anon/publishable key (check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

export const supabase = createClient(url, pubKey, {
  auth: {
    // Use sessionStorage so closing the browser clears the session
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE requires the "code verifier" it stashes at request time to still be
    // there when the emailed link is opened -- but that link almost always
    // opens in a new tab, and sessionStorage doesn't carry over between tabs,
    // so every recovery/confirmation link failed as "invalid or expired"
    // regardless of freshness. Implicit hands back the session tokens directly
    // in the redirect URL instead, so no stored secret is needed to redeem it.
    flowType: 'implicit',
  },
});
