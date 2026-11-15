// app/generator/page.tsx
'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';
import { toast } from '@/lib/toast';
import { ApiError, apiFetch, apiGet, apiPost } from '@/lib/api';
import { copyToClipboard } from '@/lib/copy';
import { rewriteLimitedProceedPanelText } from '@/lib/executionProceedScope';
import { ENGINEERING_INPUT_MESSAGE, isEngineeringRelatedInput } from '@/lib/engineeringRelevance';
import { Plan, normalizePlan } from '@/lib/plans';
import { LeanTicketCard } from '@/components/tickets/LeanTicketCard';
import { ReadinessCheckPanel } from '@/components/tickets/ReadinessCheckPanel';
import { ReadinessShell } from '@/components/settings/ReadinessShell';
import { ApplicationHeader } from '@/components/settings/ApplicationHeader';
import { WorkRequestIntake, REQUEST_PRIVACY_DISCLOSURE } from '@/components/workspace/WorkRequestIntake';
import { buildPromptPreview, SPEC_PROMPT_PLACEHOLDER } from './promptComposer';
import {
  buildDispatchPayload,
  buildSavePlaceholderPayload,
  getResumeIdFromSearch,
  planReadinessCheckRequest,
  shouldTrustSavedDraft,
  type ReadinessCheckOptions,
} from './placeholderLogic';
import {
  _normalize_pm_assistant_response,
  moderate_text,
} from '@/lib/redaction';
import type {
  ReadinessCheckResponse,
  SavedTicket,
  TicketAcCheckResponse,
  TicketDetailResponse,
  TicketDispatchResult,
  TicketingConnection,
  TicketResponse,
} from '@/lib/apiTypes';

const SAVE_CONFLICT_MESSAGE = 'This ticket was updated elsewhere. Reload the page to see the latest version.';
const PROMPT_WALKTHROUGH_KEY = 'lucidspec_prompt_walkthrough_seen';
const EXAMPLE_WORKFLOW_FAMILIES = [
  'Backup, retention & lifecycle changes',
  'Monitoring & alerting changes',
  'Network & security changes',
  'Identity & access changes',
  'Software delivery changes',
  'Platform infrastructure changes',
  'Logging & audit changes',
  'Compliance remediation changes',
];
const SUPPORT_DEPTH_EXPECTATIONS = [
  {
    title: 'Direct workflow support',
    body: 'LucidSpec matched one concrete workflow route and can show stronger deterministic readiness behavior for that request.',
  },
  {
    title: 'Family-level support',
    body: 'LucidSpec recognized the workflow family, but keeps exact workflow claims conservative until the route is clearer.',
  },
  {
    title: 'Partial support',
    body: 'LucidSpec found useful signals and can guide safe prework, but missing details or ambiguity still limit readiness confidence.',
  },
  {
    title: 'Ambiguous or unsupported',
    body: 'LucidSpec needs one concrete execution target before you should rely on workflow-level readiness output.',
  },
];
const PROMPT_STARTERS: Array<{ domain: string; prompts: string[] }> = [
  {
    domain: 'Backup, retention & lifecycle changes',
    prompts: [
      'Review readiness for an RDS backup change in production, including retention, restore validation, approval, and rollback expectations.',
      'Review an S3 lifecycle policy update for bucket audit-archive-prod in production so objects under prefix cloudtrail/ retain for 365 days and then expire. Include approval, change window, validation, and rollback.',
    ],
  },
  {
    domain: 'Monitoring & alerting changes',
    prompts: [
      'Create a CloudWatch alarm for a production EC2 instance, including threshold, notification target, validation plan, and owner.',
      'Update a production monitoring alert route or threshold, including approval, validation, rollback, and notification path.',
    ],
  },
  {
    domain: 'Network & security changes',
    prompts: [
      'Open a firewall rule for a production dependency, including source scope, destination, protocol, port, approval, change window, and rollback.',
      'Update a production security group rule, including source scope, destination scope, protocol, port, validation, and rollback.',
    ],
  },
  {
    domain: 'Identity & access changes',
    prompts: [
      'Grant temporary IAM access for an on-call engineer, including principal, access scope, approver, duration, validation, and removal plan.',
      'Review an IAM access request for a production support task, including least-privilege scope, expiry, approval, and rollback expectations.',
    ],
  },
  {
    domain: 'Software delivery changes',
    prompts: [
      'Deploy the orders-api ECS service in production on cluster payments-prod by registering task definition revision 42 with image orders-api:v2026.07.05 after schema migration dependency is confirmed. Include approval, change window, validation, and rollback.',
      'Patch a production release bug for billing-api, including the target service, GitHub Actions deployment path, schema migration dependency, approval, validation, and rollback.',
      'Implement a config change for billing-api in production. Change scope: set NEW_CHECKOUT feature flag to true in values.yaml. Include dependencies, approval, change window, validation, and rollback.',
      'Update the GitHub Actions deployment pipeline for billing-api in production. Change scope: add a staging approval gate before release. Include the pipeline path, dependencies, approval, change window, validation, and rollback.',
      'Update the deployment workflow for billing-api in production to require a staging approval gate before promoting to prod. Include the current workflow, dependencies, approval, change window, validation, and rollback.',
    ],
  },
  {
    domain: 'Platform infrastructure changes',
    prompts: [
      'Review readiness for a VMware cluster expansion, including target cluster, sizing, network design, storage policy, dependencies, validation, and rollback.',
      'Provision datastore ds-finance-prod in production with capacity of 8 TB on the gold storage tier for the analytics platform. Include dependencies, approval, change window, validation, and rollback.',
      'Build a new Linux server app-web-22 in production with 8 vCPU, 32 GB RAM using the hardened Ubuntu 24.04 baseline. Include dependencies, approval, change window, validation, and rollback.',
      'Prepare an EC2 patching change for production, including maintenance window, approvals, validation, and rollback.',
    ],
  },
  {
    domain: 'Logging & audit changes',
    prompts: [
      'Tighten CloudTrail retention for a production trail, including approval, validation, owner, and rollback expectations.',
      'Prepare a SIEM onboarding request for a production log source, including destination platform, owner, validation, rollback, and retention expectations.',
    ],
  },
  {
    domain: 'Compliance remediation changes',
    prompts: [
      'Prepare a production tagging control remediation for AWS resources, including required tags, owner, approval, evidence, validation, and rollback expectations.',
      'Fix the privileged access review audit control deficiency in production by implementing quarterly reviewer evidence capture owned by the IAM governance team. Include the control requirement, owner, evidence expectation, validation standard, approvals, and rollback or containment path.',
      'Fix the evidence gap for privileged access reviews in production by collecting the missing reviewer evidence and attaching the audit artifact package. Include the owner, evidence requirement, validation standard, approvals, and rollback or containment path.',
      'Implement a policy enforcement change for production AWS accounts by enabling the deny-public-s3 service control policy guardrail and applying it to the payments org units. Include the owner, evidence expectation, validation standard, approvals, and rollback path.',
    ],
  },
];
const TICKET_LOADING_DURATION_MS = 22000;
const TICKET_LOADING_STEPS = [
  {
    title: 'Analyzing your prompt',
    detail: 'Reviewing the task, constraints, and validation details you provided.',
  },
  {
    title: 'Mapping dependencies',
    detail: 'Identifying services, integrations, and potential risks.',
  },
  {
    title: 'Drafting ticket content',
    detail: 'Generating description, acceptance criteria, and technical notes.',
  },
  {
    title: 'Polishing the response',
    detail: 'Formatting the ticket and double-checking key details.',
  },
];
const INPUT_COST_PER_1K = Number(process.env.NEXT_PUBLIC_LLM_INPUT_COST_PER_1K ?? '');
const OUTPUT_COST_PER_1K = Number(process.env.NEXT_PUBLIC_LLM_OUTPUT_COST_PER_1K ?? '');

type Quota = {
  plan: Plan;
  limit: number;
  used: number;
  // your backend returns window_start/window_end; we don't use them in UI, so they're optional
  window_start?: string;
  window_end?: string;
};

type RawQuota = Omit<Quota, 'plan'> & { plan?: string | null };

const QUOTA_PLAN_CHANGE_KEY = 'lucidspec_plan_changed_at';

let pageSessionQuotaCache: { token: string; quota: Quota } | null = null;
let pageSessionQuotaRequest: { token: string; promise: Promise<Quota> } | null = null;
let pageSessionQuotaPlanChangeMarker = '';

const normalizeQuota = (data: RawQuota): Quota => ({
  ...data,
  plan: normalizePlan(data?.plan),
});

const loadPageSessionQuota = async (token: string, options: { force?: boolean } = {}) => {
  if (!options.force && pageSessionQuotaCache?.token === token) {
    return pageSessionQuotaCache.quota;
  }
  if (!options.force && pageSessionQuotaRequest?.token === token) {
    return pageSessionQuotaRequest.promise;
  }

  const promise = apiGet<RawQuota>('/api/me/quota', { token }).then((data) => {
    const quota = normalizeQuota(data);
    pageSessionQuotaCache = { token, quota };
    return quota;
  });
  pageSessionQuotaRequest = { token, promise };

  try {
    return await promise;
  } finally {
    if (pageSessionQuotaRequest?.promise === promise) {
      pageSessionQuotaRequest = null;
    }
  }
};

const hashClientInput = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
};
const createClientId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

type FeedbackTarget = 'ticket' | 'summary' | 'briefing';

const FeedbackPanel = ({
  targetType,
  targetId,
  source,
  title,
}: {
  targetType: FeedbackTarget;
  targetId?: string | null;
  source: string;
  title: string;
}) => {
  const [rating, setRating] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    setRating(null);
    setComment('');
    setStatus('idle');
  }, [targetId, targetType, source]);

  const submitFeedback = async (typeOverride?: 'thumbs_up' | 'thumbs_down' | 'comment') => {
    const feedbackType = typeOverride || rating || (comment ? 'comment' : null);
    if (!feedbackType) return;
    setStatus('sending');
    try {
      await apiPost('/api/feedback', {
        target_type: targetType,
        target_id: targetId || null,
        feedback_type: feedbackType,
        comment: comment.trim() || null,
        source,
      });
      setStatus('sent');
      toast.success('Thanks for the feedback');
    } catch (err: any) {
      setStatus('error');
      toast.error(err?.message || 'Unable to submit feedback');
    }
  };

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-slate-950">{title}</p>
        {status === 'sent' && <span className="text-xs font-extrabold text-green-600">Submitted</span>}
        {status === 'error' && <span className="text-xs font-extrabold text-red-600">Failed</span>}
      </div>
      <p className="mt-1 text-xs font-medium text-slate-500">Help us improve by rating this output.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRating('thumbs_up');
            submitFeedback('thumbs_up');
          }}
          className={`rounded-xl border px-4 py-2 text-sm font-extrabold transition ${
            rating === 'thumbs_up' ? 'border-green-500 bg-green-50 text-green-700' : 'border-blue-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
          disabled={status === 'sending'}
        >
          Helpful
        </button>
        <button
          type="button"
          onClick={() => {
            setRating('thumbs_down');
            submitFeedback('thumbs_down');
          }}
          className={`rounded-xl border px-4 py-2 text-sm font-extrabold transition ${
            rating === 'thumbs_down' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
          disabled={status === 'sending'}
        >
          Needs work
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional: what should we improve?"
          className="w-full rounded-2xl border border-blue-100 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => submitFeedback(comment ? undefined : 'comment')}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={status === 'sending' || (!comment.trim() && !rating)}
          >
            Send feedback
          </button>
          <span className="text-xs font-medium text-slate-500">{targetType.toUpperCase()} feedback</span>
        </div>
      </div>
    </div>
  );
};

const governanceStatusTone = (status?: string | null) => {
  const normalized = (status || '').trim().toLowerCase();
  if (normalized === 'ready') return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  if (normalized === 'conditional') return 'border-amber-200 bg-amber-50 text-amber-900';
  if (normalized === 'blocked') return 'border-rose-200 bg-rose-50 text-rose-900';
  return 'border-gray-200 bg-gray-50 text-gray-800';
};

const renderTicketGovernanceSummary = (ticket?: TicketResponse | null) => {
  const governance = ticket?.governance;
  if (!governance) return null;

  const statusLabel =
    moderate_text(governance.execution_status_label || governance.execution_status || '').trim() ||
    'Not evaluated';
  const reason = moderate_text(governance.execution_status_reason || '').trim();
  const gateSummary = moderate_text(governance.blocked_by_summary || '').trim();
  const cannotProceedUntil = Array.isArray(governance.cannot_proceed_until)
    ? governance.cannot_proceed_until.map((item) => moderate_text(item).trim()).filter(Boolean)
    : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-950 px-5 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              Ticket readiness gate
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              {reason || gateSummary || 'LucidSpec evaluated whether this work is ready to begin.'}
            </h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${governanceStatusTone(governance.execution_status)}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Confidence</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {typeof governance.execution_confidence === 'number' ? `${governance.execution_confidence}%` : 'Pending'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Resolve items</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{cannotProceedUntil.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Blocking owner gaps</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{governance.ownership_gap_count ?? 0}</p>
          {typeof governance.total_ownership_gap_count === 'number' &&
            governance.total_ownership_gap_count > (governance.ownership_gap_count ?? 0) && (
              <p className="mt-1 text-xs text-slate-500">
                {governance.total_ownership_gap_count} total unowned items tracked
              </p>
            )}
        </div>
      </div>

      {gateSummary && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-950">Gate summary: </span>
          {gateSummary}
        </div>
      )}
    </div>
  );
};


export default function GeneratorPage() {
  const router = useRouter();
  const generatorPath = '/generator';
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [task, setTask] = useState('');
  const [error, setError] = useState<string>('');
  const [readinessResult, setReadinessResult] = useState<ReadinessCheckResponse | null>(null);
  const [checkingReadiness, setCheckingReadiness] = useState(false);
  const [overridingReadiness, setOverridingReadiness] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [lastReadinessRequestHash, setLastReadinessRequestHash] = useState('');
  const [ticket, setTicket] = useState<TicketDetailResponse | null>(null);
  const [generatingTicket, setGeneratingTicket] = useState(false);
  const [dispatchingTicket, setDispatchingTicket] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<TicketDispatchResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<TicketingConnection | null>(null);
  // True only when the currently-shown ticket came from trusting a saved
  // draft on resume (see the resume effect below) -- drives whether the
  // "Re-check readiness" escape hatch is shown.
  const [resumedFromDraft, setResumedFromDraft] = useState(false);
  const [confirmedFields, setConfirmedFields] = useState<Record<string, string>>({});
  const [checkingAcceptanceCriteria, setCheckingAcceptanceCriteria] = useState(false);
  const [acCheckResult, setAcCheckResult] = useState<TicketAcCheckResponse | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [savedTicketId, setSavedTicketId] = useState<string | null>(null);
  // Optimistic-locking bookkeeping for the saved-ticket PATCH endpoint: the
  // version we last saw from the server, and whether our last write lost a
  // race to someone else's edit. On conflict we stop autosaving silently
  // (rather than repeatedly 409ing) until the page is reloaded, which is
  // when this component remounts and both reset naturally.
  const [savedTicketVersion, setSavedTicketVersion] = useState<number | null>(null);
  const [saveConflict, setSaveConflict] = useState(false);
  const [savingPlaceholder, setSavingPlaceholder] = useState(false);
  const ticketDispatchInFlightRef = useRef(false);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);
  const [ticketFeedbackTargetId, setTicketFeedbackTargetId] = useState<string | null>(null);
  const [showEngineeringInputDialog, setShowEngineeringInputDialog] = useState(false);
  const [authStatus, setAuthStatus] = useState<'loading' | 'signed-in' | 'signed-out'>('loading');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showPromptAssist, setShowPromptAssist] = useState(false);
  const promptAssistRef = useRef<HTMLDivElement | null>(null);
  const taskInputRef = useRef<HTMLTextAreaElement | null>(null);
  const ticketResultRef = useRef<HTMLDivElement | null>(null);
  const lastPromptRef = useRef('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const loadingStartRef = useRef<number | null>(null);
  const readinessCheckInFlightRef = useRef(false);
  const ticketDetailInFlightRef = useRef(false);
  const sessionRetryHandle = useRef<(() => void) | null>(null);
  const [sessionRetrying, setSessionRetrying] = useState(false);
  const [sessionCheckStalled, setSessionCheckStalled] = useState(false);
  const beginLoadingSequence = () => {
    loadingStartRef.current = null;
    setLoadingStepIndex(0);
    setLoadingProgress(0);
    setLoadingElapsed(0);
  };

  // quota UI
  const [quota, setQuota] = useState<Quota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);

  const loadingSteps = TICKET_LOADING_STEPS;
  const loadingDurationMs = TICKET_LOADING_DURATION_MS;
  const ticketFlowLoading = checkingReadiness || generatingTicket;

  const closeEngineeringInputDialog = () => {
    setShowEngineeringInputDialog(false);
    taskInputRef.current?.focus();
  };

  const dismissWalkthrough = useCallback(
    (options: { openPromptAssist?: boolean } = {}) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(PROMPT_WALKTHROUGH_KEY, 'true');
      }
      setShowWalkthrough(false);
      setShowPromptAssist(Boolean(options.openPromptAssist));
    },
    []
  );

  const expandPromptComposer = useCallback((focus = false) => {
    setIsPromptCollapsed(false);
    if (focus) {
      window.setTimeout(() => {
        taskInputRef.current?.focus();
      }, 0);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let resolved = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const applySession = (session: Session | null) => {
      if (!mounted) return;
      resolved = true;
      setSessionCheckStalled(false);
      setToken(session?.access_token ?? null);
      setEmail(session?.user?.email ?? '');
      setUserId(session?.user?.id ?? null);
      setAuthStatus(session ? 'signed-in' : 'signed-out');
    };

    const runSessionCheck = async (manual = false) => {
      if (!mounted) return;
      if (manual) setSessionRetrying(true);
      try {
        const { data } = await safeGetSession({
          timeoutMs: manual ? 6000 : 3500,
          preferCache: !manual,
        });
        if (!mounted) return;
        applySession(data.session || null);
      } finally {
        if (manual && mounted) setSessionRetrying(false);
      }
    };

    sessionRetryHandle.current = () => runSessionCheck(true);

    runSessionCheck(false);

    fallbackTimer = setTimeout(() => {
      if (!mounted || resolved) return;
      setSessionCheckStalled(true);
    }, 5000);

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      applySession(session ?? null);
    });

    return () => {
      mounted = false;
      sessionRetryHandle.current = null;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRole = async () => {
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (alive) {
        setIsAdmin((prof?.role ?? 'user') === 'admin');
      }
    };

    loadRole();
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(PROMPT_WALKTHROUGH_KEY);
    if (!seen) {
      setShowWalkthrough(true);
    }
  }, []);

  useEffect(() => {
    if (!showPromptAssist) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (promptAssistRef.current && target && !promptAssistRef.current.contains(target)) {
        setShowPromptAssist(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPromptAssist]);

  useEffect(() => {
    if (!readinessResult && !ticket) return;
    const frame = window.requestAnimationFrame(() => {
      ticketResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [readinessResult, ticket]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isAnyLoading = ticketFlowLoading;
    if (!isAnyLoading) {
      loadingStartRef.current = null;
      setLoadingProgress(0);
      setLoadingStepIndex(0);
      setLoadingElapsed(0);
      return;
    }

    if (!loadingStartRef.current) {
      loadingStartRef.current = Date.now();
    }

    const tick = () => {
      const start = loadingStartRef.current ?? Date.now();
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / loadingDurationMs);
      setLoadingProgress(progress);
      if (loadingSteps.length > 0) {
        const rawIndex = Math.min(
          loadingSteps.length - 1,
          Math.floor(progress * loadingSteps.length)
        );
        setLoadingStepIndex(rawIndex);
      }
      setLoadingElapsed(Math.round(elapsed / 1000));
    };

    tick();
    const interval = window.setInterval(tick, 400);

    return () => window.clearInterval(interval);
  }, [ticketFlowLoading, loadingDurationMs, loadingSteps]);

  const refreshQuota = useCallback(
    async (
      overrideToken?: string | null,
      options: { clearOnError?: boolean; force?: boolean; showLoading?: boolean } = {}
    ) => {
      const t = overrideToken || token;
      if (!t) {
        setQuota(null);
        setQuotaLoading(false);
        return null;
      }

      if (options.showLoading) setQuotaLoading(true);
      try {
        const nextQuota = await loadPageSessionQuota(t, { force: options.force });
        setQuota(nextQuota);
        return nextQuota;
      } catch {
        if (options.clearOnError !== false) setQuota(null);
        return null;
      } finally {
        if (options.showLoading) setQuotaLoading(false);
      }
    },
    [token]
  );

  // Fetch quota once per page session, then refresh only after generation or a known plan change.
  useEffect(() => {
    let alive = true;
    (async () => {
      setQuotaLoading(true);
      try {
        const sess = (await safeGetSession()).data.session;
        const t = sess?.access_token || token;
        if (!t) {
          if (alive) setQuota(null);
          return;
        }
        const planChangeMarker =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(QUOTA_PLAN_CHANGE_KEY) || ''
            : '';
        const forceRefreshForPlanChange =
          Boolean(planChangeMarker) && planChangeMarker !== pageSessionQuotaPlanChangeMarker;
        const nextQuota = await loadPageSessionQuota(t, { force: forceRefreshForPlanChange });
        if (alive) {
          pageSessionQuotaPlanChangeMarker = planChangeMarker;
          setQuota(nextQuota);
        }
      } catch {
        if (alive) setQuota(null);
      } finally {
        if (alive) setQuotaLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const onCheckReadiness = async (options?: ReadinessCheckOptions) => {
    if (ticketFlowLoading || readinessCheckInFlightRef.current) return;
    const plan = planReadinessCheckRequest(task, isPlaceholder, options);
    const { trimmedTask, effectiveConfirmedFields, isApplyingAnswers } = plan;
    const requestHash = hashClientInput(trimmedTask);
    // Applying dropdown selections or typed answers is always an
    // intentional, explicit re-check -- skip the "already showing this"
    // dedupe guard, which exists to stop accidental duplicate clicks on
    // the same unmodified input, not to block a deliberate follow-up
    // action.
    if (!isApplyingAnswers && readinessResult && lastReadinessRequestHash === requestHash) {
      setError('');
      toast.info('Already showing the readiness check for this input.');
      return;
    }
    readinessCheckInFlightRef.current = true;

    if (isApplyingAnswers) {
      setConfirmedFields(effectiveConfirmedFields);
      if (options?.taskOverride) {
        setTask(options.taskOverride);
      }
    } else {
      setConfirmedFields({});
    }
    if (options?.isPlaceholderOverride !== undefined) {
      setIsPlaceholder(options.isPlaceholderOverride);
    }
    if (!options?.keepSavedTicketId) {
      setSavedTicketId(null);
    }

    setError('');
    setReadinessResult(null);
    setTicket(null);
    setDispatchResult(null);
    setTicketFeedbackTargetId(null);
    setAcCheckResult(null);
    setResumedFromDraft(false);

    let effToken = token;

    setShowPromptAssist(false);

    try {
      // Always re-read session to avoid stale token state
      try {
        const { data } = await safeGetSession();
        const fresh = data.session || null;
        if (fresh?.access_token) {
          effToken = fresh.access_token;
          setToken(effToken);
          setEmail(fresh.user?.email ?? '');
          setAuthStatus('signed-in');
        } else if (!fresh) {
          setAuthStatus('signed-out');
        }
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }

      if (!effToken) {
        const msg = 'Please sign in to check readiness.';
        setError(msg);
        toast.info(msg);
        router.push('/signin?next=' + encodeURIComponent(generatorPath));
        return;
      }

      if (trimmedTask.length < 8) {
        const msg = 'Please write at least 8 characters.';
        setError(msg);
        toast.info(msg);
        return;
      }

      if (!isEngineeringRelatedInput(trimmedTask)) {
        setShowEngineeringInputDialog(true);
        return;
      }

      lastPromptRef.current = trimmedTask;
      beginLoadingSequence();
      setCheckingReadiness(true);

      const raw = await apiPost<ReadinessCheckResponse>(
        '/api/generate/readiness-check',
        plan.body,
        { token: effToken, timeoutMs: 30000 }
      );

      const data = _normalize_pm_assistant_response(raw) as ReadinessCheckResponse;
      setReadinessResult(data);
      setIsPromptCollapsed(true);
      setLastReadinessRequestHash(requestHash);
      dismissWalkthrough();
      toast.success(data.ready ? 'Looks ready' : 'Readiness check complete');
    } catch (e: any) {
      const msg = String(e?.message || '');

      if (e instanceof ApiError && e.code === 'engineering_input_required') {
        setShowEngineeringInputDialog(true);
      } else if (e instanceof ApiError && e.code === 'content_blocked') {
        const emsg = "This request couldn't be processed — please rephrase and try again.";
        setError(emsg);
        toast.error('Request blocked');
      } else if (/timed out/i.test(msg)) {
        const emsg = 'This is taking longer than usual and timed out. Please try again.';
        setError(emsg);
        toast.error('Readiness check timed out');
      } else if (/Backend responded \d+:/i.test(msg)) {
        setError(msg);
        toast.error('Server error during readiness check');
      } else {
        const emsg = `Could not complete the request: ${msg || 'Unknown error'}`
        setError(emsg);
        toast.error('Could not complete the request');
      }
    } finally {
      readinessCheckInFlightRef.current = false;
      setCheckingReadiness(false);
    }
  };

  const onGenerateTicket = async () => {
    if (ticketFlowLoading || ticketDetailInFlightRef.current || !readinessResult?.ready) return;
    ticketDetailInFlightRef.current = true;

    setError('');
    setTicket(null);
    setDispatchResult(null);
    setTicketFeedbackTargetId(null);
    setAcCheckResult(null);

    let effToken = token;

    try {
      try {
        const { data } = await safeGetSession();
        const fresh = data.session || null;
        if (fresh?.access_token) {
          effToken = fresh.access_token;
          setToken(effToken);
        }
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }

      if (!effToken) {
        const msg = 'Please sign in to generate.';
        setError(msg);
        toast.info(msg);
        router.push('/signin?next=' + encodeURIComponent(generatorPath));
        return;
      }

      beginLoadingSequence();
      setGeneratingTicket(true);

      const raw = await apiPost<TicketDetailResponse>(
        '/api/generate/ticket-detail',
        { readiness_result: readinessResult, saved_ticket_id: savedTicketId },
        { token: effToken, timeoutMs: 30000 }
      );

      const data = _normalize_pm_assistant_response(raw) as TicketDetailResponse;
      setTicket(data);
      setTicketFeedbackTargetId(data.id || createClientId());
      toast.success('Ticket generated');

      // Best-effort only -- purely informational (dispatch button label /
      // "not connected" hint), never blocks ticket generation if it fails.
      apiGet<TicketingConnection>('/api/account/ticketing', { token: effToken, timeoutMs: 10000 })
        .then(setConnectionStatus)
        .catch(() => {});

      // refresh quota after a successful generation
      await refreshQuota(effToken, { clearOnError: false, force: true });
    } catch (e: any) {
      const msg = String(e?.message || '');

      if (e instanceof ApiError && e.code === 'not_ready') {
        const emsg = 'This request still has open gaps — check readiness again before generating a ticket.';
        setError(emsg);
        toast.error('Not ready yet');
      } else if (/timed out/i.test(msg)) {
        const emsg = 'This is taking longer than usual and timed out. Please try again; it often finishes within ~20 seconds.'
        setError(emsg);
        toast.error('Generation timed out');
      } else if (/Backend responded \d+:/i.test(msg)) {
        setError(msg);
        toast.error('Server error during generation');
      } else {
        const emsg = `Could not complete the request: ${msg || 'Unknown error'}`
        setError(emsg);
        toast.error('Could not complete the request');
      }
    } finally {
      ticketDetailInFlightRef.current = false;
      setGeneratingTicket(false);
    }
  };

  const onOverrideReadiness = async (reason: string) => {
    if (overridingReadiness || !readinessResult || !task.trim()) return;
    setOverrideError(null);

    let effToken = token;

    try {
      try {
        const { data } = await safeGetSession();
        const fresh = data.session || null;
        if (fresh?.access_token) {
          effToken = fresh.access_token;
          setToken(effToken);
        }
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }

      if (!effToken) {
        toast.info('Please sign in to override a readiness check.');
        router.push('/signin?next=' + encodeURIComponent(generatorPath));
        return;
      }

      setOverridingReadiness(true);

      const gapKeys = readinessResult.facts.filter((f) => !f.present).map((f) => f.key);
      const presentKeys = readinessResult.facts.filter((f) => f.present).map((f) => f.key);

      await apiPost(
        '/api/generate/override',
        {
          message_text: task.trim(),
          gap_keys: gapKeys,
          present_keys: presentKeys,
          readiness_mode: readinessResult.mode,
          reason,
          readiness_check_id: readinessResult.check_id ?? null,
        },
        { token: effToken, timeoutMs: 15000 }
      );

      // Mirrors the reference Slack flow: once the override reason is
      // logged, treat every fact as present so the "Generate ticket" gate
      // (both here and server-side in build_ticket_detail) opens up --
      // the override IS the record of why this is being treated as ready,
      // not a way to skip having one.
      setReadinessResult({
        ...readinessResult,
        ready: true,
        facts: readinessResult.facts.map((f) => ({ ...f, present: true })),
      });
      toast.success('Marked ready — override logged.');
    } catch (e: any) {
      const msg = String(e?.message || 'Could not save the override. Please try again.');
      setOverrideError(msg);
      toast.error('Could not save the override');
    } finally {
      setOverridingReadiness(false);
    }
  };

  const onSendToTracker = async () => {
    if (dispatchingTicket || ticketDispatchInFlightRef.current || !ticket) return;
    ticketDispatchInFlightRef.current = true;

    setDispatchResult(null);

    let effToken = token;

    try {
      try {
        const { data } = await safeGetSession();
        const fresh = data.session || null;
        if (fresh?.access_token) {
          effToken = fresh.access_token;
          setToken(effToken);
        }
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }

      if (!effToken) {
        toast.info('Please sign in to send this ticket to your tracker.');
        router.push('/signin?next=' + encodeURIComponent(generatorPath));
        return;
      }

      setDispatchingTicket(true);

      const raw = await apiPost<TicketDispatchResult>(
        '/api/generate/ticket-dispatch',
        buildDispatchPayload(ticket, savedTicketId),
        { token: effToken, timeoutMs: 30000 }
      );

      const data = _normalize_pm_assistant_response(raw) as TicketDispatchResult;
      setDispatchResult(data);
      if (data.status === 'created') {
        toast.success('Sent to tracker');
      } else if (data.status !== 'skipped') {
        toast.error('Could not send to tracker');
      }
    } catch (e: any) {
      setDispatchResult({ status: 'failed', error: String(e?.message || 'Unknown error') });
      toast.error('Could not send to tracker');
    } finally {
      ticketDispatchInFlightRef.current = false;
      setDispatchingTicket(false);
    }
  };

  const onCheckAcceptanceCriteria = async () => {
    if (checkingAcceptanceCriteria || !ticket) return;

    let effToken = token;
    try {
      try {
        const { data } = await safeGetSession();
        const fresh = data.session || null;
        if (fresh?.access_token) {
          effToken = fresh.access_token;
          setToken(effToken);
        }
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }

      if (!effToken) {
        toast.info('Please sign in to check acceptance criteria.');
        router.push('/signin?next=' + encodeURIComponent(generatorPath));
        return;
      }

      setCheckingAcceptanceCriteria(true);
      const raw = await apiPost<TicketAcCheckResponse>(
        '/api/generate/ticket-ac-check',
        { ticket },
        { token: effToken, timeoutMs: 30000 }
      );
      setAcCheckResult(_normalize_pm_assistant_response(raw) as TicketAcCheckResponse);
    } catch (e: any) {
      toast.error('Could not check acceptance criteria');
    } finally {
      setCheckingAcceptanceCriteria(false);
    }
  };

  const onSavePlaceholder = async () => {
    const trimmedTask = task.trim();
    if (savingPlaceholder || trimmedTask.length < 8) return;
    if (saveConflict) {
      toast.error(SAVE_CONFLICT_MESSAGE, { durationMs: 5000 });
      return;
    }

    let effToken = token;
    try {
      try {
        const { data } = await safeGetSession();
        const fresh = data.session || null;
        if (fresh?.access_token) {
          effToken = fresh.access_token;
          setToken(effToken);
        }
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }

      if (!effToken) {
        toast.info('Please sign in to save this placeholder.');
        router.push('/signin?next=' + encodeURIComponent(generatorPath));
        return;
      }

      setSavingPlaceholder(true);
      const body = buildSavePlaceholderPayload(task, confirmedFields);
      const raw = savedTicketId
        ? await apiFetch<SavedTicket>(`/api/tickets/saved/${savedTicketId}`, {
            method: 'PATCH',
            body: { ...body, expected_version: savedTicketVersion },
            token: effToken,
            timeoutMs: 15000,
          })
        : await apiPost<SavedTicket>('/api/tickets/saved', body, { token: effToken, timeoutMs: 15000 });

      const saved = _normalize_pm_assistant_response(raw) as SavedTicket;
      setSavedTicketId(saved.id);
      setSavedTicketVersion(saved.version);
      toast.success('Saved as a placeholder — find it under "Parked placeholders."');
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 409) {
        setSaveConflict(true);
        toast.error(SAVE_CONFLICT_MESSAGE, { durationMs: 5000 });
      } else {
        toast.error('Could not save this placeholder');
      }
    } finally {
      setSavingPlaceholder(false);
    }
  };

  // Resume a parked placeholder via /generator?saved=<id> -- pre-fills the
  // composer and runs the same readiness check the rest of the flow uses,
  // rather than a separate resume page. Reads window.location directly
  // (not next/navigation's useSearchParams) so this page doesn't need a
  // Suspense boundary just for a one-time read on mount.
  const resumeIdRef = useRef<string | null>(null);
  useEffect(() => {
    const resumeId = getResumeIdFromSearch(window.location.search);
    if (!resumeId || resumeIdRef.current === resumeId) return;
    resumeIdRef.current = resumeId;

    (async () => {
      let effToken = token;
      try {
        const { data } = await safeGetSession();
        effToken = data.session?.access_token || effToken;
      } catch {
        // Ignore fetch errors and fall back to existing token state
      }
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent(`${generatorPath}?saved=${resumeId}`));
        return;
      }

      try {
        const raw = await apiGet<SavedTicket>(`/api/tickets/saved/${resumeId}`, { token: effToken, timeoutMs: 15000 });
        const saved = _normalize_pm_assistant_response(raw) as SavedTicket;
        setTask(saved.task_input);
        setSavedTicketId(saved.id);
        setSavedTicketVersion(saved.version);
        setIsPromptCollapsed(false);

        if (shouldTrustSavedDraft(saved)) {
          // Trust the saved draft by default -- restores it directly onto
          // the editable ticket view instead of re-spending an LLM call on
          // a readiness check the user already got past once. "Re-check
          // readiness" (below) is the explicit escape hatch for rubric
          // drift since this was parked.
          const draft = _normalize_pm_assistant_response(saved.generated_ticket) as TicketDetailResponse;
          setTicket(draft);
          setTicketFeedbackTargetId(draft.id || createClientId());
          setIsPlaceholder(saved.is_placeholder);
          setResumedFromDraft(true);
        } else {
          await onCheckReadiness({
            taskOverride: saved.task_input,
            confirmedFields: saved.confirmed_fields || {},
            isPlaceholderOverride: saved.is_placeholder,
            keepSavedTicketId: true,
          });
        }
      } catch {
        toast.error('Could not load that saved placeholder');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosaves inline ticket edits back onto the parked placeholder
  // (debounced) so editing after a resume doesn't just move the same
  // data-loss problem one step later. No-op when there's no savedTicketId
  // (a ticket that was never saved as a placeholder).
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  const onTicketFieldChange = useCallback(
    (next: TicketDetailResponse) => {
      setTicket(next);
      if (!savedTicketId || saveConflict) return;
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(async () => {
        try {
          const { data } = await safeGetSession();
          const effToken = data.session?.access_token || token;
          if (!effToken) return;
          const saved = await apiFetch<SavedTicket>(`/api/tickets/saved/${savedTicketId}`, {
            method: 'PATCH',
            body: { generated_ticket: next, expected_version: savedTicketVersion },
            token: effToken,
            timeoutMs: 15000,
          });
          setSavedTicketVersion(saved.version);
        } catch (e) {
          if (e instanceof ApiError && e.status === 409) {
            setSaveConflict(true);
            toast.error(SAVE_CONFLICT_MESSAGE, { durationMs: 5000 });
          } else {
            toast.error('Could not save your edit');
          }
        }
      }, 1000);
    },
    [savedTicketId, savedTicketVersion, saveConflict, token]
  );

  const markWalkthroughSeen = () => dismissWalkthrough({ openPromptAssist: true });

  const planLabel =
    quota?.plan === 'starter'
      ? 'Starter'
      : quota?.plan === 'pro'
      ? 'Pro'
      : 'Free';
  const currentLoadingStep =
    loadingSteps[Math.min(loadingStepIndex, loadingSteps.length - 1)] ?? loadingSteps[0];
  const progressPercent = Math.min(100, Math.round(loadingProgress * 100));
  const typicalSeconds = Math.round(loadingDurationMs / 1000);
  const renderLoadingPanel = () => (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 shadow-inner">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">
          {currentLoadingStep.title}
        </p>
        <span className="text-xs uppercase tracking-wide text-blue-700">
          Step {loadingStepIndex + 1} of {loadingSteps.length}
        </span>
      </div>
      <p className="mt-1 text-blue-900/80">{currentLoadingStep.detail}</p>
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-blue-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-blue-700">
          <span>{progressPercent}% complete</span>
          <span>Elapsed {loadingElapsed}s · Typically ~{typicalSeconds}s</span>
        </div>
      </div>
      <ol className="mt-4 space-y-2 text-xs text-blue-900">
        {loadingSteps.map((step, index) => {
          const status =
            index < loadingStepIndex
              ? 'done'
              : index === loadingStepIndex
              ? 'active'
              : 'queued';
          return (
            <li
              key={step.title}
              className={`rounded-xl border px-3 py-2 ${
                status === 'done'
                  ? 'border-blue-200 bg-white text-blue-700'
                  : status === 'active'
                  ? 'border-blue-400 bg-blue-100 text-blue-900 font-medium'
                  : 'border-transparent text-blue-700/70'
              }`}
            >
              <span className="block text-[13px]">{step.title}</span>
              <span className="mt-1 block text-[12px] text-blue-900/70">{step.detail}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  const nextCycle = quota?.window_end ? new Date(quota.window_end) : null;
  const nextCycleLabel = nextCycle
    ? nextCycle.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;
  const accountBadges = quota ? [
    { label: `${planLabel} plan`, icon: 'card' as const },
    { label: `${quota.used} / ${quota.limit} used`, icon: 'ticket' as const, title: nextCycleLabel ? `Next cycle starts ${nextCycleLabel}` : undefined },
  ] : [{ label: quotaLoading ? 'Loading usage…' : 'Usage unavailable', icon: 'ticket' as const }];
  const isInitialIntake = !readinessResult && !ticket;

  const promptGuide = (
    <>
      {showWalkthrough && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
                Prompt guide
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Lead with the task, then mention target systems, rollout constraints, dependencies, and how the work should be validated.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markWalkthroughSeen}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-extrabold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50"
              >
                What to include
              </button>
              <button
                type="button"
                onClick={() => dismissWalkthrough()}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-transparent px-3 text-sm font-extrabold text-slate-500 hover:text-slate-700"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  const promptAssistControl = (
    <div className="relative" ref={promptAssistRef}>
      <button
        type="button"
        onClick={() => {
          setShowPromptAssist((prev) => !prev);
        }}
        aria-expanded={showPromptAssist}
        aria-controls="prompt-assist"
        className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Tips &amp; starters
      </button>
      {showPromptAssist && (
        <div
          id="prompt-assist"
          role="dialog"
          aria-label="Prompt tips and starters"
          className={isInitialIntake ? 'mt-3 max-h-[32rem] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700' : 'absolute right-0 top-full z-20 mt-2 w-[min(30rem,calc(100vw-3rem))] rounded-2xl border border-blue-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.14)]'}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-extrabold text-slate-950">Write a realistic prompt</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Keep it outcome-first, then add environment, constraints, and rollout context.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPromptAssist(false)}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700"
            >
              Close
            </button>
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm">
            <li>Describe the outcome you expect and who needs it.</li>
            <li>Mention the platforms, services, environments, or tooling involved.</li>
            <li>Call out dependencies, rollout phases, or ownership constraints so estimates stay realistic.</li>
            <li>Spell out validations, policies, or edge cases LucidSpec must preserve.</li>
          </ol>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-extrabold text-slate-700">Privacy:</span>{' '}
            {REQUEST_PRIVACY_DISCLOSURE}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
              Example workflow families
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              These are examples of request families LucidSpec can review. They are not a promise of direct deterministic support for every workflow in that family.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLE_WORKFLOW_FAMILIES.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-900"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
              What to expect from results
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SUPPORT_DEPTH_EXPECTATIONS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-600">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 max-h-80 overflow-y-auto pr-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
              Starter prompts for grounded requests
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Use these as writing examples, not support claims. LucidSpec may return direct, family-level, partial, or unsupported results depending on the exact workflow and missing details.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Prefer concrete workflow wording like <span className="font-semibold text-slate-700">S3 lifecycle policy</span> over broad phrases like <span className="font-semibold text-slate-700">storage optimization</span>.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For software-delivery requests, prefer concrete workflow wording like <span className="font-semibold text-slate-700">CI/CD pipeline change</span>, <span className="font-semibold text-slate-700">deployment workflow change</span>, <span className="font-semibold text-slate-700">ECS deployment</span>, or <span className="font-semibold text-slate-700">software bug fix</span> over broad phrases like <span className="font-semibold text-slate-700">delivery optimization</span>, <span className="font-semibold text-slate-700">improve the pipeline</span>, or <span className="font-semibold text-slate-700">release process improvement</span>.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For application configuration requests, use exact wording like <span className="font-semibold text-slate-700">config change</span>, <span className="font-semibold text-slate-700">feature flag</span>, <span className="font-semibold text-slate-700">environment variable</span>, or <span className="font-semibold text-slate-700">values.yaml</span> and name the target service, config surface, config key, proposed value, dependencies, approval, change window, validation, and rollback path instead of broad phrases like <span className="font-semibold text-slate-700">configuration cleanup</span>, <span className="font-semibold text-slate-700">tune app settings</span>, or <span className="font-semibold text-slate-700">optimize runtime config</span>.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For storage-related requests, name the exact route you want reviewed, such as the bucket, prefix, retention, transition, or expiration behavior in an <span className="font-semibold text-slate-700">S3 lifecycle policy</span>, or the datastore, capacity, storage tier, dependencies, and rollback path in a <span className="font-semibold text-slate-700">storage provisioning</span> request.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For CI/CD pipeline requests, name the exact route you want reviewed, such as the target service, deployment or workflow path, concrete pipeline-stage change, dependencies, approval, validation, and rollback path in a <span className="font-semibold text-slate-700">CI/CD pipeline change</span> request.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For deployment workflow requests, use exact <span className="font-semibold text-slate-700">deployment workflow change</span> wording and name the target service, current workflow, proposed workflow change, dependencies, approval, change window, validation, and rollback path instead of broad requests like <span className="font-semibold text-slate-700">clean up release flow</span> or <span className="font-semibold text-slate-700">optimize delivery</span>.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For platform build requests, name the exact route you want reviewed, such as a <span className="font-semibold text-slate-700">server build</span> with the target host, environment, sizing, template or image, dependencies, validation, and rollback path, instead of broad phrases like <span className="font-semibold text-slate-700">platform setup</span> or <span className="font-semibold text-slate-700">infrastructure expansion</span>.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              For compliance remediation requests, use exact workflow wording like <span className="font-semibold text-slate-700">audit control fix</span>, <span className="font-semibold text-slate-700">evidence gap remediation</span>, <span className="font-semibold text-slate-700">tagging control remediation</span>, or <span className="font-semibold text-slate-700">policy enforcement change</span> and name the control requirement, evidence gap, or guardrail, owner, evidence expectation, validation standard, approvals, and rollback or containment path instead of broad phrases like <span className="font-semibold text-slate-700">compliance cleanup</span>, <span className="font-semibold text-slate-700">audit work</span>, or <span className="font-semibold text-slate-700">enforce policy everywhere</span>.
            </p>
            <div className="mt-3 space-y-3">
              {PROMPT_STARTERS.map((group) => (
                <div key={group.domain} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {group.domain}
                  </p>
                  <div className="space-y-2">
                    {group.prompts.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => {
                          setTask(starter);
                          setShowPromptAssist(false);
                          taskInputRef.current?.focus();
                        }}
                        className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const requestError = error ? (
    <div role="alert" className="whitespace-pre-wrap rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {error}{' '}
      {/(quota_exceeded|Backend responded 402)/i.test(error) && <a href="/pricing" className="ml-1 text-blue-600 underline">Go to Pricing →</a>}
    </div>
  ) : null;

  const handleWorkspaceSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out');
    } finally {
      setToken(null);
      setEmail('');
      setUserId(null);
      setAuthStatus('signed-out');
      router.push('/');
      router.refresh();
    }
  };

  if (authStatus === 'loading') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">LucidSpec</h1>
        <p className="mt-1 text-sm text-slate-600">Checking your session…</p>
        {sessionCheckStalled && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Session verification is taking longer than expected, but the page will keep waiting instead of resetting.
          </p>
        )}
        <button
          type="button"
          onClick={() => sessionRetryHandle.current?.()}
          disabled={sessionRetrying}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
        >
          {sessionRetrying ? 'Trying again…' : 'Retry session check'}
        </button>
        <p className="mt-2 text-sm text-slate-500">If this still does not resolve, retry the session check.</p>
      </main>
    );
  }

  if (authStatus === 'signed-out') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">LucidSpec</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to generate tickets.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => router.push('/signin?next=' + encodeURIComponent(generatorPath))}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Sign in
          </button>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Sign up
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
    <ApplicationHeader readiness signedIn userEmail={email} onSignOut={handleWorkspaceSignOut} onSignIn={() => router.push('/signin?next=' + encodeURIComponent(generatorPath))} contentId="work-request-content" accountBadges={accountBadges} />
    <ReadinessShell activeHref="/generator" pageLabel="Work Requests" contentId="work-request-content" showUsageCostNav={isAdmin}>
      {showEngineeringInputDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="engineering-input-dialog-title"
            className="w-full max-w-sm rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
          >
            <h2 id="engineering-input-dialog-title" className="text-base font-extrabold text-slate-950">
              Engineering input required
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{ENGINEERING_INPUT_MESSAGE}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeEngineeringInputDialog}
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="mb-10 pt-2">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-slate-500"><Link href="/generator" className="hover:text-blue-700">Work Requests</Link><span aria-hidden="true">/</span><span aria-current="page">{isInitialIntake ? 'New Request' : 'Readiness Review'}</span></nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[40px] sm:leading-tight">{isInitialIntake ? 'Start with what you know.' : 'Work Requests'}</h1>
        {isInitialIntake ? <p className="mt-2 max-w-5xl text-sm leading-7 text-slate-600 sm:text-lg">Describe the work in plain language. LucidSpec will assess it against your configured readiness standards and help you identify what needs clarification.</p> : null}
      </header>

      <>
          {isInitialIntake ? <WorkRequestIntake
            value={task} onChange={setTask} inputRef={taskInputRef}
            isPlaceholder={isPlaceholder} onPlaceholderChange={setIsPlaceholder}
            onCheckReadiness={() => onCheckReadiness()} checkingReadiness={checkingReadiness} busy={ticketFlowLoading}
            onSavePlaceholder={onSavePlaceholder} savingPlaceholder={savingPlaceholder} savedTicketId={savedTicketId}
            advancedContent={<>{promptGuide}{promptAssistControl}</>} error={requestError}
            loadingPanel={ticketFlowLoading ? renderLoadingPanel() : null}
          /> : <section className="space-y-5">
            {promptGuide}

            <div className="space-y-3 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_18px_45px_rgba(37,99,235,0.08)] sm:p-5">
              {isPromptCollapsed && (readinessResult || ticket || ticketFlowLoading) ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
                        Prompt
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {buildPromptPreview(task)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => expandPromptComposer(true)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Edit prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => onCheckReadiness()}
                        disabled={ticketFlowLoading}
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700 disabled:opacity-60"
                      >
                        {checkingReadiness ? 'Checking…' : 'Check readiness again'}
                      </button>
                      <button
                        type="button"
                        onClick={() => expandPromptComposer(false)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-transparent px-3 text-sm font-extrabold text-slate-500 transition hover:text-slate-700"
                      >
                        Expand
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-[11px] font-medium text-slate-500">
                    <span className="font-extrabold text-slate-600">Privacy:</span>{' '}
                    {REQUEST_PRIVACY_DISCLOSURE}
                  </div>
                  {ticketFlowLoading ? renderLoadingPanel() : null}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
                          Prompt
                        </p>
                        <p className="text-sm leading-6 text-slate-500">
                          Describe the work in plain English. LucidSpec will infer structure from the task, constraints, and validation details you provide, then stay conservative if workflow support or execution details are incomplete.
                        </p>
                      </div>
                      {promptAssistControl}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-[11px] font-medium text-slate-500">
                      <span className="font-extrabold text-slate-600">Privacy:</span>{' '}
                      {REQUEST_PRIVACY_DISCLOSURE}
                    </div>
                    <textarea
                      rows={readinessResult || ticket ? 5 : 7}
                      className="w-full rounded-2xl border border-blue-100 bg-white p-4 text-base text-slate-900 shadow-inner transition placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder={SPEC_PROMPT_PLACEHOLDER}
                      ref={taskInputRef}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isPlaceholder}
                        onChange={(e) => setIsPlaceholder(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      This is a placeholder ticket &mdash; only quarter and environment are needed for now.
                    </label>
                    <Link href="/generator/placeholders" className="text-sm font-semibold text-blue-700 underline">
                      View parked placeholders
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700 disabled:opacity-60"
                      onClick={() => onCheckReadiness()}
                      disabled={ticketFlowLoading}
                    >
                      {checkingReadiness ? 'Checking readiness…' : 'Check readiness'}
                    </button>
                    {isPlaceholder ? (
                      <button
                        type="button"
                        onClick={onSavePlaceholder}
                        disabled={savingPlaceholder || task.trim().length < 8}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                      >
                        {savingPlaceholder ? 'Saving…' : savedTicketId ? 'Update saved placeholder' : 'Save for later'}
                      </button>
                    ) : null}
                    {readinessResult || ticket ? (
                      <button
                        type="button"
                        onClick={() => setIsPromptCollapsed(true)}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Collapse prompt
                      </button>
                    ) : null}
                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 whitespace-pre-wrap">
                        {error}{' '}
                        {/(quota_exceeded|Backend responded 402)/i.test(error) && (
                          <a href="/pricing" className="text-blue-600 underline ml-1">
                            Go to Pricing →
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {ticketFlowLoading && renderLoadingPanel()}
                </>
              )}
            </div>

          </section>}

          {readinessResult && !ticket && (
            <section ref={ticketResultRef} className="mt-6 space-y-4">
              <ReadinessCheckPanel
                result={readinessResult}
                onApplyAnswers={({ confirmedFields, appendText }) => {
                  const trimmedAppend = appendText.trim();
                  onCheckReadiness({
                    confirmedFields,
                    keepSavedTicketId: true,
                    ...(trimmedAppend ? { taskOverride: `${task.trim()}\n${trimmedAppend}` } : {}),
                  });
                }}
                applyingAnswers={checkingReadiness}
                onOverride={onOverrideReadiness}
                overriding={overridingReadiness}
                overrideError={overrideError}
              />
              {readinessResult.ready ? (
                <button
                  type="button"
                  onClick={onGenerateTicket}
                  disabled={ticketFlowLoading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700 disabled:opacity-60"
                >
                  {generatingTicket ? 'Generating… (can take ~20s)' : 'Generate ticket'}
                </button>
              ) : null}
            </section>
          )}

          {ticket && (
            <section ref={ticketResultRef} className="mt-6 space-y-4">
              {resumedFromDraft ? (
                <p className="border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Showing the draft you already generated for this placeholder.{' '}
                  <button
                    type="button"
                    onClick={() => onCheckReadiness({ keepSavedTicketId: true })}
                    className="font-semibold text-blue-700 underline"
                  >
                    Re-check readiness
                  </button>
                </p>
              ) : null}
              <LeanTicketCard
                ticket={ticket}
                onTicketChange={onTicketFieldChange}
                onSendToTracker={onSendToTracker}
                dispatching={dispatchingTicket}
                dispatchResult={dispatchResult}
                connectionStatus={connectionStatus}
                onCheckAcceptanceCriteria={onCheckAcceptanceCriteria}
                checkingAcceptanceCriteria={checkingAcceptanceCriteria}
                acCheckResult={acCheckResult}
              />
              <FeedbackPanel
                targetType="ticket"
                targetId={ticketFeedbackTargetId || ticket.id || null}
                source="ticket_generator"
                title="Was this ticket accurate and useful?"
              />
            </section>
          )}
      </>

    </ReadinessShell>
    </>
  );
}
