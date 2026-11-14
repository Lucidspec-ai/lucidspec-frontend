import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdvancedDetailsAccordion, getAdvancedDetailsProps } from './AdvancedDetailsAccordion';

describe('AdvancedDetailsAccordion', () => {
  it('renders a slim collapsed advanced details footer bar with inline section labels', () => {
    const html = renderToStaticMarkup(
      <AdvancedDetailsAccordion
        executionControlPanel={{
          nextDecision: 'Confirm the final dependency owner.',
          blockedUntil: 'This should be filtered out.',
          flow: ['This should also be filtered out.'],
        }}
        detailedAcceptanceCriteria={[
          { title: 'Delivery validation', validation: 'Attach delivery evidence.' },
          'Retention is confirmed.',
        ]}
        dependencyDetails={{
          upstream: 'Security approval',
          relatedTeams: ['Platform', 'Security'],
        }}
        riskAssessment={{
          primaryRisk: 'Logging could be incomplete without the final destination approval.',
        }}
        confidenceBreakdown={{
          scope: 'Medium because region scope is still pending.',
          validation: { label: 'High', because: 'Evidence requirements are explicit.' },
        }}
        aiReasoningNotes={[
          'Derived only from missing operational confirmations.',
        ]}
      />
    );

    expect(html).toContain('Advanced Details');
    expect(html).toContain('Collapsed by default');
    expect(html).toContain('Expand');
    expect(html).toContain('Expand for detailed reasoning, dependencies, confidence notes, and implementation context.');
    expect(html).toContain('<details>');
    expect(html).toContain('Execution Control Panel');
    expect(html).toContain('Detailed Acceptance Criteria');
    expect(html).toContain('Dependency Details');
    expect(html).toContain('Risk Assessment');
    expect(html).toContain('Confidence Notes');
    expect(html).toContain('AI Reasoning Notes');
    expect(html).toContain('Next Decision');
    expect(html).not.toContain('This should be filtered out.');
    expect(html).not.toContain('This should also be filtered out.');
    expect(html).toContain('Scope: Medium because region scope is still pending.');
    expect(html).toContain('bg-slate-50');
  });

  it('returns normalized advanced details props only when meaningful content exists', () => {
    const props = getAdvancedDetailsProps({
      advancedDetails: {
        executionControlPanel: { nextDecision: 'Confirm the final dependency owner.', blockedUntil: 'duplicate' },
        detailedAcceptanceCriteria: [{ title: 'Validate logging output.' }],
        dependencyDetails: { security: 'Approval required' },
        riskAssessment: { primaryRisk: 'Missing final destination approval.' },
        confidenceBreakdown: { scope: 'Medium because one dependency is unresolved.' },
        aiReasoningNotes: ['Built from the normalized backend reviewer fields.'],
      },
    } as any);

    expect(props).toEqual({
      executionControlPanel: { nextDecision: 'Confirm the final dependency owner.' },
      detailedAcceptanceCriteria: [{ title: 'Validate logging output.' }],
      dependencyDetails: { security: 'Approval required' },
      riskAssessment: { primaryRisk: 'Missing final destination approval.' },
      confidenceBreakdown: { scope: 'Medium because one dependency is unresolved.' },
      aiReasoningNotes: ['Built from the normalized backend reviewer fields.'],
    });

    expect(
      getAdvancedDetailsProps({
        advancedDetails: {
          executionControlPanel: { blockedUntil: 'duplicate' },
          detailedAcceptanceCriteria: [],
          dependencyDetails: {},
          riskAssessment: {},
          confidenceBreakdown: {},
          aiReasoningNotes: [],
        },
      } as any)
    ).toBeNull();
  });
});
