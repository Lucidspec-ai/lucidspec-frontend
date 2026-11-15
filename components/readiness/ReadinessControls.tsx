import React from 'react';
import type { RubricFactState, RubricFactSummary } from '@/lib/apiTypes';

const STATE_OPTIONS: { value: RubricFactState; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'blocking', label: 'Blocking' },
];

export function FactStateControl({
  value,
  onChange,
  label,
  disabled = false,
  allowOff = true,
  groupLabel,
}: {
  value: RubricFactState;
  onChange: (next: RubricFactState) => void;
  label: string;
  disabled?: boolean;
  allowOff?: boolean;
  groupLabel?: string;
}) {
  return (
    <div role="group" aria-label={groupLabel || `${label} severity`} className="inline-flex w-full shrink-0 gap-0.5 rounded-lg bg-slate-100 p-1 sm:w-auto">
      {STATE_OPTIONS.filter((option) => allowOff || option.value !== 'off').map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={active}
            className={`inline-flex min-h-11 flex-1 scroll-mb-32 scroll-mt-28 items-center justify-center gap-1 rounded-md px-2.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60 sm:flex-none ${
              active ? 'bg-white font-semibold text-slate-950 shadow-sm ring-1 ring-inset ring-slate-300' : 'font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900'
            }`}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-3 w-3 shrink-0 ${active ? '' : 'invisible'}`}><path d="m3 8 3 3 7-7" /></svg>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ReadinessSummary({ facts, values }: { facts: RubricFactSummary[]; values: Record<string, RubricFactState> }) {
  const counts: Record<RubricFactState, number> = { blocking: 0, advisory: 0, off: 0 };
  facts.forEach((fact) => { counts[values[fact.key] ?? fact.severity] += 1; });
  return (
    <section aria-label="Selected standard check severities" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Current selections</h2>
        <p className="text-xs text-slate-500">{facts.length} standard checks · Custom Rules are managed separately</p>
      </div>
      <dl aria-live="polite" aria-atomic="true" className="grid grid-cols-3 divide-x divide-slate-100">
        {([
          { value: 'blocking', label: 'Blocking', description: 'Missing details prevent readiness.', dot: 'bg-rose-500' },
          { value: 'advisory', label: 'Advisory', description: 'Flag missing details for review.', dot: 'bg-amber-500' },
          { value: 'off', label: 'Off', description: 'Exclude this check from evaluation.', dot: 'bg-slate-400' },
        ] as const).map((item) => (
          <div key={item.value} className="px-3 py-4 sm:px-5">
            <dt className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />{item.label}</dt>
            <dd className="mt-2">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950">{counts[item.value]}</span>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SeverityGuide() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-semibold text-slate-900">How severity works</h2>
      <dl className="mt-3 grid gap-3 text-xs leading-5 sm:grid-cols-3 sm:gap-4">
        <div>
          <dt className="font-bold text-slate-700">Off</dt>
          <dd className="text-slate-600">Exclude this check.</dd>
        </div>
        <div>
          <dt className="font-bold text-amber-800">Advisory</dt>
          <dd className="text-slate-600">Flag missing details for review.</dd>
        </div>
        <div>
          <dt className="font-bold text-red-800">Blocking</dt>
          <dd className="text-slate-600">Require details for readiness.</dd>
        </div>
      </dl>
    </div>
  );
}
