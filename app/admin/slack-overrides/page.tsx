'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

type SlackOverride = {
  id: string;
  slack_team_id: string;
  slack_user_id: string;
  slack_channel_id: string | null;
  message_text: string;
  gap_keys: string[];
  present_keys: string[];
  readiness_mode: string | null;
  reason: string;
  created_at: string;
};

const PAGE_SIZE = 50;

export default function SlackOverridesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<SlackOverride[]>([]);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet<SlackOverride[]>(
          `/api/analytics/slack-overrides?limit=${PAGE_SIZE}&offset=${offset}`
        );
        if (alive) setRows(data || []);
      } catch (err: any) {
        const msg = err?.message || 'Unable to load overrides';
        if (alive) {
          setError(msg);
          setRows([]);
        }
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [offset]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Slack Overrides</h1>
        <p className="text-sm text-gray-500">
          Every time someone marks a flagged gap ready anyway in Slack, it&apos;s logged here — who,
          what was overridden, and why. This is the org-specific calibration data referenced in the
          Slack pivot notes. Requires admin allowlist.
        </p>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading overrides…</p>}
      {error && !loading && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent overrides</h2>
            <span className="text-xs text-gray-500">{rows.length} shown</span>
          </div>

          {rows.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-2 py-2 text-left">When</th>
                    <th className="px-2 py-2 text-left">Message</th>
                    <th className="px-2 py-2 text-left">Overridden</th>
                    <th className="px-2 py-2 text-left">Reason</th>
                    <th className="px-2 py-2 text-left">Team / User</th>
                    <th className="px-2 py-2 text-left">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100 align-top">
                      <td className="whitespace-nowrap px-2 py-2 text-left text-gray-600">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="max-w-xs px-2 py-2 text-left text-gray-700">
                        {row.message_text}
                      </td>
                      <td className="px-2 py-2 text-left text-gray-900">
                        {row.gap_keys?.length ? row.gap_keys.join(', ') : '—'}
                      </td>
                      <td className="max-w-xs px-2 py-2 text-left text-gray-700">{row.reason}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-left text-gray-600">
                        {row.slack_team_id} / {row.slack_user_id}
                      </td>
                      <td className="px-2 py-2 text-left text-gray-500">
                        {row.readiness_mode || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Showing {offset + 1}–{offset + rows.length}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded border border-gray-200 px-2 py-1 text-gray-700 disabled:opacity-50"
                    onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                    disabled={offset === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="rounded border border-gray-200 px-2 py-1 text-gray-700 disabled:opacity-50"
                    onClick={() => setOffset((o) => o + PAGE_SIZE)}
                    disabled={rows.length < PAGE_SIZE}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-500">No overrides logged yet.</p>
          )}
        </div>
      )}
    </main>
  );
}
