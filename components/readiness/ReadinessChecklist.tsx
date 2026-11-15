import React from 'react';
import type { RubricFactState, RubricFactSummary } from '@/lib/apiTypes';
import { FactStateControl } from './ReadinessControls';
import { ReadinessIcon, type ReadinessIconName } from './ReadinessIcon';

// Display groups only. Every fact, including an unknown future key, is retained.
export const READINESS_SECTIONS: { id: string; title: string; description: string; keys: string[]; icon: ReadinessIconName }[] = [
  { id: 'work-context', title: 'Work Context', description: 'Identify the work and where it applies.', keys: ['target', 'environment', 'change_scope', 'change_type'], icon: 'layers' },
  { id: 'execution-planning', title: 'Execution Planning', description: 'Clarify dependencies, timing, and how the change will ship.', keys: ['deployment_path', 'dependencies', 'planning_period'], icon: 'calendar' },
  { id: 'validation-recovery', title: 'Validation & Recovery', description: 'Define how to verify the outcome and recover if needed.', keys: ['validation', 'rollback'], icon: 'shield' },
  { id: 'additional-context', title: 'Additional Context', description: 'Include designs, client details, and other available checks.', keys: ['figma_link', 'client_tag'], icon: 'context' },
];

export function ReadinessChecklist({
  facts, values, onChange, disabled = false, headingLevel = 3, layout = 'stacked', activeSection,
}: {
  facts: RubricFactSummary[];
  values: Record<string, RubricFactState>;
  onChange: (key: string, value: RubricFactState) => void;
  disabled?: boolean;
  headingLevel?: 2 | 3;
  layout?: 'stacked' | 'workspace';
  activeSection?: string;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const knownKeys = new Set(READINESS_SECTIONS.flatMap((section) => section.keys));
  const sections = [
    ...READINESS_SECTIONS.map((section) => ({
      ...section,
      facts: facts.filter((fact) => section.keys.includes(fact.key) || (section.title === 'Additional Context' && !knownKeys.has(fact.key))),
    })),
  ];
  return (
    <div className={layout === 'workspace' && !activeSection ? 'grid items-start gap-5 xl:grid-cols-2' : 'space-y-5'}>
      {sections.filter((section) => activeSection ? section.id === activeSection : section.facts.length > 0).map((section) => (
        <section key={section.title} aria-label={section.title} className={`overflow-hidden border bg-white ${activeSection ? 'rounded-2xl border-blue-100 shadow-[0_2px_6px_rgba(30,64,175,0.04)]' : 'rounded-xl border-slate-200'}`}>
          <div className={`flex items-start justify-between gap-3 border-b border-slate-100 py-5 ${activeSection ? 'px-5 sm:px-6 sm:py-4' : 'px-4 sm:px-5'}`}>
            <div className="flex items-center gap-4">
              {activeSection ? <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><ReadinessIcon name={section.icon} className="h-6 w-6" /></span> : null}
              <div>
                <Heading className={`${activeSection ? 'text-xl' : 'text-base'} font-semibold tracking-tight text-slate-950`}>{section.title}</Heading>
                <p className={`mt-1 max-w-prose leading-5 text-slate-600 ${activeSection ? 'text-sm' : 'text-xs'}`}>{section.description}</p>
              </div>
            </div>
            {!activeSection ? <span aria-label={`${section.facts.length} ${section.facts.length === 1 ? 'check' : 'checks'}`} className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-600">{section.facts.length}</span> : null}
          </div>
          <div className={`divide-y divide-slate-100 ${activeSection ? 'px-5 sm:px-6' : ''}`}>
            {section.facts.map((fact) => (
              <div key={fact.key} className={`flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-5 ${activeSection ? 'py-3' : 'px-4 py-4 sm:px-5'}`}>
                <span className="min-w-0 flex-1">
                  <span className={`${activeSection ? 'block text-base leading-5' : 'text-sm'} font-semibold text-slate-900`}>{fact.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{fact.question}</span>
                </span>
                <FactStateControl appearance={activeSection ? 'dashboard' : 'default'} label={fact.label} disabled={disabled} value={values[fact.key] ?? fact.severity} onChange={(value) => onChange(fact.key, value)} />
              </div>
            ))}
          </div>
          {section.facts.length === 0 ? <p className="px-6 py-8 text-sm text-slate-500">No checks in this category are available for your account.</p> : null}
        </section>
      ))}
    </div>
  );
}
