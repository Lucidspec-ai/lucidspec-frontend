'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';
import { toast } from '@/lib/toast';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      setErr('');
      // 1) See if we already have a session (Supabase included a token in the URL)
      const { data } = await safeGetSession();
      if (data.session) {
        setHasSession(true);
        setReady(true);
        return;
      }

      // 2) Try PKCE-style exchange (?code=...)
      try {
        const { data: exData, error: exError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (!exError && exData?.session) {
          setHasSession(true);
          setReady(true);
          return;
        }
      } catch {
        // ignore, try legacy next
      }

      // 3) Legacy hash flow (#access_token=...)
      if (window.location.hash.includes('access_token=')) {
        const params = new URLSearchParams(window.location.hash.replace('#', ''));
        const access_token = params.get('access_token') || '';
        const refresh_token = params.get('refresh_token') || '';
        if (access_token && refresh_token) {
          const { data: setData, error: setErrRes } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!setErrRes && setData?.session) {
            setHasSession(true);
            setReady(true);
            return;
          }
        }
      }

      // If we got here, there is no valid session from the link
      setReady(true);
      setHasSession(false);
      setErr('The reset link is invalid or expired. Please request a new link.');
      toast.error('Reset link invalid or expired');
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (pwd.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pwd !== pwd2) {
      setErr('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      setMsg('Password updated! You can now sign in with your new password.');
      toast.success('Password updated');
    } catch (e: any) {
      const msg = e?.message || 'Failed to update password.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking reset link…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#212529] font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-sm border p-6 rounded shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Reset your password</h1>

        {!hasSession ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {err || 'This reset link is not valid. Please request a new one.'}
            </p>
            <Link
              href="/forgot-password"
              className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <form className="space-y-4" onSubmit={onSubmit}>
              <input
                type="password"
                placeholder="New password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full p-2 border rounded"
                autoComplete="new-password"
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                className="w-full p-2 border rounded"
                autoComplete="new-password"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Update password'}
              </button>
            </form>

            {msg && <div className="mt-4 text-green-700 bg-green-50 border border-green-200 p-2 rounded">{msg}</div>}
            {err && <div className="mt-4 text-red-700 bg-red-50 border border-red-200 p-2 rounded">{err}</div>}

            <div className="mt-6 text-sm text-gray-600">
              <Link href="/signin" className="underline hover:no-underline">Back to Sign in</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
