// app/onboarding/connect-tracker/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGetSession } from '@/lib/safeSession';
import { SetupShell } from '@/components/ui/SetupShell';
import Spinner from '@/components/Spinner';

// Only ever reached via the signup success redirect (see app/signup/page.tsx)
// -- there's no reliable "this is a brand-new signup" signal from Supabase
// (no SIGNED_UP event, nothing checks created_at/last_sign_in_at), so this
// page's URL itself is the signal. Skippable, not a hard gate -- requiring
// real Jira/ServiceNow/Linear credentials before a new user can try
// anything would be a real activation-funnel risk pre-revenue.
export default function ConnectTrackerOnboardingPage() {
  const router = useRouter();
  const [next, setNext] = useState('/generator');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(params.get('next') || '/generator');

    (async () => {
      let effToken: string | undefined;
      try {
        const { data } = await safeGetSession();
        effToken = data.session?.access_token;
      } catch {
        // Ignore fetch errors and fall back to no token
      }
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = () => {
    router.push(`/account/integrations?next=${encodeURIComponent(next)}`);
  };

  const onSkip = () => {
    router.push(next);
  };

  return (
    <SetupShell
      step={2}
      title="Connect your tracker"
      description="Send ready tickets to your own Jira, ServiceNow, or Linear. You can connect now or get started and return to integrations in account settings later."
    >
        {!ready ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner label="Loading tracker setup" />
            <span aria-hidden="true">Loading tracker setup…</span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Use your existing workflow</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The next page lets you choose your tracker and configure a connection. No tracker connection is required to start creating tickets.
            </p>
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-600">Supported trackers: Jira · ServiceNow · Linear</p>
          </div>
        )}
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={onConnect}
            disabled={!ready}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Connect your tracker
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={!ready}
            className="min-h-11 rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Skip for now
          </button>
        </div>
    </SetupShell>
  );
}
