'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (!email.trim()) {
      setErr('Please enter your email.');
      toast.info('Please enter your email');
      return;
    }

    try {
      setSubmitting(true);
      // Supabase will email a link that redirects to /reset-password
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMsg('Check your email for a password reset link.');
      toast.success('Reset link sent to your email');
    } catch (e: any) {
      const msg = e?.message || 'Failed to send reset email.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#212529] font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-sm border p-6 rounded shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Forgot your password?</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter the email you used to sign up. We&apos;ll send you a link to reset it.
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-2 border rounded"
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        {msg && <div className="mt-4 text-green-700 bg-green-50 border border-green-200 p-2 rounded">{msg}</div>}
        {err && <div className="mt-4 text-red-700 bg-red-50 border border-red-200 p-2 rounded">{err}</div>}

        <div className="mt-6 text-sm text-gray-600">
          <Link href="/signin" className="underline hover:no-underline">Back to Sign in</Link>
        </div>
      </div>
    </main>
  );
}
