import React, { useState } from 'react';

import { checkAnswerQuality } from './answerQualityGuard';
import type { ReadinessCheckResponse, ReadinessFact } from '@/lib/apiTypes';

export type ReadinessAnswers = {
  // Picked values for facts with a fixed choice list -- merged in as
  // confirmed_fields, never re-grounded (see confirmed_fields in
  // lucidspec_readiness_core.py).
  confirmedFields: Record<string, string>;
  // Free-text answers for facts without a choice list, pre-formatted as
  // lines to append to the task input -- these go through the normal
  // grounded extraction again, same as if the user had written them
  // themselves, so "no answer is trusted unless it's really in the text"
  // stays true for these too.
  appendText: string;
};

export type ReadinessCheckPanelProps = {
  result: ReadinessCheckResponse;
  onApplyAnswers?: (answers: ReadinessAnswers) => void;
  applyingAnswers?: boolean;
  // "Mark ready anyway": requires a written reason, which the parent is
  // responsible for actually logging (POST /generate/override) before
  // treating the request as ready -- this component only collects the
  // reason and shows the pending/error state, it never assumes success.
  onOverride?: (reason: string) => void;
  overriding?: boolean;
  overrideError?: string | null;
};

function ChoiceGapRow({
  fact,
  value,
  onChange,
}: {
  fact: ReadinessFact;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <li className="px-1 py-3">
      <p className="text-sm leading-6 text-slate-700">
        <span className="font-semibold text-slate-950">{fact.label}</span>
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{fact.question}</p>
      <select
        value={value}
        onChange={(e) => onChange(fact.key, e.target.value)}
        className="mt-2 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
      >
        <option value="">Choose…</option>
        {(fact.choices || []).map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </li>
  );
}

function TextAnswerGapRow({
  fact,
  value,
  onChange,
  editable,
}: {
  fact: ReadinessFact;
  value: string;
  onChange: (key: string, value: string) => void;
  editable: boolean;
}) {
  const quality = checkAnswerQuality(value);
  return (
    <li className="px-1 py-3">
      <p className="text-sm leading-6 text-slate-700">
        <span className="font-semibold text-slate-950">{fact.label}</span>
        {!editable ? (
          <>
            <span className="px-1.5 text-slate-400" aria-hidden="true">
              &mdash;
            </span>
            <span className="text-slate-500">missing</span>
          </>
        ) : null}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{fact.question}</p>
      <p className="mt-0.5 text-sm italic text-slate-500">{fact.consequence}</p>
      {editable ? (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(fact.key, e.target.value)}
            placeholder="Type an answer to add to your request…"
            className="mt-2 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          />
          {value.trim() && quality.ok === false ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{quality.reason}</p>
          ) : null}
        </>
      ) : null}
    </li>
  );
}

export function ReadinessCheckPanel({
  result,
  onApplyAnswers,
  applyingAnswers,
  onOverride,
  overriding,
  overrideError,
}: ReadinessCheckPanelProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [advisoryExpanded, setAdvisoryExpanded] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const gaps = result.facts.filter((fact) => !fact.present);
  const present = result.facts.filter((fact) => fact.present);
  // Only a missing BLOCKING fact keeps the request from being ready --
  // advisory gaps are shown but never require an override. Mirrors
  // app/slack_readiness_check.py's REQUIRED_FACTS severity split.
  const blockingGaps = gaps.filter((fact) => fact.severity === 'blocking');
  const advisoryGaps = gaps.filter((fact) => fact.severity === 'advisory');
  const hasSelections = Object.values(selections).some((v) => v);
  const hasTextAnswers = Object.values(textAnswers).some((v) => v.trim());
  const hasInvalidTextAnswer = Object.values(textAnswers).some(
    (v) => v.trim() && !checkAnswerQuality(v).ok
  );
  const editable = Boolean(onApplyAnswers);

  const handleChoiceChange = (key: string, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (key: string, value: string) => {
    setTextAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const renderGapList = (list: ReadinessFact[]) => (
    <ul className="mt-2 divide-y divide-slate-100 border-t border-slate-100">
      {list.map((fact) =>
        fact.choices && fact.choices.length ? (
          <ChoiceGapRow key={fact.key} fact={fact} value={selections[fact.key] || ''} onChange={handleChoiceChange} />
        ) : (
          <TextAnswerGapRow
            key={fact.key}
            fact={fact}
            value={textAnswers[fact.key] || ''}
            onChange={handleTextChange}
            editable={editable}
          />
        )
      )}
    </ul>
  );

  return (
    <section aria-labelledby="readiness-check-title" className="border-t border-slate-200 pt-6">
      <div>
        <h2 id="readiness-check-title" className="text-base font-extrabold tracking-tight text-slate-950">
          Readiness check
        </h2>
        {result.summary ? <p className="mt-0.5 text-sm text-slate-600">{result.summary}</p> : null}
      </div>

      {result.pii_masked ? (
        <p className="mt-3 text-xs text-slate-500">
          Some sensitive details (emails, tokens, etc.) were masked before this was analyzed.
        </p>
      ) : null}

      <div className="mt-4">
        {!gaps.length ? (
          <p className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            Looks ready — no named gaps found.
          </p>
        ) : !blockingGaps.length ? (
          <p className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            Looks ready — {advisoryGaps.length} advisory {advisoryGaps.length === 1 ? 'item' : 'items'} worth
            reviewing.
          </p>
        ) : (
          <p className="border-l-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            {blockingGaps.length} blocking {blockingGaps.length === 1 ? 'gap' : 'gaps'} before this is ready.
            Revise the prompt above and check again, or answer below.
          </p>
        )}
      </div>

      {blockingGaps.length ? (
        <div className="mt-4 rounded-lg border-l-4 border-amber-300 bg-amber-50/40 py-2.5 pl-3 pr-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-amber-900">
            Blocking — request isn&apos;t ready
          </h3>
          {renderGapList(blockingGaps)}

          {onOverride ? (
            <div className="mt-1 border-t border-amber-200/60 pt-3">
              {!overrideOpen ? (
                <button
                  type="button"
                  onClick={() => setOverrideOpen(true)}
                  className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
                >
                  Mark ready anyway
                </button>
              ) : (
                <div>
                  <label htmlFor="override-reason" className="block text-xs font-bold text-amber-900">
                    Why is this ready despite the gap{blockingGaps.length === 1 ? '' : 's'} above?
                  </label>
                  <textarea
                    id="override-reason"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. Rollback follows the standard incident runbook, not worth restating here."
                    className="mt-1.5 w-full max-w-md rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOverride(overrideReason.trim())}
                      disabled={overriding || !overrideReason.trim()}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-amber-800 px-3.5 text-xs font-bold text-white hover:bg-amber-900 disabled:opacity-60"
                    >
                      {overriding ? 'Saving…' : 'Confirm override'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideOpen(false);
                        setOverrideReason('');
                      }}
                      disabled={overriding}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                  {overrideError ? (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">{overrideError}</p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {advisoryGaps.length ? (
        <div className="mt-4">
          {blockingGaps.length ? (
            <button
              type="button"
              onClick={() => setAdvisoryExpanded((prev) => !prev)}
              aria-expanded={advisoryExpanded}
              className="flex w-full items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 hover:text-slate-700"
            >
              <span aria-hidden="true" className="text-[10px] normal-case tracking-normal">
                {advisoryExpanded ? '▾' : '▸'}
              </span>
              <span>Worth noting — doesn&apos;t block</span>
              <span className="font-medium normal-case tracking-normal text-slate-400">
                ({advisoryGaps.length})
              </span>
              <span className="ml-auto text-[11px] font-semibold normal-case tracking-normal text-blue-600">
                {advisoryExpanded ? 'Hide' : 'Show'}
              </span>
            </button>
          ) : (
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              Worth noting — doesn&apos;t block
            </h3>
          )}
          {!blockingGaps.length || advisoryExpanded ? renderGapList(advisoryGaps) : null}
        </div>
      ) : null}

      {onApplyAnswers && (hasSelections || hasTextAnswers) ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              const confirmedFields = Object.fromEntries(Object.entries(selections).filter(([, v]) => v));
              const appendText = Object.entries(textAnswers)
                .filter(([, v]) => v.trim())
                .map(([key, v]) => {
                  const fact = result.facts.find((f) => f.key === key);
                  return `${fact?.label || key}: ${v.trim()}.`;
                })
                .join('\n');
              onApplyAnswers({ confirmedFields, appendText });
            }}
            disabled={applyingAnswers || hasInvalidTextAnswer}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {applyingAnswers ? 'Adding…' : 'Add answers & re-check'}
          </button>
          {hasInvalidTextAnswer ? (
            <p className="mt-1.5 text-xs text-slate-500">Fix or clear the flagged answer above to continue.</p>
          ) : null}
        </div>
      ) : null}

      {present.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Already present</h3>
          <ul className="mt-2 divide-y divide-slate-100 border-t border-slate-100">
            {present.map((fact) => (
              <li key={fact.key} className="px-1 py-3">
                <p className="text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-950">{fact.label}</span>
                  <span className="px-1.5 text-slate-400" aria-hidden="true">
                    &mdash;
                  </span>
                  <span>{fact.value}</span>
                  {fact.uncertain ? (
                    <span className="ml-1.5 text-amber-700">uncertain — double-check this one</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.risks.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Risks</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {result.risks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.assumptions.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Unconfirmed assumptions</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {result.assumptions.map((assumption, index) => (
              <li key={index}>{assumption}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
