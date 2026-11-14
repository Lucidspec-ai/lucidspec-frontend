import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ClientResult = { client: SupabaseClient | null; error: string | null };

export function createServerSupabaseClient(): ClientResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null;

  if (!url || !key) {
    return {
      client: null,
      error:
        'Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    };
  }

  const client = createClient(url, key, {
    auth: {
      // No persisted session on the server; these calls are public
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return { client, error: null };
}
