import React from 'react';
import type { RubricFactState, RubricFactSummary } from '@/lib/apiTypes';
import { FactStateControl } from './ReadinessControls';

// Display groups only. Every fact, including an unknown future key, is retained.
const SECTIONS = [
  { title: 'Change context', description: 'What is changing and where it applies.', keys: ['target', 'environment', 'change_scope', 'change_type', 'figma_link'] },
  { title: 'Delivery & recovery', description: 'How the change ships, is verified, and can be reversed.', keys: ['deployment_path', 'dependencies', 'validation', 'rollback'] },
  { title: 'Planning & impact', description: 'When the work is planned and who it affects.', keys: ['planning_period', 'client_tag'] },
];

export function ReadinessChecklist({
  facts, values, onChange, disabled = false, headingLevel = 3,
}: {
  facts: RubricFactSummary[];
  values: Record<string, RubricFactState>;
  onChange: (key: string, value: RubricFactState) => void;
  disabled?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const knownKeys = new Set(SECTIONS.flatMap((section) => section.keys));
  const sections = [
    ...SECTIONS.map((section) => ({ ...section, facts: facts.filter((fact) => section.keys.includes(fact.key)) })),
    { title: 'Additional checks', description: 'More checks available for your account.', facts: facts.filter((fact) => !knownKeys.has(fact.key)) },
  ];
  return (
    <div className="space-y-6">
      {sections.filter((section) => section.facts.length > 0).map((section) => (
        <section key={section.title} aria-label={section.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
            <Heading className="text-sm font-semibold text-slate-950">{section.title}</Heading>
            <p className="mt-1 text-xs leading-5 text-slate-600">{section.description}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {section.facts.map((fact) => (
              <div key={fact.key} className="flex flex-col items-start justify-between gap-3 px-4 py-5 sm:flex-row sm:gap-5 sm:px-5">
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
