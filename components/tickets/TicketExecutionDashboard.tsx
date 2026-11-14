'use client';

import React, { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';

import type {
  ActionGroup,
  Blocker,
  CompletionCriterion,
  DecisionMetric,
  NeedsAttention,
  StopCondition,
  TicketExecutionDashboardData,
} from '@/lib/ticketDashboardTypes';
import { getReadinessBadgeTone } from '@/lib/ticketReadiness';

type DashboardAction = {
  label: string;
  onClick?: () => void | Promise<void>;
};

type TicketExecutionDashboardProps = {
  data: TicketExecutionDashboardData;
  actions?: {
    copy?: DashboardAction;
    export?: DashboardAction;
    share?: DashboardAction;
  };
  fullDetailsHtml?: string;
  createdAt?: string | null;
};

const badgeToneClasses = {
  neutral: 'border-l-2 border-slate-300 bg-slate-50 text-slate-700',
  red: 'border-l-2 border-rose-300 bg-rose-50/70 text-rose-700',
  green: 'border-l-2 border-emerald-300 bg-emerald-50/70 text-emerald-700',
  amber: 'border-l-2 border-amber-300 bg-amber-50/70 text-amber-800',
  blue: 'border-l-2 border-sky-300 bg-sky-50/70 text-sky-800',
  critical: 'border-l-2 border-rose-300 bg-rose-50/70 text-rose-700',
};

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: keyof typeof badgeToneClasses;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center px-3 py-1 text-[11px] font-extrabold uppercase leading-none tracking-[0.08em] ${badgeToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function UtilityButton({ action }: { action: DashboardAction }) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      className="inline-flex h-8 items-center justify-center bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {action.label}
    </button>
  );
}

export function HeaderBar({
  title,
  readinessStatus,
  actions,
}: {
  title: string;
  readinessStatus: string;
  actions?: TicketExecutionDashboardProps['actions'];
}) {
  return (
    <header className="flex min-h-20 flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 pl-0 md:pl-16">
        <h1 className="break-words text-sm font-extrabold leading-tight text-slate-800">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <StatusBadge tone={getReadinessBadgeTone(readinessStatus)}>{readinessStatus}</StatusBadge>
        <div className="inline-flex h-8 divide-x divide-slate-300 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <UtilityButton action={actions?.copy ?? { label: 'Copy' }} />
          <UtilityButton action={actions?.export ?? { label: 'Export' }} />
          <UtilityButton action={actions?.share ?? { label: 'Share' }} />
        </div>
      </div>
    </header>
  );
}

function findDecision(decisions: DecisionMetric[], label: string) {
  return decisions.find((metric) => metric.label.toLowerCase() === label.toLowerCase());
}

function DecisionLine({
  label,
  value,
  valueClassName = 'text-slate-900',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </div>
      <div className={`break-words text-sm font-semibold leading-5 ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}

function decisionValueClass(tone?: DecisionMetric['tone'], value?: string) {
  const normalized = String(value || '').trim().toUpperCase();
  const limitedProceedStates = new Set(['PARTIAL', 'DISCOVERY ONLY', 'PHASE 0 ONLY', 'LIMITED SCOPE ONLY']);
  if (tone === 'positive' || normalized === 'YES' || normalized.startsWith('YES, FOR ')) return 'text-green-700';
  if (tone === 'negative' || normalized === 'NO') return 'text-red-700';
  if (tone === 'warning' || limitedProceedStates.has(normalized)) return 'text-amber-700';
  return 'text-slate-900';
}

function buildDecisionFlow(data: TicketExecutionDashboardData): DecisionMetric[] {
  const hasIdentifiedBlockers = data.blockers.some(
    (blocker) => blocker.title !== 'No blockers identified' && blocker.description !== 'No blockers identified'
  );
  const blockedUntilValue = (value: string | undefined): string => {
    const cleaned = value?.trim() || '';
    if (hasIdentifiedBlockers) return cleaned || 'Not captured';
    return /^(|no blocker\.?|no blockers\.?|none|n\/a|not applicable|not captured)$/i.test(cleaned)
      ? 'No blockers identified'
      : cleaned;
  };

  if (data.flow?.length) {
    return data.flow.map((item) =>
      /^blocked until:?$/i.test(item.label.trim())
        ? { ...item, value: blockedUntilValue(item.value) }
        : item
    );
  }

  const decisions = data.decisions;
  const proceed = findDecision(decisions, 'Can we proceed') ?? findDecision(decisions, 'Can we proceed?');
  const doNow = findDecision(decisions, 'Do now');
  const nextDecision = findDecision(decisions, 'Next decision');
  const canProceed = data.decision_summary?.can_we_proceed ?? proceed?.value ?? '';
  const blockedUntil = data.decision_summary?.blocked_until ?? '';
  const doNowValue = data.decision_summary?.do_now ?? doNow?.value ?? '';
  const nextDecisionValue = data.decision_summary?.next_decision ?? nextDecision?.value ?? '';
  const isLimitedProceed =
    canProceed.startsWith('YES, FOR ') ||
    canProceed === 'PARTIAL' ||
    canProceed === 'DISCOVERY ONLY' ||
    canProceed === 'PHASE 0 ONLY' ||
    canProceed === 'LIMITED SCOPE ONLY';

  return [
    { label: 'Can we proceed', value: canProceed || 'NO', tone: canProceed === 'YES' || canProceed.startsWith('YES, FOR ') ? 'positive' : isLimitedProceed ? 'warning' : 'negative' },
    { label: 'Blocked until', value: blockedUntilValue(blockedUntil), tone: 'neutral' },
    { label: 'Do now', value: doNowValue || 'Confirm the next execution owner.', tone: 'neutral' },
    { label: 'Next decision', value: nextDecisionValue || 'Approve execution start.', tone: 'neutral' },
  ];
}

export function DecisionStrip({
  data,
  compact = false,
}: {
  data: TicketExecutionDashboardData;
  compact?: boolean;
}) {
  const flow = buildDecisionFlow(data);

  return (
    <section
      aria-labelledby="decision-strip-title"
      className={compact ? '' : 'px-4 pt-4 sm:px-6 lg:px-8'}
    >
      <h2 id="decision-strip-title" className="sr-only">
        Decision Summary
      </h2>
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="grid divide-y divide-slate-200 md:grid-cols-4 md:divide-x md:divide-y-0">
          {flow.map((item) => (
            <div key={item.label} className="px-4 py-3 sm:px-5">
              <DecisionLine
                label={item.label}
                value={item.value}
                valueClassName={decisionValueClass(item.tone, item.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function emphasizeFirstWords(text: string, count: number) {
  if (count <= 0) return text;

  const words = text.split(' ');
  if (words.length <= count) {
    return <strong className="font-extrabold">{text}</strong>;
  }

  return (
    <>
      <strong className="font-extrabold">{words.slice(0, count).join(' ')}</strong>{' '}
      {words.slice(count).join(' ')}
    </>
  );
}

export function ActionCard({ group, ordered = false }: { group: ActionGroup; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';

  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
        <h3 className="text-base font-extrabold tracking-tight text-slate-950">{group.title}</h3>
      </div>
      <List className="space-y-2 px-4 py-3.5 sm:px-5">
        {group.items.map((item, index) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            {ordered ? (
              <span className="min-w-5 font-extrabold text-slate-800">{index + 1}.</span>
            ) : (
              <span aria-hidden className="mt-[0.18rem] font-extrabold text-sky-700">
                ✓
              </span>
            )}
            <span>
              {ordered ? emphasizeFirstWords(item, index === 0 ? 3 : 1) : item}
            </span>
          </li>
        ))}
      </List>
    </article>
  );
}

export function BlockerCard({ blocker }: { blocker: Blocker }) {
  return (
    <article className="rounded border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-300 bg-slate-100 px-4 py-4">
        <h3 className="text-sm font-extrabold text-slate-800">{blocker.title}</h3>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <p className="min-h-[52px] leading-6 text-slate-800">{blocker.description}</p>
        <p className="border-t border-slate-300 pt-3 text-sm font-semibold text-slate-800">
          Needed by: <span className="font-bold">{blocker.neededBy}</span>
        </p>
      </div>
    </article>
  );
}

function AttentionGroup({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Blocker[];
  emptyText: string;
}) {
  return (
    <section className="rounded border border-slate-300 bg-slate-50 shadow-sm">
      <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
        <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
      </div>
      {items.length ? (
        <div className="grid gap-3 p-3">
          {items.map((item) => (
            <BlockerCard key={`${title}-${item.title}-${item.neededBy}`} blocker={item} />
          ))}
        </div>
      ) : (
        <p className="px-4 py-4 text-sm leading-6 text-slate-600">{emptyText}</p>
      )}
    </section>
  );
}

function NeedsAttentionSection({ needsAttention }: { needsAttention: NeedsAttention }) {
  return (
    <Section title="Needs Attention">
      <div className="grid gap-3 lg:grid-cols-3">
        <AttentionGroup
          title="Blocking now"
          items={needsAttention.blockingNow}
          emptyText="No blocking items returned."
        />
        <AttentionGroup
          title="Needed soon"
          items={needsAttention.neededSoon}
          emptyText="No near-term planning items returned."
        />
        <AttentionGroup
          title="Later"
          items={needsAttention.later}
          emptyText="No downstream handoff items returned."
        />
      </div>
    </Section>
  );
}

export function ExecutionPlan({ steps }: { steps: string[] }) {
  return (
    <div className="rounded border border-slate-300 bg-slate-50 shadow-sm">
      <ol className="divide-y divide-slate-300">
        {steps.map((step, index) => (
          <li key={step} className="flex min-h-11 items-center gap-3 px-5 text-sm text-slate-800">
            <span className="shrink-0 text-sm font-black text-slate-800">{index + 1}.</span>
            <span className="font-semibold">{emphasizeFirstWords(step, index === 0 ? 1 : 0)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AccordionRow({
  row,
  defaultOpen = false,
}: {
  row: CompletionCriterion;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-300 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-start justify-between gap-4 px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <span className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
            ✓
          </span>
          <span className="min-w-0 flex-1 whitespace-normal break-words leading-6">{row.title}</span>
        </span>
        <span className="shrink-0 text-2xl leading-6 text-slate-700">⌄</span>
      </button>
      {open && row.detail ? <p className="px-12 pb-4 text-sm leading-6 text-slate-600">{row.detail}</p> : null}
    </div>
  );
}

export function StopConditionCard({ condition }: { condition: StopCondition }) {
  return (
    <article className="rounded border border-slate-300 bg-slate-50 px-4 py-3 shadow-sm">
      <div className="grid text-sm text-slate-800">
        <p className="flex min-h-8 items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            i
          </span>
          <span>If {condition.if},</span>
        </p>
        <p className="flex min-h-10 items-center gap-5 border-t border-slate-300 pl-8">
          <span className="font-extrabold text-slate-800">Then</span>
          <span className="font-semibold">{condition.then}</span>
        </p>
        <p className="flex min-h-10 items-center gap-5 border-t border-slate-300 pl-8">
          <span className="font-extrabold text-slate-800">When</span>
          <span>{condition.when}</span>
        </p>
      </div>
    </article>
  );
}

function hasMeaningfulStopCondition(condition: StopCondition) {
  return [condition.if, condition.then, condition.when].some(
    (value) => value && value.trim().toLowerCase() !== 'not available'
  );
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-slate-300 bg-slate-100">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-full items-center gap-2 px-7 text-left text-sm font-semibold text-slate-800 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <span
          aria-hidden
          className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-400 text-[10px] leading-none text-white"
        >
          {open ? '▾' : '▸'}
        </span>
        {title}
      </button>
      {open ? <div className="px-6 pb-6">{children}</div> : null}
    </section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}>
      <h2
        id={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
        className="mb-3 border-b border-slate-300 pb-2 text-sm font-extrabold leading-7 text-slate-800"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function TicketExecutionDashboard({
  data,
  actions,
  fullDetailsHtml,
  createdAt,
}: TicketExecutionDashboardProps) {
  const sanitizedDetails = useMemo(
    () => (fullDetailsHtml ? DOMPurify.sanitize(fullDetailsHtml) : ''),
    [fullDetailsHtml]
  );
  const needsAttention = data.needsAttention || {
    blockingNow: data.blockers.filter((blocker) => blocker.title !== 'No blockers identified'),
    neededSoon: [],
    later: [],
  };
  const topActionGroups = [
    data.immediateActions.items.length ? { group: data.immediateActions, ordered: true } : null,
    data.parallelActions.items.length ? { group: data.parallelActions, ordered: false } : null,
  ].filter(Boolean) as Array<{ group: typeof data.immediateActions; ordered: boolean }>;
  const hasNeedsAttention =
    needsAttention.blockingNow.length > 0
    || needsAttention.neededSoon.length > 0
    || needsAttention.later.length > 0;
  const hasStopCondition = hasMeaningfulStopCondition(data.stopCondition);
  const hasFullDetails = Boolean(sanitizedDetails) || data.fullDetails.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderBar
        title={data.title}
        readinessStatus={data.readinessStatus}
        actions={actions}
      />

      <DecisionStrip data={data} />

      {createdAt ? (
        <p className="px-6 pt-2 text-sm text-slate-500">
          Generated {new Date(createdAt).toLocaleString()}
        </p>
      ) : null}

      <main className="space-y-5 px-6 py-5">
        {topActionGroups.length ? (
          <section className="grid gap-5 border-t border-slate-300 pt-4 lg:grid-cols-2">
            {topActionGroups.map(({ group, ordered }) => (
              <ActionCard key={group.title} group={group} ordered={ordered} />
            ))}
          </section>
        ) : null}

        {hasNeedsAttention ? <NeedsAttentionSection needsAttention={needsAttention} /> : null}

        {data.executionPlan.length ? (
          <Section title="Execution Plan">
            <ExecutionPlan steps={data.executionPlan} />
          </Section>
        ) : null}

        {data.definitionOfDone.length ? (
          <Section title="Definition of Done">
            <div className="rounded border border-slate-300 bg-slate-50 shadow-sm">
              {data.definitionOfDone.map((row) => (
                <AccordionRow
                  key={row.title}
                  row={row}
                  defaultOpen={Boolean(row.defaultOpen)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {hasStopCondition ? (
          <Section title="Stop Conditions">
            <StopConditionCard condition={data.stopCondition} />
          </Section>
        ) : null}
      </main>

      {hasFullDetails ? (
        <CollapsibleSection title="Full Details">
          {sanitizedDetails ? (
            <div
              className="prose max-w-none rounded border border-slate-300 bg-white p-4 text-sm shadow-sm"
              dangerouslySetInnerHTML={{ __html: sanitizedDetails }}
            />
          ) : (
            <ul className="rounded border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-sm">
              {data.fullDetails.map((item) => (
                <li key={item} className="mb-2 last:mb-0">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CollapsibleSection>
      ) : null}
    </div>
  );
}
