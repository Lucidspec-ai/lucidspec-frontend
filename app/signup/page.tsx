// app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SetupShell } from '@/components/ui/SetupShell';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/generator';
  // A fresh signup always lands on the readiness-standards onboarding step
  // first (skippable there, then chained into "connect your tracker",
  // also skippable), rather than going straight to `next` -- there's no
  // Supabase SIGNED_UP event to key off of, so this redirect target is the
  // only reliable "this is a brand-new signup" signal.
  const postSignupDestination = `/onboarding/readiness-standards?next=${encodeURIComponent(next)}`;

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${postSignupDestination}`,
        },
      });
      if (error) {
        const msg = error.message || 'Sign up failed.';
        setError(msg);
        toast.error(msg);
        return;
      }
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        // Supabase signals an existing account by returning a user with no identities.
        const msg = 'An account with this email already exists. Please sign in.';
        setError(msg);
        toast.error(msg);
        return;
      }
      // If email confirmations are enabled, Supabase sends a magic link:
      if (data?.user && !data.session) {
        setInfo('Check your email for a confirmation link to complete signup.');
        toast.success('Sign up started — check your email', { durationMs: 3500 });
      } else if (data?.session) {
        // If confirmations are disabled, a session is returned immediately.
        toast.success('Account created');
        router.replace(postSignupDestination);
      }
    } catch (err: any) {
      const msg = err?.message || 'Sign up failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SetupShell
      step={0}
      title="Create your account"
      description="Start with your account, then review your readiness standards and optionally connect a tracker."
    >
        <form onSubmit={onSignUp} aria-busy={submitting} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              required
              disabled={submitting}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              required
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 disabled:bg-slate-50"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {info && (
          <p role="status" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">{info}</p>
        )}
        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}</p>
        )}

        <p className="mt-6 border-t border-slate-100 pt-6 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href={`/signin?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-700 underline">
            Sign in
          </Link>
        </p>
    </SetupShell>
  );
}
