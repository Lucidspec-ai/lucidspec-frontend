import React from 'react';

import type { TicketResponse } from '@/lib/apiTypes';

export type AdvancedDetailsAccordionProps = {
  executionControlPanel?: object;
  detailedAcceptanceCriteria?: any[];
  dependencyDetails?: object;
  riskAssessment?: object;
  confidenceBreakdown?: object;
  aiReasoningNotes?: string[];
};

const DUPLICATE_EXECUTION_KEYS = new Set([
  'draftstatus',
  'executionstatus',
  'canproceednow',
  'criticalblocker',
  'immediatenextaction',
  'confidencesummary',
  'canproceed',
  'canproceedlabel',
  'blockeduntil',
  'donow',
  'executionstatuslabel',
  'executionstatusreason',
  'executionstatus',
  'confidence',
  'flowcontainerclass',
  'flow',
]);

const EMPTY_TEXT = new Set(['', 'none', 'null', 'undefined', 'not available', 'not captured']);

const cleanText = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

const normalizeKey = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const humanizeKey = (value: string): string => {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : 'Detail';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const splitLines = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter((item) => item && !EMPTY_TEXT.has(item.toLowerCase()));
  }

  const rawText = typeof value === 'string' ? value.replace(/<[^>]+>/g, ' ') : '';
  if (!rawText.trim()) return [];

  return rawText
    .split(/\n|[•‣◦⁃∙]/g)
    .map((part) => cleanText(part.replace(/^[-*\d.)\s]+/, '')))
    .filter((item) => item && !EMPTY_TEXT.has(item.toLowerCase()));
};

const isMeaningfulValue = (value: unknown): boolean => {
  if (typeof value === 'string') return !EMPTY_TEXT.has(cleanText(value).toLowerCase());
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.some((item) => isMeaningfulValue(item));
  if (isPlainObject(value)) return Object.values(value).some((item) => isMeaningfulValue(item));
  return false;
};

const cleanStringList = (items: unknown): string[] =>
  Array.isArray(items) ? items.map((item) => cleanText(item)).filter((item) => !EMPTY_TEXT.has(item.toLowerCase())) : [];

const summarizeScalar = (value: unknown): string => {
  if (typeof value === 'string') return cleanText(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return '';
};

const summarizeValue = (value: unknown): string => {
  const scalar = summarizeScalar(value);
  if (scalar) return scalar;
  if (Array.isArray(value)) {
    const items = value
      .map((item) => summarizeScalar(item) || (isPlainObject(item) ? summarizeObjectInline(item) : ''))
      .filter(Boolean);
    if (!items.length) return '';
    return items.slice(0, 3).join('; ');
  }
  if (isPlainObject(value)) return summarizeObjectInline(value);
  return '';
};

const summarizeObjectInline = (value: Record<string, unknown>): string => {
  const parts = Object.entries(value)
    .filter(([, entry]) => isMeaningfulValue(entry))
    .slice(0, 3)
    .map(([key, entry]) => `${humanizeKey(key)}: ${summarizeValue(entry)}`)
    .filter((part) => !part.endsWith(': '));
  return parts.join('; ');
};

const filterExecutionControlPanel = (value: unknown): Record<string, unknown> => {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => !DUPLICATE_EXECUTION_KEYS.has(normalizeKey(key)) && isMeaningfulValue(entry))
  );
};

const confidenceLines = (value: unknown): string[] => {
  if (!isPlainObject(value)) return cleanStringList(value);
  return Object.entries(value)
    .filter(([, entry]) => isMeaningfulValue(entry))
    .map(([key, entry]) => {
      const summary = summarizeValue(entry);
      return summary ? `${humanizeKey(key)}: ${summary}` : '';
    })
    .filter(Boolean);
};

const renderTextList = (items: string[]) => (
  <ul className="space-y-2 pl-5 text-sm leading-6 text-slate-700 list-disc marker:text-slate-400">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const renderObjectRows = (value: Record<string, unknown>) => {
  const entries = Object.entries(value).filter(([, entry]) => isMeaningfulValue(entry));
  if (!entries.length) return null;

  return (
    <dl className="space-y-3">
      {entries.map(([key, entry]) => (
        <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{humanizeKey(key)}</dt>
          <dd className="mt-2 text-sm leading-6 text-slate-700">{renderValue(entry)}</dd>
        </div>
      ))}
    </dl>
  );
};

const renderArrayItems = (items: unknown[]) => {
  const meaningfulItems = items.filter((item) => isMeaningfulValue(item));
  if (!meaningfulItems.length) return null;

  const scalarItems = meaningfulItems.map((item) => summarizeScalar(item)).filter(Boolean);
  if (scalarItems.length === meaningfulItems.length) return renderTextList(scalarItems);

  return (
    <div className="space-y-3">
      {meaningfulItems.map((item, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Item {index + 1}</p>
          <div className="mt-2 text-sm leading-6 text-slate-700">{renderValue(item)}</div>
        </div>
      ))}
    </div>
  );
};

function renderValue(value: unknown): React.ReactNode {
  const scalar = summarizeScalar(value);
  if (scalar) return <p>{scalar}</p>;
  if (Array.isArray(value)) return renderArrayItems(value);
  if (isPlainObject(value)) return renderObjectRows(value);
  return null;
}

const SectionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-[20px] border border-slate-200 bg-white p-3.5">
    <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
    <div className="mt-2.5">{children}</div>
  </section>
);

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="m6.75 8.25 3.25 3.5 3.25-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const buildLegacyAdvancedDetails = (ticket: TicketResponse): AdvancedDetailsAccordionProps => ({
  executionControlPanel: filterExecutionControlPanel({
    requiredActions: ticket.governance?.required_actions ?? [],
    cannotProceedUntil: ticket.governance?.cannot_proceed_until ?? [],
    openDecisionCount: ticket.governance?.open_decision_count ?? null,
    ownershipGapCount: ticket.governance?.ownership_gap_count ?? null,
  }),
  detailedAcceptanceCriteria: splitLines(ticket.acceptance_criteria),
  dependencyDetails: {
    declaredDependencies: splitLines(ticket.dependencies),
    implementationSequence: splitLines(ticket.implementation_sequence),
    requiredEngineers: splitLines(ticket.required_engineers),
  },
  riskAssessment: {
    currentRisks: splitLines(ticket.risks),
    failConditions: splitLines(ticket.fail_conditions),
    missingInformation: splitLines(ticket.missing_info_triage),
  },
  confidenceBreakdown: {
    summary: cleanText(ticket.section_confidence),
    factors: ticket.governance?.confidence_factors ?? [],
  },
  aiReasoningNotes: [
    ...splitLines(ticket.technical_notes),
    ...splitLines(ticket.assumptions),
    ...splitLines(ticket.explain_to_pm),
  ],
});

export function getAdvancedDetailsProps(ticket: TicketResponse | null | undefined): AdvancedDetailsAccordionProps | null {
  if (!ticket) return null;

  const details = ticket.advancedDetails ?? buildLegacyAdvancedDetails(ticket);

  const normalized = {
    executionControlPanel: filterExecutionControlPanel(details.executionControlPanel),
    detailedAcceptanceCriteria: Array.isArray(details.detailedAcceptanceCriteria)
      ? details.detailedAcceptanceCriteria.filter((item) => isMeaningfulValue(item))
      : [],
    dependencyDetails: isPlainObject(details.dependencyDetails) ? details.dependencyDetails : {},
    riskAssessment: isPlainObject(details.riskAssessment) ? details.riskAssessment : {},
    confidenceBreakdown: isPlainObject(details.confidenceBreakdown) ? details.confidenceBreakdown : {},
    aiReasoningNotes: cleanStringList(details.aiReasoningNotes),
  } satisfies AdvancedDetailsAccordionProps;

  if (!Object.values(normalized).some((value) => isMeaningfulValue(value))) return null;
  return normalized;
}

export function AdvancedDetailsAccordion({
  executionControlPanel,
  detailedAcceptanceCriteria,
  dependencyDetails,
  riskAssessment,
  confidenceBreakdown,
  aiReasoningNotes,
}: AdvancedDetailsAccordionProps) {
  const executionPanel = filterExecutionControlPanel(executionControlPanel);
  const acceptanceItems = Array.isArray(detailedAcceptanceCriteria)
    ? detailedAcceptanceCriteria.filter((item) => isMeaningfulValue(item))
    : [];
  const dependencyInfo = isPlainObject(dependencyDetails) ? dependencyDetails : {};
  const riskInfo = isPlainObject(riskAssessment) ? riskAssessment : {};
  const confidenceItems = confidenceLines(confidenceBreakdown);
  const reasoningNotes = cleanStringList(aiReasoningNotes);

  const sections = [
    executionPanel && Object.keys(executionPanel).length
      ? { title: 'Execution Control Panel', content: renderObjectRows(executionPanel) }
      : null,
    acceptanceItems.length
      ? { title: 'Detailed Acceptance Criteria', content: renderArrayItems(acceptanceItems) }
      : null,
    Object.keys(dependencyInfo).length
      ? { title: 'Dependency Details', content: renderObjectRows(dependencyInfo) }
      : null,
    Object.keys(riskInfo).length
      ? { title: 'Risk Assessment', content: renderObjectRows(riskInfo) }
      : null,
    confidenceItems.length
      ? { title: 'Confidence Notes', content: renderTextList(confidenceItems) }
      : null,
    reasoningNotes.length
      ? { title: 'AI Reasoning Notes', content: renderTextList(reasoningNotes) }
      : null,
  ].filter(Boolean) as Array<{ title: string; content: React.ReactNode }>;

  if (!sections.length) return null;

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <details>
        <summary className="cursor-pointer list-none bg-slate-50/70 px-4 py-3 sm:px-5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-extrabold tracking-tight text-slate-950">Advanced Details</h2>
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Collapsed by default
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Expand for detailed reasoning, dependencies, confidence notes, and implementation context.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {sections.map((section) => (
                  <span
                    key={section.title}
                    className="text-xs font-semibold text-slate-500"
                  >
                    {section.title}
                  </span>
                ))}
              </div>
            </div>
            <span className="inline-flex items-center gap-2 self-start text-sm font-semibold text-slate-500 lg:self-center">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                <ChevronIcon />
              </span>
              Expand
            </span>
          </div>
        </summary>

        <div className="border-t border-slate-200 px-4 py-4 sm:px-5">
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionBlock key={section.title} title={section.title}>
                {section.content}
              </SectionBlock>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
