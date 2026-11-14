import Link from 'next/link';
import React from 'react';

import type {
  TicketAcCheckResponse,
  TicketDetailResponse,
  TicketDispatchResult,
  TicketingConnection,
} from '@/lib/apiTypes';

export type LeanTicketCardProps = {
  ticket: TicketDetailResponse;
  // Presence of this callback is what makes the card editable -- without
  // it, fields render as plain read-only text exactly as before.
  onTicketChange?: (ticket: TicketDetailResponse) => void;
  onSendToTracker?: () => void;
  dispatching?: boolean;
  dispatchResult?: TicketDispatchResult | null;
  onCheckAcceptanceCriteria?: () => void;
  checkingAcceptanceCriteria?: boolean;
  acCheckResult?: TicketAcCheckResponse | null;
  // undefined while the connection status hasn't loaded yet -- deliberately
  // not shown as "not connected" until we actually know, so the hint below
  // doesn't flash on every page load.
  connectionStatus?: TicketingConnection | null;
};

const CONNECTION_PROVIDER_LABELS: Record<string, string> = {
  jira: 'Jira',
  servicenow: 'ServiceNow',
  linear: 'Linear',
};

type LeanTextFieldKey =
  | 'description'
  | 'acceptance_criteria'
  | 'technical_summary'
  | 'dependencies'
  | 'assumptions'
  | 'expected_outcome';

const FIELDS: Array<{ key: LeanTextFieldKey; label: string }> = [
  { key: 'description', label: 'Description' },
  { key: 'acceptance_criteria', label: 'Acceptance criteria' },
  { key: 'technical_summary', label: 'Technical summary' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'assumptions', label: 'Assumptions' },
  { key: 'expected_outcome', label: 'Expected outcome' },
];

// Same option sets as app/slack_readiness_check.py's REQUIRED_FACTS choices
// for environment/planning_period/change_type -- kept in sync manually
// since this is a small, fixed pilot-scoped list, not fetched from the API.
const ENVIRONMENT_CHOICES = ['Production', 'Acceptance', 'Integration', 'Development'];
const PLANNING_PERIOD_CHOICES = ['Current sprint', 'Q1', 'Q2', 'Q3', 'Q4'];
const CHANGE_TYPE_CHOICES = ['UI change', 'Database change', 'Middle-tier change'];

function StructuredSelectField({
  label,
  value,
  choices,
  editable,
  onChange,
}: {
  label: string;
  value?: string;
  choices: string[];
  editable: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
      {editable ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
        >
          <option value="">Not specified</option>
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      ) : (
        <dd className="mt-1 text-sm text-slate-700">{value || 'Not specified'}</dd>
      )}
    </div>
  );
}

function DispatchResultMessage({ result }: { result: TicketDispatchResult }) {
  if (result.status === 'created' && result.external_url) {
    const providerLabel = result.provider
      ? result.provider.charAt(0).toUpperCase() + result.provider.slice(1)
      : 'the tracker';
    return (
      <p className="mt-3 border-l-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
        Sent to {providerLabel} —{' '}
        <a href={result.external_url} target="_blank" rel="noreferrer" className="underline">
          {result.external_key || 'view ticket'}
        </a>
      </p>
    );
  }
  if (result.status === 'skipped') {
    return (
      <p className="mt-3 border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
        Ticketing isn&apos;t configured yet for this workspace.
      </p>
    );
  }
  return (
    <p className="mt-3 border-l-2 border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      Couldn&apos;t send this to the tracker — try again.
    </p>
  );
}

export function LeanTicketCard({
  ticket,
  onTicketChange,
  onSendToTracker,
  dispatching,
  dispatchResult,
  onCheckAcceptanceCriteria,
  checkingAcceptanceCriteria,
  acCheckResult,
  connectionStatus,
}: LeanTicketCardProps) {
  const editable = Boolean(onTicketChange);

  const updateField = (key: keyof TicketDetailResponse, value: string) => {
    onTicketChange?.({ ...ticket, [key]: value });
  };

  const insertAcceptanceCriterion = (line: string) => {
    const current = ticket.acceptance_criteria || '';
    updateField('acceptance_criteria', current.trim() ? `${current.trim()}\n${line}` : line);
  };

  const standardsGaps = (acCheckResult?.standards_gaps || []).filter((fact) => !fact.present);
  const hasAcResult = Boolean(acCheckResult);
  const hasAcFindings = Boolean(
    acCheckResult?.coverage_gaps.length || acCheckResult?.consistency_flags.length || standardsGaps.length
  );

  return (
    <section aria-labelledby="lean-ticket-title" className="border-t border-slate-200 pt-6">
      <div>
        <h2 id="lean-ticket-title" className="text-lg font-extrabold tracking-tight text-slate-950">
          {ticket.title}
        </h2>
        <p className="mt-0.5 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
          {ticket.ticket_type}
        </p>
      </div>

      <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="py-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
            {editable ? (
              <textarea
                value={(ticket[key] as string) || ''}
                onChange={(e) => updateField(key, e.target.value)}
                rows={key === 'description' || key === 'acceptance_criteria' ? 4 : 2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-700"
              />
            ) : (
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket[key]}</dd>
            )}
          </div>
        ))}
      </dl>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <StructuredSelectField
          label="Environment"
          value={ticket.environment}
          choices={ENVIRONMENT_CHOICES}
          editable={editable}
          onChange={(v) => updateField('environment', v)}
        />
        <StructuredSelectField
          label="Planning period"
          value={ticket.planning_period}
          choices={PLANNING_PERIOD_CHOICES}
          editable={editable}
          onChange={(v) => updateField('planning_period', v)}
        />
        <StructuredSelectField
          label="Change type"
          value={ticket.change_type}
          choices={CHANGE_TYPE_CHOICES}
          editable={editable}
          onChange={(v) => updateField('change_type', v)}
        />
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Client / industry</dt>
          {editable ? (
            <input
              type="text"
              value={ticket.client_tag || ''}
              onChange={(e) => updateField('client_tag', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
            />
          ) : (
            <dd className="mt-1 text-sm text-slate-700">{ticket.client_tag || 'Not specified'}</dd>
          )}
        </div>
      </dl>

      {onCheckAcceptanceCriteria ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCheckAcceptanceCriteria}
            disabled={checkingAcceptanceCriteria}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
          >
            {checkingAcceptanceCriteria ? 'Checking…' : 'Check acceptance criteria'}
          </button>

          {hasAcResult && !hasAcFindings ? (
            <p className="mt-3 border-l-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              No coverage gaps or contradictions found.
            </p>
          ) : null}

          {acCheckResult?.coverage_gaps.length ? (
            <div className="mt-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Possibly missing scenarios
              </h3>
              <ul className="mt-2 space-y-2">
                {acCheckResult.coverage_gaps.map((gap) => (
                  <li key={gap.category} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-sm font-semibold text-amber-800">{gap.label}</p>
                    <p className="mt-0.5 text-sm text-amber-800">{gap.suggested_criterion}</p>
                    {editable ? (
                      <button
                        type="button"
                        onClick={() => insertAcceptanceCriterion(gap.suggested_criterion)}
                        className="mt-1.5 text-sm font-semibold text-blue-700 underline"
                      >
                        Insert into acceptance criteria
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {acCheckResult?.consistency_flags.length ? (
            <div className="mt-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Possible contradictions
              </h3>
              <ul className="mt-2 space-y-2">
                {acCheckResult.consistency_flags.map((flag, index) => (
                  <li key={index} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {flag.issue}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {standardsGaps.length ? (
            <div className="mt-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Ticket standards not yet met
              </h3>
              <ul className="mt-2 space-y-2">
                {standardsGaps.map((fact) => (
                  <li
                    key={fact.key}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      fact.severity === 'blocking'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <p className="font-semibold">{fact.label}</p>
                    <p className="mt-0.5">{fact.consequence}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {onSendToTracker ? (
        <div className="mt-4">
          {connectionStatus && !connectionStatus.configured ? (
            <p className="mb-2 text-xs text-slate-500">
              Not connected to a tracker yet —{' '}
              <Link href="/account/integrations" className="font-semibold text-blue-700 underline">
                Connect
              </Link>
            </p>
          ) : null}
          <button
            type="button"
            onClick={onSendToTracker}
            disabled={dispatching}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
          >
            {dispatching
              ? 'Sending…'
              : connectionStatus?.configured && connectionStatus.provider
                ? `Send to ${CONNECTION_PROVIDER_LABELS[connectionStatus.provider] || connectionStatus.provider}`
                : 'Send to tracker'}
          </button>
          {dispatchResult ? <DispatchResultMessage result={dispatchResult} /> : null}
        </div>
      ) : null}
    </section>
  );
}
