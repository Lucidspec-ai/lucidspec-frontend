// app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSessionToken } from '@/lib/sessionToken';
import { apiGet, apiPost } from '@/lib/api';
import { normalizePlan, Plan } from '@/lib/plans';

const QUOTA_PLAN_CHANGE_KEY = 'lucidspec_plan_changed_at';

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get('session_id');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checking, setChecking] = useState(true);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const interpretPortalError = (err: unknown) => {
    if (err instanceof Error) {
      const msg = err.message || '';
      if (/no configuration provided/i.test(msg)) {
        return 'Billing portal is not configured yet. Please contact support so we can finish setting it up.';
      }
      return msg;
    }
    return 'Unable to open billing portal.';
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!sessionId) {
        setChecking(false);
        setSessionError('Missing checkout session.');
        return;
      }
      try {
        setSessionError(null);
        const token = await getSessionToken({ timeoutMs: 2500 }).catch(() => null);
        const opts = token ? { token } : {};

        await apiGet(`/stripe/session/${encodeURIComponent(sessionId)}`, opts);
        if (!active) return;

        if (token) {
          const me = await apiGet<any>('/api/me', { token });
          if (!active) return;
          const normalizedPlan = normalizePlan(me?.plan);
          setPlan(normalizedPlan);
          if (normalizedPlan !== 'free') {
            window.localStorage.setItem(QUOTA_PLAN_CHANGE_KEY, String(Date.now()));
          }
        }
      } catch (e) {
        if (!active) return;
        setSessionError(e instanceof Error ? e.message : 'Unable to confirm checkout session.');
        // ignore – backend might still be processing the webhook
      } finally {
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const openPortalFromSession = async () => {
    if (!sessionId) {
      setPortalError('Missing checkout session.');
      return;
    }

    setPortalBusy(true);
    setPortalError(null);
    try {
      const token = await getSessionToken({ timeoutMs: 2500 }).catch(() => null);
      const opts = token ? { token } : {};
      const { url } = await apiPost<{ url: string }>(
        '/stripe/portal/from-session',
        { session_id: sessionId },
        opts
      );
      window.location.href = url;
    } catch (e) {
      console.error('Failed to open billing portal from session', e);
      setPortalError(interpretPortalError(e));
    } finally {
      setPortalBusy(false);
    }
  };

  const statusLabel = checking
    ? 'Updating your account…'
    : plan && plan !== 'free'
    ? `You are now on the ${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan.`
    : 'We are finalizing your upgrade. This can take a few seconds.';

  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-2">🎉 Payment successful</h1>
      <p className="text-gray-600">Thanks for upgrading! Your plan should update automatically shortly.</p>
      <p className="mt-3 text-sm text-gray-500">{statusLabel}</p>
      {sessionError && <p className="mt-2 text-sm text-red-600">{sessionError}</p>}
      <div className="mt-8 space-x-3">
        <Link href="/generator" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Go to App
        </Link>
        <button
          type="button"
          onClick={openPortalFromSession}
          disabled={portalBusy}
          className="inline-block rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
        >
          {portalBusy ? 'Opening…' : 'Manage plan'}
        </button>
      </div>
      {portalError && <p className="mt-4 text-sm text-red-600">{portalError}</p>}
    </main>
  );
}
