// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HowItWorksSection } from './HowItWorksSection';

describe('homepage How It Works section', () => {
  it('preserves the homepage anchor and explains three ordered stages with a section heading', () => {
    render(<HowItWorksSection />);
    const section = screen.getByRole('region', { name: 'How LucidSpec works' });
    expect(section).toHaveAttribute('id', 'how-it-works');
    expect(section).toHaveAttribute('tabindex', '-1');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent('From a rough request to a clearer handoff.');
    expect(within(section).queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    const stages = within(section).getByRole('list', { name: 'Workflow stages' });
    expect(within(stages).getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual(['Describe the work', 'Review readiness findings', 'Clarify and prepare']);
  });

  it('labels the example and keeps unresolved findings visible after showing a clarification question', () => {
    render(<HowItWorksSection />);
    const example = screen.getByRole('figure', { name: 'Illustrative workflow example, not a live assessment' });
    expect(within(example).getByText('Illustrative example')).toBeInTheDocument();
    expect(within(example).getByText('Deploy the billing service update to production. Testing is complete.')).toBeInTheDocument();
    for (const text of ['Needs clarification', 'Target system identified', 'Validation approach needs detail', 'Rollback procedure unresolved', 'What steps will the team follow if the deployment fails?', 'Work-item preview']) {
      expect(within(example).getByText(text)).toBeInTheDocument();
    }
    expect(screen.queryByText(/Ready for execution|Prepared for handoff|Guaranteed readiness/i)).not.toBeInTheDocument();
    expect(screen.getByText('Illustrative workflow. Findings and readiness depend on configured checks and supplied information.')).toBeInTheDocument();
  });

  it('describes four supported capabilities with account-scoped settings and human review', () => {
    render(<HowItWorksSection />);
    const highlights = screen.getByRole('list', { name: 'Workflow highlights' });
    expect(within(highlights).getAllByRole('listitem')).toHaveLength(4);
    for (const name of ['Customer-configured standards', 'Explainable findings', 'Human review', 'Tracker handoff']) {
      expect(within(highlights).getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(within(highlights).getByText(/in your account/)).toBeInTheDocument();
    expect(within(highlights).getByText('Keep people involved in clarification and decisions.')).toBeInTheDocument();
    expect(within(highlights).getByText('Prepare structured work for configured engineering tools.')).toBeInTheDocument();
    expect(screen.queryByText(/organization-wide|automatically approved|universally blocked/i)).not.toBeInTheDocument();
  });

  it('uses the existing contact destination without adding another header or pretend assessment controls', () => {
    render(<HowItWorksSection />);
    expect(screen.getByRole('heading', { name: 'See LucidSpec in action.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a Demo' })).toHaveAttribute('href', '/contact');
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
