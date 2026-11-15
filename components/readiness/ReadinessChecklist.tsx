import React from 'react';
import type { RubricFactState, RubricFactSummary } from '@/lib/apiTypes';
import { FactStateControl } from './ReadinessControls';

// Display groups only. Every fact, including an unknown future key, is retained.
const SECTIONS = [
  { title: 'Work Context', description: 'Identify the system, environment, and scope of the change.', keys: ['target', 'environment', 'change_scope', 'change_type'] },
  { title: 'Execution Planning', description: 'Clarify dependencies, timing, and how the change will ship.', keys: ['deployment_path', 'dependencies', 'planning_period'] },
  { title: 'Validation & Recovery', description: 'Define how to verify the outcome and recover if needed.', keys: ['validation', 'rollback'] },
  { title: 'Additional Context', description: 'Include designs, client details, and other available checks.', keys: ['figma_link', 'client_tag'] },
];

export function ReadinessChecklist({
  facts, values, onChange, disabled = false, headingLevel = 3, layout = 'stacked',
}: {
  facts: RubricFactSummary[];
  values: Record<string, RubricFactState>;
  onChange: (key: string, value: RubricFactState) => void;
  disabled?: boolean;
  headingLevel?: 2 | 3;
  layout?: 'stacked' | 'workspace';
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const knownKeys = new Set(SECTIONS.flatMap((section) => section.keys));
  const sections = [
    ...SECTIONS.map((section) => ({
      ...section,
      facts: facts.filter((fact) => section.keys.includes(fact.key) || (section.title === 'Additional Context' && !knownKeys.has(fact.key))),
    })),
  ];
  return (
    <div className={layout === 'workspace' ? 'grid items-start gap-5 xl:grid-cols-2' : 'space-y-5'}>
      {sections.filter((section) => section.facts.length > 0).map((section) => (
        <section key={section.title} aria-label={section.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-5 sm:px-5">
            <div>
              <Heading className="text-base font-semibold tracking-tight text-slate-950">{section.title}</Heading>
              <p className="mt-1 max-w-prose text-xs leading-5 text-slate-600">{section.description}</p>
            </div>
            <span aria-label={`${section.facts.length} ${section.facts.length === 1 ? 'check' : 'checks'}`} className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-600">{section.facts.length}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {section.facts.map((fact) => (
              <div key={fact.key} className="flex flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-900">{fact.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{fact.question}</span>
                </span>
                <FactStateControl label={fact.label} disabled={disabled} value={values[fact.key] ?? fact.severity} onChange={(value) => onChange(fact.key, value)} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
