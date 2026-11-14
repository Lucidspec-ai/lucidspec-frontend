// app/account/ticket-style/page.tsx
'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGetSession } from '@/lib/safeSession';
import { apiFetch, apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsPageHeader } from '@/components/ui/SettingsPageHeader';
import type {
  TicketExampleListResponse,
  TicketExampleSaveResponse,
  TicketStyleExampleResponse,
} from '@/lib/apiTypes';

const MAX_LENGTH = 20000;
const BASE_PATH = '/account/ticket-style';

export default function TicketStylePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [examples, setExamples] = useState<TicketStyleExampleResponse[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [ticketTypeInput, setTicketTypeInput] = useState('');
  const [rawExample, setRawExample] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingType, setDeletingType] = useState<string | null>(null);
  const [lastSuggestedCount, setLastSuggestedCount] = useState<number | null>(null);

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
        router.push('/signin?next=' + encodeURIComponent(BASE_PATH));
        return;
      }
      try {
        const raw = await apiGet<TicketExampleListResponse>('/api/account/ticket-examples', {
          token: effToken,
          timeoutMs: 15000,
        });
        setExamples(raw.examples || []);
      } catch (e: any) {
        setLoadError(String(e?.message || 'Could not load your saved examples'));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withToken = async (): Promise<string | null> => {
    try {
      const { data } = await safeGetSession();
      const effToken = data.session?.access_token;
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent(BASE_PATH));
        return null;
      }
      return effToken;
    } catch {
      router.push('/signin?next=' + encodeURIComponent(BASE_PATH));
      return null;
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingType(null);
    setTicketTypeInput('');
    setRawExample('');
  };

  const onStartAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const onStartEdit = (example: TicketStyleExampleResponse) => {
    setEditingType(example.ticket_type);
    setTicketTypeInput(example.ticket_type);
    setRawExample(example.raw_example || '');
    setShowForm(true);
    setLastSuggestedCount(null);
  };

  const onSave = async () => {
    if (saving) return;
    const ticketType = ticketTypeInput.trim();
    if (!ticketType) {
      toast.error('Enter a ticket type, e.g. Bug, Feature, Client Request');
      return;
    }
    if (!rawExample.trim()) {
      toast.error('Paste an example ticket before saving');
      return;
    }
    const token = await withToken();
    if (!token) return;
    setSaving(true);
    try {
      const saved = await apiFetch<TicketExampleSaveResponse>(
        `/api/account/ticket-examples/${encodeURIComponent(ticketType)}`,
        {
          method: 'PUT',
          body: { raw_example: rawExample.trim() },
          token,
          timeoutMs: 20000,
        }
      );
      setExamples((prev) => {
        const withoutOldType = prev.filter(
          (e) => e.ticket_type !== ticketType && e.ticket_type !== editingType
        );
        return [...withoutOldType, saved].sort((a, b) => a.ticket_type.localeCompare(b.ticket_type));
      });
      setLastSuggestedCount(saved.suggested_rule_ids.length);
      toast.success('Example saved');
      resetForm();
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not save this example'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (ticketType: string) => {
    if (deletingType) return;
    const token = await withToken();
    if (!token) return;
    setDeletingType(ticketType);
    try {
      await apiFetch(`/api/account/ticket-examples/${encodeURIComponent(ticketType)}`, {
        method: 'DELETE',
        token,
        timeoutMs: 15000,
      });
      setExamples((prev) => prev.filter((e) => e.ticket_type !== ticketType));
      toast.success('Example removed');
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not remove this example'));
    } finally {
      setDeletingType(null);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SettingsPageHeader
        title="Ticket standards"
        description={
          <>
            Paste one example ticket per type your team considers well-formed (Bug, Feature, Client Request,
            whatever your org uses). LucidSpec matches its tone for future tickets of that type, and proposes
            checkable standards — required sections, acceptance-criteria depth, attachment call-outs — you can
            review and turn on in Readiness Standards. Optional — generation works the same either way.
          </>
        }
        backHref="/account"
      />

      {loadError ? (
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Examples by ticket type</h2>
            {!showForm ? (
              <button
                type="button"
                onClick={onStartAdd}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              >
                + Add ticket type
              </button>
            ) : null}
          </div>

          {lastSuggestedCount ? (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {lastSuggestedCount} standard{lastSuggestedCount === 1 ? '' : 's'} suggested from this example —{' '}
              <Link href="/account/checklist" className="font-semibold underline">
                review them in Readiness Standards
              </Link>
              .
            </p>
          ) : null}

          {examples.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {examples.map((example) => (
                <div key={example.ticket_type} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex-1">
                      <span className="text-sm font-bold text-slate-800">{example.ticket_type}</span>
                      {Object.keys(example.style_profile || {}).length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-sm text-slate-500">
                          {Object.entries(example.style_profile).map(([key, value]) => (
                            <li key={key}>
                              <span className="font-semibold">{key}:</span> {value}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {example.updated_at ? (
                        <span className="mt-1 block text-xs text-slate-400">
                          Last updated {new Date(example.updated_at).toLocaleString()}
                        </span>
                      ) : null}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStartEdit(example)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(example.ticket_type)}
                        disabled={deletingType === example.ticket_type}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingType === example.ticket_type ? 'Removing…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <EmptyState className="mt-4" message="No examples saved yet." />
          ) : null}

          {showForm ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Ticket type</span>
                <input
                  type="text"
                  value={ticketTypeInput}
                  onChange={(e) => setTicketTypeInput(e.target.value)}
                  placeholder="Bug"
                  disabled={Boolean(editingType)}
                  className="mt-1.5 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Example ticket</span>
                <textarea
                  value={rawExample}
                  onChange={(e) => setRawExample(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="Paste a ticket of this type you consider well-formed — title, description, acceptance criteria, whatever you normally include."
                  rows={12}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  {rawExample.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters
                </span>
              </label>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingType ? 'Save example' : 'Add example'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
    </main>
  );
}
