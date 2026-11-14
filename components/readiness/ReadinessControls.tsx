import React from 'react';
import type { RubricFactState } from '@/lib/apiTypes';

const STATE_OPTIONS: { value: RubricFactState; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'blocking', label: 'Blocking' },
];

const STATE_BUTTON_STYLES: Record<RubricFactState, string> = {
  off: 'bg-slate-800 text-white',
  advisory: 'bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-300',
  blocking: 'bg-red-100 text-red-900 ring-1 ring-inset ring-red-300',
};

export function FactStateControl({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: RubricFactState;
  onChange: (next: RubricFactState) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label={`${label} severity`} className="inline-flex w-full shrink-0 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:w-auto">
      {STATE_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={active}
            className={`min-h-11 flex-1 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60 sm:flex-none ${
              active ? STATE_BUTTON_STYLES[option.value] : 'text-slate-600 hover:bg-white hover:text-slate-950'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
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
