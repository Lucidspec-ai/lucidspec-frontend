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
import Spinner from '@/components/Spinner';
import { SettingsFeedback, type SettingsFeedbackValue } from '@/components/ui/SettingsFeedback';
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
  const [feedback, setFeedback] = useState<SettingsFeedbackValue | null>(null);

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
    setFeedback(null);
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
    setFeedback(null);
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
      setFeedback({ kind: 'error', message: 'Enter a ticket type, such as Bug or Feature.' });
      toast.error('Enter a ticket type, e.g. Bug, Feature, Client Request');
      return;
    }
    if (!rawExample.trim()) {
      setFeedback({ kind: 'error', message: 'Paste an example ticket before saving.' });
      toast.error('Paste an example ticket before saving');
      return;
    }
    const token = await withToken();
    if (!token) return;
    setSaving(true);
    setFeedback(null);
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
      setFeedback({ kind: 'success', message: 'Example saved.' });
    } catch (e: any) {
      const message = String(e?.message || 'Could not save this example');
      setFeedback({ kind: 'error', message: `Your example was not saved. ${message} Your entries are still here.` });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (ticketType: string) => {
    if (deletingType) return;
    const token = await withToken();
    if (!token) return;
    setDeletingType(ticketType);
    setFeedback(null);
    try {
      await apiFetch(`/api/account/ticket-examples/${encodeURIComponent(ticketType)}`, {
        method: 'DELETE',
        token,
        timeoutMs: 15000,
      });
      setExamples((prev) => prev.filter((e) => e.ticket_type !== ticketType));
      toast.success('Example removed');
      setFeedback({ kind: 'success', message: 'Example removed.' });
    } catch (e: any) {
      const message = String(e?.message || 'Could not remove this example');
      setFeedback({ kind: 'error', message });
      toast.error(message);
    } finally {
      setDeletingType(null);
    }
  };

  return (
    <section aria-label="Ticket standards" className="mx-auto max-w-4xl">
      <SettingsPageHeader
        title="Ticket Standards"
        description={
          <>
            Add an example of a good ticket for each type you use. LucidSpec uses its style for future tickets
            and suggests checks you can review in Readiness Standards. Examples are optional.
          </>
        }
      />

      {loadError ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <p className="font-semibold">Your examples could not be loaded.</p>
          <p>{loadError}</p>
          <p className="mt-2">Refresh the page to try again.</p>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <Spinner label="Loading ticket examples" />
          <span aria-hidden="true">Loading your ticket examples…</span>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Examples by ticket type</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">One saved example for each ticket type.</p>
            </div>
            {!showForm && (examples.length > 0 || Boolean(loadError)) ? (
              <button
                type="button"
                onClick={onStartAdd}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                + Add ticket type
              </button>
            ) : null}
          </div>

          <SettingsFeedback feedback={feedback} />

          {lastSuggestedCount ? (
            <p role="status" className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
              {lastSuggestedCount} standard{lastSuggestedCount === 1 ? '' : 's'} suggested from this example —{' '}
              <Link href="/account/checklist#custom-rules" className="font-semibold underline">
                review them in Readiness Standards
              </Link>
              .
            </p>
          ) : null}

          {examples.length > 0 ? (
            <div className="mt-6 space-y-4">
              {examples.map((example) => (
                <div key={example.ticket_type} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                    <div className="min-w-0 flex-1 break-words">
                      <h3 className="text-base font-semibold text-slate-900">{example.ticket_type}</h3>
                      {Object.keys(example.style_profile || {}).length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-sm text-slate-500">
                          {Object.entries(example.style_profile).map(([key, value]) => (
                            <li key={key}>
                              <span className="font-medium text-slate-700">{key.replace(/_/g, ' ')}:</span> {value}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {example.updated_at ? (
                        <span className="mt-3 block text-xs text-slate-500">
                          Last updated {new Date(example.updated_at).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStartEdit(example)}
                        disabled={saving || Boolean(deletingType)}
                        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(example.ticket_type)}
                        disabled={saving || Boolean(deletingType)}
                        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingType === example.ticket_type ? 'Removing…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !showForm && !loadError ? (
            <EmptyState className="mt-6 !py-10" message={<>
              <svg aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 3h7l4 4v14H7zM14 3v5h5M10 12h5M10 16h5" /></svg>
              <p className="text-base font-semibold text-slate-950">No examples saved yet.</p>
              <p className="mx-auto mt-2 max-w-md leading-6">Start with a Bug, Feature, or another ticket type. Paste a ticket that shows the structure and writing style you want LucidSpec to follow.</p>
              <button type="button" onClick={onStartAdd} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">+ Add ticket type</button>
              <p className="mt-3 text-xs leading-5 text-slate-500">You can keep creating tickets without adding an example.</p>
            </>} />
          ) : null}

          {showForm ? (
            <fieldset disabled={saving} aria-busy={saving} className="mt-6 min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <legend className="px-1 text-sm font-semibold text-slate-900">{editingType ? 'Edit example' : 'Add a ticket example'}</legend>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Ticket type</span>
                <input
                  type="text"
                  value={ticketTypeInput}
                  onChange={(e) => setTicketTypeInput(e.target.value)}
                  placeholder="Bug"
                  disabled={Boolean(editingType)}
                  className="mt-2 block min-h-11 w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-800">Example ticket</span>
                <textarea
                  value={rawExample}
                  onChange={(e) => setRawExample(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="Paste a ticket of this type you consider well-formed — title, description, acceptance criteria, whatever you normally include."
                  rows={12}
                  aria-describedby="example-character-count"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base leading-6 text-slate-900"
                />
              </label>
              <p id="example-character-count" className="mt-2 text-xs text-slate-500">
                {rawExample.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingType ? 'Save example' : 'Add example'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </fieldset>
          ) : null}
        </div>
      )}
    </section>
  );
}
