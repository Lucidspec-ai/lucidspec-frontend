import React from 'react';
import type { RubricFactState, RubricFactSummary } from '@/lib/apiTypes';
import { ReadinessIcon } from './ReadinessIcon';

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
  appearance = 'default',
}: {
  value: RubricFactState;
  onChange: (next: RubricFactState) => void;
  label: string;
  disabled?: boolean;
  allowOff?: boolean;
  groupLabel?: string;
  appearance?: 'default' | 'dashboard';
}) {
  return (
    <div role="group" aria-label={groupLabel || `${label} severity`} className={`inline-flex w-full shrink-0 sm:w-auto ${appearance === 'dashboard' ? 'rounded-xl border border-slate-200 bg-slate-50 p-0.5' : 'gap-0.5 rounded-lg bg-slate-100 p-1'}`}>
      {STATE_OPTIONS.filter((option) => allowOff || option.value !== 'off').map((option) => {
        const active = value === option.value;
        const selectedStyle = appearance === 'dashboard' && value === 'blocking'
          ? 'bg-rose-600 font-semibold text-white shadow-sm'
          : appearance === 'dashboard' && value === 'advisory'
          ? 'bg-amber-100 font-semibold text-amber-950 shadow-sm ring-1 ring-inset ring-amber-300'
          : 'bg-white font-semibold text-slate-950 shadow-sm ring-1 ring-inset ring-slate-300';
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={active}
            className={`inline-flex min-h-11 flex-1 scroll-mt-28 items-center justify-center gap-1 px-2.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60 sm:flex-none ${appearance === 'dashboard' ? 'scroll-mb-44 rounded-lg sm:min-w-[76px]' : 'scroll-mb-32 rounded-md'} ${
              active ? selectedStyle : 'font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900'
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
    <section aria-label="Selected standard check severities">
      <h2 className="sr-only">Current selections</h2>
      <dl aria-live="polite" aria-atomic="true" className="grid grid-cols-3 gap-2 sm:gap-5">
        {([
          { value: 'blocking', label: 'Blocking', description: 'Missing details prevent readiness.', color: 'bg-rose-50 text-rose-600' },
          { value: 'advisory', label: 'Advisory', description: 'Flag missing details for review.', color: 'bg-amber-50 text-amber-600' },
          { value: 'off', label: 'Off', description: 'Exclude this check from evaluation.', color: 'bg-slate-100 text-slate-500' },
        ] as const).map((item) => (
          <div key={item.value} className="relative rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:px-6 sm:pl-20">
            <div aria-hidden="true" className={`absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full sm:flex ${item.color}`}><ReadinessIcon name={item.value === 'off' ? 'minus' : 'check'} className="h-5 w-5" /></div>
            <dt className="absolute bottom-3 text-xs text-slate-600 sm:text-sm">{item.label}<span className="hidden sm:inline"> checks</span></dt>
            <dd className="pb-6">
              <span className="text-3xl font-semibold tabular-nums tracking-tight text-slate-950">{counts[item.value]}</span>
              <p className="sr-only">{item.description}</p>
            </dd>
          </div>
        ))}
      </dl>
      <p className="sr-only">{facts.length} standard checks · Custom Rules are managed separately</p>
    </section>
  );
}

export function SeverityGuide({ dashboard = false }: { dashboard?: boolean }) {
  if (dashboard) return (
    <section aria-label="How severity works" className="flex gap-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:px-6 sm:py-4">
      <span className="hidden pt-1 text-blue-600 lg:block"><ReadinessIcon name="info" className="h-6 w-6" /></span>
      <dl className="grid flex-1 gap-4 text-sm leading-5 sm:grid-cols-3 sm:gap-6 sm:divide-x sm:divide-blue-200/70">
        {([
          ['Blocking', 'Required details. Missing information prevents readiness.', 'bg-rose-500'],
          ['Advisory', 'Recommended details. Missing information is flagged for review.', 'bg-amber-400'],
          ['Off', 'Not checked for readiness.', 'bg-slate-400'],
        ] as const).map(([label, description, color], index) => <div key={label} className={`flex items-start gap-3 ${index ? 'sm:pl-6' : ''}`}>
          <span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 rounded-full ${color}`} />
          <div><dt className="font-semibold text-slate-950">{label}</dt><dd className="mt-1 text-xs leading-5 text-slate-600">{description}</dd></div>
        </div>)}
      </dl>
    </section>
  );
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
