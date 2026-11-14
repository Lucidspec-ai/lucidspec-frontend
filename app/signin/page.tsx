'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';
import { toast } from '@/lib/toast';
import { SetupShell } from '@/components/ui/SetupShell';

export default function SignInPage() {
  const router = useRouter();
  const qp = useSearchParams();
  const next = qp.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  // If already signed in, bounce immediately (prevents “spinning” UI)
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await safeGetSession();
      if (!alive) return;
      if (data.session) {
        // Redirect immediately if already logged in
        router.replace(next);
      }
    })();
    return () => { alive = false; };
  }, [router, next]);

  // Listen for auth events (GitHub/OAuth flow returns here)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (sess) {
        // Redirect on auth state change (e.g., login)
        router.replace(next);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, next]);

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message || 'Sign in failed';
        setErr(msg);
        toast.error(msg);
        return;
      }
      toast.success('Signed in');
      // Navigate right away to the next page after sign-in
      router.replace(next);
    } finally {
      setLoading(false);
    }
  };

  // GitHub OAuth intentionally disabled/hidden

  return (
    <SetupShell title="Sign in to LucidSpec" description="Continue with your tickets, readiness standards, and connected tools.">
      <form
        onSubmit={signInWithPassword}
        aria-busy={loading}
        className="space-y-5"
      >
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@company.com"
            disabled={loading}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className="text-sm font-semibold text-slate-800">Password</label>
            <Link href="/forgot-password" className="py-2 text-xs font-semibold text-blue-700 underline hover:no-underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="signin-password"
            type="password"
            name="password"
            disabled={loading}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 disabled:bg-slate-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {err && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {/* OAuth providers hidden */}
      </form>
      <p className="mt-6 border-t border-slate-100 pt-6 text-sm text-slate-600">
        New to LucidSpec?{' '}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-700 underline">Create an account</Link>
      </p>
    </SetupShell>
  );
}
