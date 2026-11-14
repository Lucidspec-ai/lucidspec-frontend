// app/generator/placeholders/page.tsx
'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGetSession } from '@/lib/safeSession';
import { apiFetch, apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsPageHeader } from '@/components/ui/SettingsPageHeader';
import type { SavedTicket } from '@/lib/apiTypes';

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'dispatched') {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
        Dispatched
      </span>
    );
  }
  if (status === 'drafted') {
    return (
      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-blue-700">
        Draft ready
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700">
      Parked
    </span>
  );
}

export default function PlaceholdersPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SavedTicket[] | null>(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let effToken: string | undefined;
      try {
        const { data } = await safeGetSession();
        effToken = data.session?.access_token;
      } catch {
        // Ignore fetch errors and fall back to no token
      }
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent('/generator/placeholders'));
        return;
      }
      try {
        const raw = await apiGet<SavedTicket[]>('/api/tickets/saved', { token: effToken, timeoutMs: 15000 });
        setTickets(raw);
      } catch (e: any) {
        setError(String(e?.message || 'Could not load parked placeholders'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const { data } = await safeGetSession();
      const effToken = data.session?.access_token;
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent('/generator/placeholders'));
        return;
      }
      await apiFetch(`/api/tickets/saved/${id}`, { method: 'DELETE', token: effToken, timeoutMs: 15000 });
      setTickets((prev) => (prev || []).filter((t) => t.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Could not delete this placeholder');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SettingsPageHeader
        title="Parked placeholders"
        description="Placeholder tickets saved for later — pick one up and finish it when it's ready."
        backHref="/generator"
        backLabel="Back to Generator"
      />

      {error ? (
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {tickets === null && !error ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}

      {tickets && tickets.length === 0 ? (
        <EmptyState
          className="mt-6"
          message={
            <>
              No parked placeholders yet. Check &quot;This is a placeholder ticket&quot; on the Generator to save one
              for later.
            </>
          }
        />
      ) : null}

      {tickets && tickets.length > 0 ? (
        <ul className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {tickets.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-950">{t.title}</p>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Updated {formatUpdatedAt(t.updated_at)}</p>
                {t.status === 'dispatched' && t.external_ticket_url ? (
                  <a
                    href={t.external_ticket_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-semibold text-blue-700 underline"
                  >
                    {t.external_ticket_key || 'View in tracker'}
                  </a>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/generator?saved=${t.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Resume
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                >
                  {deletingId === t.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
