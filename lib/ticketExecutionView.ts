import type { TicketExecutionDashboardData, DecisionMetric } from './ticketDashboardTypes';
import type { TicketExecutionView } from './apiTypes';
import { moderate_text } from './redaction';

const EMPTY_VALUES = new Set([
  '',
  'none',
  'null',
  'undefined',
  'not available',
  'not captured',
  'not reported',
  'not_reported',
  'backend did not return',
]);

const INTERNAL_REPAIR_PATTERNS = [
  /\bregenerate while preserving\b/i,
  /\bconfirm the operational constraints\b/i,
  /\binternal repair\b/i,
  /\binternal invalidation\b/i,
  /\brepair hint\b/i,
  /\bbackend did not return\b/i,
  /\bnot_reported\b/i,
];

const SECTION_HEADING_ONLY = /^(?:blocked now|needed before execution|needed soon|later|critical blocker|implementation blocker)s?$/i;

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function containsInternalRepairLanguage(value: unknown): boolean {
  const cleaned = typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim() : '';
  return Boolean(cleaned) && INTERNAL_REPAIR_PATTERNS.some((pattern) => pattern.test(cleaned));
}

function cleanUserFacingText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const cleaned = moderate_text(stripHtml(value)).replace(/\s+/g, ' ').trim();
  if (!cleaned || EMPTY_VALUES.has(cleaned.toLowerCase()) || SECTION_HEADING_ONLY.test(cleaned) || containsInternalRepairLanguage(cleaned)) {
    return '';
  }
  return cleaned;
}

const text = (value: unknown): string => cleanUserFacingText(typeof value === 'string' ? value : String(value ?? ''));
const NO_BLOCKER_TITLE = 'No blockers identified';
const NO_BLOCKER_DESCRIPTION =
  'No blocking dependency was identified from the provided ticket details. Verify access, dependencies, approvals, and required configuration before starting.';
const NOT_APPLICABLE = 'Not applicable';
const NO_BLOCKER_VALUES = new Set([
  '',
  'no blocker',
  'no blocker.',
  'no blockers',
  'no blockers.',
  'none',
  'n/a',
  'not applicable',
  'not captured',
]);
const STOP_CONDITION_PLACEHOLDER_RE =
  /\b(?:not captured|stop condition not captured|not provided|n\/?a|tbd|to be determined|none provided)\b/i;
const NOT_AVAILABLE = 'Not available';

const nonempty = (...values: unknown[]): string => {
  for (const value of values) {
    const cleaned = text(value);
    if (cleaned) return cleaned;
  }
  return '';
};

const toDecisionTone = (tone: unknown): DecisionMetric['tone'] => {
  const normalized = text(tone).toLowerCase();
  if (normalized === 'negative' || normalized === 'positive' || normalized === 'warning' || normalized === 'neutral') {
    return normalized;
  }
  return 'neutral';
};

const normalizeBlockedUntil = (value: string, hasBlockers: boolean): string => {
  if (hasBlockers) return value || 'Not captured';
  return NO_BLOCKER_VALUES.has(value.toLowerCase()) ? NO_BLOCKER_TITLE : value;
};

const noBlockerItem = () => ({
  title: NO_BLOCKER_TITLE,
  description: NO_BLOCKER_DESCRIPTION,
  neededBy: NOT_APPLICABLE,
});

const isPlaceholderStopText = (value: unknown): boolean => {
  const cleaned = text(value).toLowerCase().replace(/^if\s+/, '').replace(/^stop if\s+/, '').trim();
  return !cleaned || STOP_CONDITION_PLACEHOLDER_RE.test(cleaned);
};

const unavailableStopCondition = () => ({
  if: NOT_AVAILABLE,
  then: NOT_AVAILABLE,
  when: NOT_AVAILABLE,
});

const normalizeStopCondition = (raw: TicketExecutionView['stop_conditions']) => {
  const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const usable = rows.find((item) => !isPlaceholderStopText(item?.if_this_happens));
  if (!usable) return unavailableStopCondition();
  return {
    if: nonempty(usable.if_this_happens, NOT_AVAILABLE),
    then: isPlaceholderStopText(usable.then_do_this)
      ? NOT_AVAILABLE
      : nonempty(usable.then_do_this, NOT_AVAILABLE),
    when: isPlaceholderStopText(usable.when_checked)
      ? NOT_AVAILABLE
      : nonempty(usable.when_checked, NOT_AVAILABLE),
  };
};

const isBlockedUntilLabel = (value: unknown): boolean => /^blocked until:?$/i.test(text(value));

const capitalizeSentence = (value: string): string => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const startsWithActionVerb = (value: string): boolean =>
  /^(attach|apply|build|configure|coordinate|create|deploy|document|enable|implement|install|prepare|record|review|run|test|update|validate|verify)\b/i.test(
    value
  );

const cleanExecutionPlanStep = (value: string): string => {
  let cleaned = value.replace(/^\s*[a-z]:\s*/i, '').trim();
  const colonMatch = cleaned.match(/^(.{3,140}?):\s+(.+)$/);
  if (colonMatch && startsWithActionVerb(colonMatch[2].trim())) {
    cleaned = colonMatch[2].trim();
  }
  return capitalizeSentence(cleaned);
};

const stepText = (step: NonNullable<TicketExecutionView['execution_plan']>[number]): string => {
  const title = text(step?.title);
  const description = text(step?.description);
  return cleanExecutionPlanStep(description || title);
};

export function mapTicketExecutionViewToDashboardData(view: TicketExecutionView): TicketExecutionDashboardData {
  const header = view.header || {};
  const decisionStrip = view.decision_strip || {};
  const immediate = view.immediate_actions || {};
  const fullDetails = view.full_details || {};
  const hasBlockers = (view.top_blockers || []).some(
    (blocker) => text(blocker?.title) || text(blocker?.description) || text(blocker?.needed_by)
  );
  const canProceed = nonempty(
    decisionStrip.can_proceed_label,
    typeof decisionStrip.can_proceed === 'boolean' ? (decisionStrip.can_proceed ? 'YES' : 'NO') : ''
  );
  const blockedUntilSource = nonempty(decisionStrip.blocked_until);
  const blockedUntil = blockedUntilSource ? normalizeBlockedUntil(blockedUntilSource, hasBlockers) : NOT_AVAILABLE;
  const doNow = nonempty(decisionStrip.do_now);
  const nextDecision = nonempty(decisionStrip.next_decision);
  const flow: DecisionMetric[] = (decisionStrip.flow || [])
    .map((item) => ({
      label: nonempty(item?.label, 'Decision'),
      value:
        isBlockedUntilLabel(item?.label)
          ? (nonempty(item?.value) ? normalizeBlockedUntil(nonempty(item?.value), hasBlockers) : NOT_AVAILABLE)
          : nonempty(item?.value, NOT_AVAILABLE),
      tone: toDecisionTone(item?.tone),
    }))
    .filter((item) => item.label && item.value);

  if (!flow.length) {
    flow.push(
      { label: 'Can we proceed', value: canProceed || NOT_AVAILABLE, tone: canProceed === 'YES' ? 'positive' : 'neutral' },
      { label: 'Blocked until', value: blockedUntil, tone: 'neutral' },
      { label: 'Do now', value: doNow || NOT_AVAILABLE, tone: 'neutral' },
      { label: 'Next decision', value: nextDecision || NOT_AVAILABLE, tone: 'neutral' }
    );
  }

  const blockers = (view.top_blockers || [])
    .map((blocker) => ({
      title: nonempty(blocker?.title, 'Execution blocker'),
      description: nonempty(blocker?.description, 'No blocker detail provided.'),
      neededBy: nonempty(blocker?.needed_by, NOT_APPLICABLE),
    }))
    .filter((blocker) => blocker.title || blocker.description);
  const needsAttentionSource = view.needs_attention || {};
  const attentionItem = (item: NonNullable<typeof needsAttentionSource.blocking_now>[number]) => ({
    title: nonempty(item?.title, 'Execution attention item'),
    description: nonempty(item?.description, 'No attention detail provided.'),
    neededBy: nonempty(item?.needed_by, NOT_APPLICABLE),
  });
  const needsAttention = {
    blockingNow: (needsAttentionSource.blocking_now || []).map(attentionItem).filter((item) => item.title || item.description),
    neededSoon: (needsAttentionSource.needed_soon || []).map(attentionItem).filter((item) => item.title || item.description),
    later: (needsAttentionSource.later || []).map(attentionItem).filter((item) => item.title || item.description),
  };
  if (!needsAttention.blockingNow.length && blockers.length) {
    needsAttention.blockingNow = blockers;
  }

  const executionPlan = (view.execution_plan || []).map(stepText).filter(Boolean);
  const definitionOfDone = (view.definition_of_done || [])
    .map((item) => {
      const detailParts = [
        text(item?.scope) ? `Scope: ${text(item?.scope)}` : '',
        text(item?.threshold) ? `Threshold: ${text(item?.threshold)}` : '',
        text(item?.validation) ? `Validation: ${text(item?.validation)}` : '',
      ].filter(Boolean);
      return {
        title: nonempty(item?.title, 'Completion criterion'),
        detail: detailParts.join(' '),
        defaultOpen: Boolean(item?.default_expanded),
      };
    })
    .filter((item) => item.title || item.detail);

  const details = [
    text(fullDetails.technical_details),
    ...(fullDetails.dependencies || []).map(text),
    text(fullDetails.acceptance_criteria),
    text(fullDetails.fail_conditions),
  ].filter(Boolean);

  return {
    title: nonempty(header.title, 'Untitled execution ticket'),
    issueType: nonempty(header.issue_type, 'Task'),
    priority: nonempty(header.priority, 'Medium'),
    readinessStatus: nonempty(header.status, decisionStrip.execution_status, 'UNKNOWN'),
    decision_summary: {
      can_we_proceed: canProceed,
      blocked_until: blockedUntil,
      do_now: doNow,
      next_decision: nextDecision,
    },
    flow_container_class: decisionStrip.flow_container_class || 'border rounded-xl p-4 bg-white shadow-sm',
    flow,
    decisions: flow,
    immediateActions: {
      title: 'Immediate Actions',
      items: (immediate.must_happen_now || []).map(text).filter(Boolean),
      tone: 'blue',
    },
    parallelActions: {
      title: 'Safe to Start in Parallel',
      items: (immediate.safe_to_start_in_parallel || []).map(text).filter(Boolean),
      tone: 'blue',
    },
    needsAttention,
    blockers: blockers.length ? blockers : blockedUntil === NO_BLOCKER_TITLE ? [noBlockerItem()] : [],
    executionPlan,
    definitionOfDone,
    stopCondition: normalizeStopCondition(view.stop_conditions),
    fullDetails: details,
  };
}
