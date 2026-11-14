'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

type FeedbackTrendPoint = {
  bucket: string;
  total: number;
  thumbs_up: number;
  thumbs_down: number;
  comments: number;
  positive_rate: number;
  negative_rate: number;
};

type FeedbackTopicCount = {
  topic: string;
  count: number;
};

type FeedbackAnalytics = {
  window_days: number;
  bucket: string;
  total: number;
  thumbs_up: number;
  thumbs_down: number;
  comments: number;
  positive_rate: number;
  negative_rate: number;
  series: FeedbackTrendPoint[];
  top_negative_topics: FeedbackTopicCount[];
};

type FeedbackComment = {
  created_at?: string;
  feedback_type: string;
  comment?: string | null;
  target_type: string;
  target_id?: string | null;
  source?: string | null;
};

export default function FeedbackAdminPage() {
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<FeedbackAnalytics | null>(null);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);

  const [windowDays, setWindowDays] = useState(30);
  const [bucket, setBucket] = useState<'day' | 'week'>('day');
  const [targetType, setTargetType] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setCommentsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('window_days', String(windowDays));
        params.set('bucket', bucket);
        if (targetType) params.set('target_type', targetType);
        if (feedbackType) params.set('feedback_type', feedbackType);
        params.set('admin', 'true');
        const [analyticsPayload, commentsPayload] = await Promise.all([
          apiGet<FeedbackAnalytics>(`/api/feedback/analytics?${params.toString()}`),
          apiGet<FeedbackComment[]>(`/api/feedback/comments?${params.toString()}`),
        ]);
        if (alive) {
          setData(analyticsPayload);
          setComments(commentsPayload || []);
          setCommentsPage(1);
        }
      } catch (err: any) {
        const msg = err?.message || 'Unable to load feedback analytics';
        if (alive) {
          setError(msg);
          setData(null);
          setComments([]);
        }
        toast.error(msg);
      } finally {
        if (alive) {
          setLoading(false);
          setCommentsLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [windowDays, bucket, targetType, feedbackType]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feedback Dashboard</h1>
          <p className="text-sm text-gray-500">
            Aggregated feedback across tickets and summaries. Requires admin allowlist.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="text-sm text-gray-700">
          Time range
          <select
            className="mt-1 w-full rounded border border-gray-200 p-2 text-sm"
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Bucket
          <select
            className="mt-1 w-full rounded border border-gray-200 p-2 text-sm"
            value={bucket}
            onChange={(e) => setBucket(e.target.value as 'day' | 'week')}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Target type
          <select
            className="mt-1 w-full rounded border border-gray-200 p-2 text-sm"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            <option value="">All</option>
            <option value="ticket">Ticket</option>
            <option value="summary">Summary</option>
            <option value="briefing">Briefing</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Feedback type
          <select
            className="mt-1 w-full rounded border border-gray-200 p-2 text-sm"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
          >
            <option value="">All</option>
            <option value="thumbs_up">Thumbs up</option>
            <option value="thumbs_down">Thumbs down</option>
            <option value="comment">Comment</option>
          </select>
        </label>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading feedback…</p>}
      {error && !loading && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {data && !loading && (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Total feedback</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{data.total}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Thumbs up</p>
              <p className="mt-2 text-2xl font-semibold text-green-600">{data.thumbs_up}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Thumbs down</p>
              <p className="mt-2 text-2xl font-semibold text-red-600">{data.thumbs_down}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Comments</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{data.comments}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Trends</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-2 py-2 text-left">Bucket</th>
                      <th className="px-2 py-2 text-right">Total</th>
                      <th className="px-2 py-2 text-right">Up</th>
                      <th className="px-2 py-2 text-right">Down</th>
                      <th className="px-2 py-2 text-right">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.series.map((row) => (
                      <tr key={row.bucket} className="border-t border-gray-100">
                        <td className="px-2 py-2 text-left text-gray-700">{row.bucket}</td>
                        <td className="px-2 py-2 text-right text-gray-700">{row.total}</td>
                        <td className="px-2 py-2 text-right text-green-600">{row.thumbs_up}</td>
                        <td className="px-2 py-2 text-right text-red-600">{row.thumbs_down}</td>
                        <td className="px-2 py-2 text-right text-gray-600">{row.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Repeated negative topics</h2>
              {data.top_negative_topics.length ? (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {data.top_negative_topics.map((topic) => (
                    <li key={topic.topic} className="flex items-center justify-between">
                      <span>{topic.topic}</span>
                      <span className="text-xs text-gray-500">{topic.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-gray-500">No repeated negative topics yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent comments</h2>
              <span className="text-xs text-gray-500">{comments.length} total</span>
            </div>
            {commentsLoading ? (
              <p className="mt-3 text-xs text-gray-500">Loading comments…</p>
            ) : comments.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-2 py-2 text-left">When</th>
                      <th className="px-2 py-2 text-left">Feedback</th>
                      <th className="px-2 py-2 text-left">Source</th>
                      <th className="px-2 py-2 text-left">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const pageSize = 8;
                      const sorted = [...comments].sort((a, b) => {
                        if (!a.created_at && !b.created_at) return 0;
                        if (!a.created_at) return 1;
                        if (!b.created_at) return -1;
                        return Date.parse(b.created_at) - Date.parse(a.created_at);
                      });
                      const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
                      const safePage = Math.min(commentsPage, totalPages);
                      const start = (safePage - 1) * pageSize;
                      const pageRows = sorted.slice(start, start + pageSize);
                      return pageRows.map((row, idx) => (
                      <tr key={`${row.created_at || 'na'}-${idx}`} className="border-t border-gray-100">
                        <td className="px-2 py-2 text-left text-gray-600">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-2 py-2 text-left text-gray-700">{row.feedback_type}</td>
                        <td className="px-2 py-2 text-left text-gray-600">{row.source || '—'}</td>
                        <td className="px-2 py-2 text-left text-gray-900">{row.comment || '—'}</td>
                      </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                {(() => {
                  const pageSize = 8;
                  const totalPages = Math.max(1, Math.ceil(comments.length / pageSize));
                  const safePage = Math.min(commentsPage, totalPages);
                  return (
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Page {safePage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border border-gray-200 px-2 py-1 text-gray-700 disabled:opacity-50"
                          onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}
                          disabled={safePage <= 1}
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className="rounded border border-gray-200 px-2 py-1 text-gray-700 disabled:opacity-50"
                          onClick={() => setCommentsPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safePage >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
