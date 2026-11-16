// app/account/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';
import { apiFetch, apiGet } from '@/lib/api';
import { SettingsPageHeader } from '@/components/ui/SettingsPageHeader';
import type { TicketingConnection, TicketingProvider } from '@/lib/apiTypes';

const PROVIDER_LABELS: Record<TicketingProvider, string> = {
  jira: 'Jira',
  servicenow: 'ServiceNow',
  linear: 'Linear',
};

const DEFAULT_TICKETING_DESCRIPTION =
  "Connect Jira, ServiceNow, or Linear so tickets go straight to your tracker";

function RowChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-400"
    >
      <path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsRowContent({ title, description }: { title: string; description: string }) {
  return (
    <span className="flex-1">
      <span className="block text-sm font-bold text-slate-900">{title}</span>
      <span className="mt-0.5 block text-sm text-slate-500">{description}</span>
    </span>
  );
}

const ROW_CLASSES =
  'group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50';

export default function AccountPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');
  const [ticketingDescription, setTicketingDescription] = useState(DEFAULT_TICKETING_DESCRIPTION);

  const interpretPortalError = (err: unknown) => {
    if (err instanceof Error) {
      const msg = err.message || '';
      if (/no configuration provided/i.test(msg)) {
        return 'Billing portal is not configured yet. Please contact support so we can finish setting it up.';
      }
      return msg;
    }
    return 'Failed to open billing portal';
  };

  useEffect(() => {
    let mounted = true;
    safeGetSession().then(({ data }) => {
      if (!mounted) return;
      setToken(data.session?.access_token ?? null);
      setEmail(data.session?.user?.email ?? '');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setToken(s?.access_token ?? null);
      setEmail(s?.user?.email ?? '');
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    apiGet<TicketingConnection>('/api/account/ticketing', { token, timeoutMs: 15000 })
      .then((raw) => {
        if (!mounted) return;
        if (raw.configured && raw.provider && raw.provider in PROVIDER_LABELS) {
          const label = PROVIDER_LABELS[raw.provider as TicketingProvider];
          setTicketingDescription(`Connected to ${label} — tickets go straight to your tracker`);
        } else {
          setTicketingDescription(`Not connected yet — ${DEFAULT_TICKETING_DESCRIPTION.charAt(0).toLowerCase()}${DEFAULT_TICKETING_DESCRIPTION.slice(1)}`);
        }
      })
      .catch(() => {
        // Leave the default description in place if the status check fails.
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  const openPortal = async () => {
    if (!token) { setError('Please sign in'); return; }
    setBusy(true); setError('');
    try {
      const { url } = await apiFetch<{ url: string }>('/stripe/portal', { method: 'POST', token });
      window.location.href = url;
    } catch (e: any) {
      console.error('Failed to open billing portal', e);
      setError(interpretPortalError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <SettingsPageHeader title="Account" description={`Signed in as ${email || '—'}`} />

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            <button type="button" onClick={openPortal} disabled={busy} className={`${ROW_CLASSES} disabled:opacity-60`}>
              <SettingsRowContent
                title="Manage billing"
                description="Manage your subscription and payment details where billing is configured."
              />
              {busy ? <span className="shrink-0 text-sm font-semibold text-slate-500">Opening…</span> : <RowChevron />}
            </button>

            <Link href="/account/integrations" className={ROW_CLASSES}>
              <SettingsRowContent
                title="Ticketing connection"
                description={ticketingDescription}
              />
              <RowChevron />
            </Link>

            <Link href="/account/checklist" className={ROW_CLASSES}>
              <SettingsRowContent
                title="Readiness Standards"
                description="Choose which fields are required and add your own custom rules"
              />
              <RowChevron />
            </Link>

            <Link href="/account/ticket-style" className={ROW_CLASSES}>
              <SettingsRowContent
                title="Ticket standards"
                description="Teach LucidSpec your team's format and required sections, per ticket type"
              />
              <RowChevron />
            </Link>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
      </div>
    </main>
  );
}
