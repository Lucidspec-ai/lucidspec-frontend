'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError, apiGet } from '@/lib/api';
import { normalizePlan, type Plan } from '@/lib/plans';
import { safeGetSession } from '@/lib/safeSession';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { formatUsageUsd as formatUsd } from '@/lib/usageCostFormatting';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { EmptyState } from '@/components/ui/EmptyState';

type BreakdownRow = {
  key: string;
  total_cost_usd?: number | null;
};

type CostSummary = {
  totals?: {
    total_cost_usd?: number | null;
    request_count?: number | null;
  };
  trends?: Array<{ date: string; total_cost_usd?: number | null }>;
  category_breakdown?: BreakdownRow[];
  breakdowns?: { by_category?: BreakdownRow[] };
};

type CostRequestRow = {
  request_id: string;
  feature?: string | null;
  source_type?: string | null;
  status?: string | null;
  estimated_cost_usd?: number | null;
  total_cost_usd?: number | null;
  created_at?: string | null;
};

type CostRequestsResponse = {
  rows?: CostRequestRow[];
};

type Quota = { plan: Plan; limit: number; used: number };
type RawQuota = Omit<Quota, 'plan'> & { plan?: string | null };
type MeProfile = { plan?: string | null; admin?: boolean | null };

const emptySummary: CostSummary = {
  totals: { total_cost_usd: 0, request_count: 0 },
  trends: [],
  category_breakdown: [],
};

const isAdminOnlyError = (err: unknown) =>
  (err instanceof ApiError && err.status === 403 && String(err.message || '').includes('admin_only')) ||
  (err instanceof Error && /admin_only/i.test(err.message || ''));

const costValue = (value?: number | null) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const formatCount = (value?: number | null) =>
  new Intl.NumberFormat('en-US').format(Number.isFinite(Number(value)) ? Number(value) : 0);

const labelFromKey = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
};

const categoryRows = (summary: CostSummary) =>
  summary.category_breakdown?.length ? summary.category_breakdown : summary.breakdowns?.by_category || [];

const normalizeQuota = (data: RawQuota): Quota => ({
  plan: normalizePlan(data?.plan),
  limit: Number.isFinite(Number(data?.limit)) ? Number(data.limit) : 0,
  used: Number.isFinite(Number(data?.used)) ? Number(data.used) : 0,
});

function DailyCostTrendChart({ rows }: { rows: NonNullable<CostSummary['trends']> }) {
  const visibleRows = [...rows].filter((row) => row.date).sort((a, b) => a.date.localeCompare(b.date));
  const values = visibleRows.map((row) => costValue(row.total_cost_usd));
  const maxValue = Math.max(...values, 0);
  const width = 720;
  const height = 220;
  const paddingX = 42;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const points = visibleRows.map((row, index) => {
    const x = visibleRows.length === 1 ? width / 2 : paddingX + (index / Math.max(visibleRows.length - 1, 1)) * chartWidth;
    const y = maxValue > 0 ? height - paddingY - (costValue(row.total_cost_usd) / maxValue) * chartHeight : height - paddingY;
    return { ...row, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY} L ${points[0].x.toFixed(1)} ${height - paddingY} Z`
      : '';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-950">Spend over time</h2>
        <span className="text-sm font-extrabold text-slate-700">Peak {formatUsd(maxValue)}</span>
      </div>
      <div className="mt-4 h-56 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        {points.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState variant="inline" message="No spend yet in this window." />
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Daily spend trend">
            <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />
            {areaPath && <path d={areaPath} fill="#93c5fd" opacity="0.28" />}
            {linePath && <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />}
            {points.map((point) => (
              <g key={point.date}>
                <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                <title>{`${point.date}: ${formatUsd(point.total_cost_usd)}`}</title>
              </g>
            ))}
          </svg>
        )}
      </div>
    </section>
  );
}

function CategoryBreakdown({ rows }: { rows: BreakdownRow[] }) {
  const visibleRows = [...rows].sort((a, b) => costValue(b.total_cost_usd) - costValue(a.total_cost_usd));
  const maxValue = Math.max(...visibleRows.map((row) => costValue(row.total_cost_usd)), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-950">Spend by category</h2>
      <div className="mt-4 space-y-4">
        {visibleRows.length === 0 ? (
          <EmptyState variant="inline" message="No spend yet in this window." />
        ) : (
          visibleRows.map((row) => {
            const amount = costValue(row.total_cost_usd);
            const percent = maxValue > 0 ? Math.max(4, Math.round((amount / maxValue) * 100)) : 0;
            return (
              <div key={row.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-slate-700">{labelFromKey(row.key)}</span>
                  <span className="font-extrabold text-slate-950">{formatUsd(amount)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function RecentActivity({ rows, loading }: { rows: CostRequestRow[]; loading: boolean }) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-extrabold text-slate-950">Recent activity</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <EmptyState
            variant="inline"
            className="px-5 py-8 text-center"
            message={loading ? 'Loading...' : 'No spend recorded yet in this window.'}
          />
        ) : (
          rows.map((row) => (
            <div key={row.request_id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="font-bold text-slate-500">{formatDateTime(row.created_at)}</span>
              <span className="min-w-0 flex-1 truncate px-3 font-bold text-slate-800">
                {labelFromKey(row.feature || row.source_type || 'request')}
              </span>
              <span className="font-extrabold text-slate-950">{formatUsd(row.estimated_cost_usd ?? row.total_cost_usd)}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function UsageCostPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [plan, setPlan] = useState<Plan>('free');
  const [quota, setQuota] = useState<Quota | null>(null);
  const [summary, setSummary] = useState<CostSummary>(emptySummary);
  const [requests, setRequests] = useState<CostRequestRow[]>([]);
  const [error, setError] = useState('');
  const [windowDays, setWindowDays] = useState(30);

  useEffect(() => {
    let mounted = true;
    safeGetSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        const session = data.session;
        const accessToken = session?.access_token ?? null;
        setToken(accessToken);
        setUserEmail(session?.user?.email ?? '');
        if (!accessToken) {
          setIsAdmin(false);
          return;
        }
        try {
          const me = await apiGet<MeProfile>('/api/me', { token: accessToken });
          if (!mounted) return;
          const admin = Boolean(me?.admin);
          setIsAdmin(admin);
          if (!admin) {
            router.replace('/generator');
            return;
          }
          setPlan(normalizePlan(me?.plan));
          try {
            const loadedQuota = await apiGet<RawQuota>('/api/me/quota', { token: accessToken });
            if (!mounted) return;
            setQuota(normalizeQuota(loadedQuota));
          } catch {
            if (!mounted) return;
            setQuota(null);
          }
        } catch {
          if (!mounted) return;
          setIsAdmin(false);
          router.replace('/generator');
        }
      })
      .finally(() => {
        if (mounted) setBooting(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    let mounted = true;
    setSummaryLoading(true);
    setError('');
    apiGet<CostSummary>(`/api/analytics/cost/summary?window_days=${windowDays}`, { token })
      .then((data) => {
        if (!mounted) return;
        setSummary({ ...emptySummary, ...data });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        if (isAdminOnlyError(err)) {
          router.replace('/generator');
          return;
        }
        setSummary(emptySummary);
        setError(err instanceof Error ? err.message : 'Cost analytics unavailable.');
      })
      .finally(() => {
        if (mounted) setSummaryLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, isAdmin, windowDays, router]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    let mounted = true;
    setRequestsLoading(true);
    apiGet<CostRequestsResponse>(`/api/analytics/cost/requests?window_days=${windowDays}&limit=15&offset=0`, { token })
      .then((data) => {
        if (!mounted) return;
        setRequests(data.rows || []);
      })
      .catch(() => {
        if (!mounted) return;
        setRequests([]);
      })
      .finally(() => {
        if (mounted) setRequestsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, isAdmin, windowDays]);

  const totalSpend = costValue(summary.totals?.total_cost_usd);
  const requestCount = summary.totals?.request_count || 0;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const quotaPercent = quota && quota.limit > 0 ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;
  const planUsageLabel = quota ? `${quota.used} / ${quota.limit} Specs` : 'Usage loading';
  const headerStats = useMemo(
    () => [
      { label: formatUsd(totalSpend), icon: 'chart' as const },
      { label: `${formatCount(requestCount)} requests`, icon: 'spec' as const },
    ],
    [totalSpend, requestCount]
  );

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out');
    } finally {
      setToken(null);
      setIsAdmin(false);
      router.push('/');
      router.refresh();
    }
  };

  if (booting) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">Loading cost overview…</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Usage &amp; Cost</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to view spend.</p>
        <div className="mt-4">
          <Link
            href="/signin?next=/usage-cost"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">Redirecting…</p>
      </main>
    );
  }

  return (
    <WorkspaceShell
      activeHref="/usage-cost"
      headerEyebrow="Cost"
      headerDescription="What LucidSpec is spending, at a glance."
      headerStats={headerStats}
      planLabel={planLabel}
      planUsageLabel={planUsageLabel}
      showUsageCostNav={isAdmin}
      usagePercent={quotaPercent}
      userEmail={userEmail}
      onSignOut={handleSignOut}
    >
      <div className="px-5 py-7 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-[28px] font-extrabold leading-tight text-slate-950 md:text-[34px]">Usage & Cost</h1>
          <div className="inline-flex h-11 w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setWindowDays(days)}
                className={`h-9 rounded-lg px-4 text-sm font-extrabold transition ${
                  windowDays === days ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{error}</div>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total spend, last {windowDays} days</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-950">{summaryLoading ? '...' : formatUsd(totalSpend)}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">{formatCount(requestCount)} requests</p>
        </section>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <DailyCostTrendChart rows={summary.trends || []} />
          <CategoryBreakdown rows={categoryRows(summary)} />
        </div>

        <RecentActivity rows={requests} loading={requestsLoading} />
      </div>
    </WorkspaceShell>
  );
}
