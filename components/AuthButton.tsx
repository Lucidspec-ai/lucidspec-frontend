// components/AuthButton.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';

type Props = { className?: string };

export default function AuthButton({ className = '' }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // keep header in sync with auth state
  useEffect(() => {
    let mounted = true;

    safeGetSession().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setEmail(s?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSignOut = async () => {
    try {
      setBusy(true);
      await supabase.auth.signOut();
      // Hard redirect to ensure *everything* is cleared and UI is fresh
      window.location.href = '/';
    } finally {
      setBusy(false);
    }
  };

  // Not signed in → show Sign in link
  if (!email) {
    return (
      <Link
        href="/signin"
        className={`px-3 py-1 rounded border hover:bg-gray-50 ${className}`}
      >
        Sign in
      </Link>
    );
  }

  // Signed in → show Sign out button
  return (
    <button
      onClick={onSignOut}
      disabled={busy}
      className={`px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-60 ${className}`}
      title={email}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
