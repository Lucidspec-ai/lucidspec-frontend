// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReadinessCheckPanel } from './ReadinessCheckPanel';
import type { ReadinessCheckResponse, ReadinessFact } from '@/lib/apiTypes';

const gappedResult: ReadinessCheckResponse = {
  mode: 'ai',
  summary: 'Fix the retry bug in billing-api.',
  ready: false,
  facts: [
    {
      key: 'rollback',
      label: 'Rollback',
      question: 'How do you undo it if it breaks?',
      consequence:
        'No rollback plan — if this breaks, recovery gets improvised under pressure instead of following a plan.',
      severity: 'blocking',
      present: false,
      value: null,
      quote: null,
      uncertain: false,
    },
    {
      key: 'target',
      label: 'Target',
      question: 'Which service or app does this touch?',
      consequence: 'No named target — this is how someone changes the wrong service by mistake.',
      severity: 'blocking',
      present: true,
      value: 'billing-api',
      quote: 'billing-api',
      uncertain: false,
    },
  ],
  risks: ['No load test planned'],
  assumptions: ['Schema migration already landed'],
  ai_authored: false,
  pii_masked: false,
};

const readyResult: ReadinessCheckResponse = {
  ...gappedResult,
  ready: true,
  facts: [gappedResult.facts[1]],
  risks: [],
  assumptions: [],
};

const advisoryGap: ReadinessFact = {
  key: 'client_tag',
  label: 'Client / industry tag',
  question: 'Which client or industry does this apply to?',
  consequence: 'No client tag — this is how requests get miscategorized in reporting.',
  severity: 'advisory',
  present: false,
  value: null,
  quote: null,
  uncertain: false,
};

const mixedSeverityResult: ReadinessCheckResponse = {
  ...gappedResult,
  facts: [...gappedResult.facts, advisoryGap],
};

const advisoryOnlyResult: ReadinessCheckResponse = {
  ...gappedResult,
  ready: true,
  facts: [gappedResult.facts[1], advisoryGap],
};

describe('ReadinessCheckPanel', () => {
  it('shows named gaps, present facts, risks, and assumptions when not ready', () => {
    const html = renderToStaticMarkup(<ReadinessCheckPanel result={gappedResult} />);

    expect(html).toContain('1 blocking gap before this is ready');
    expect(html).toContain('Rollback');
    expect(html).toContain('How do you undo it if it breaks?');
    expect(html).toContain('No rollback plan — if this breaks');
    expect(html).toContain('billing-api');
    expect(html).toContain('No load test planned');
    expect(html).toContain('Schema migration already landed');
    expect(html).not.toContain('Looks ready');
  });

  it('shows a ready state and no gap list when ready', () => {
    const html = renderToStaticMarkup(<ReadinessCheckPanel result={readyResult} />);

    expect(html).toContain('Looks ready — no named gaps found.');
    expect(html).not.toContain('before this is ready');
    expect(html).toContain('Already present');
  });

  it('renders a choice dropdown instead of plain text for a gap with choices', () => {
    const environmentGap: ReadinessFact = {
      key: 'environment',
      label: 'Environment',
      question: 'Where does this run — prod, staging, dev?',
      consequence: 'No environment named — this is how staging changes end up in prod.',
      severity: 'blocking',
      present: false,
      value: null,
      quote: null,
      uncertain: false,
      choices: ['Production', 'Acceptance', 'Integration', 'Development'],
    };
    const resultWithChoiceGap: ReadinessCheckResponse = {
      ...gappedResult,
      facts: [environmentGap, gappedResult.facts[1]],
    };
    const html = renderToStaticMarkup(<ReadinessCheckPanel result={resultWithChoiceGap} />);

    expect(html).toContain('<select');
    expect(html).toContain('Production');
    expect(html).toContain('Acceptance');
    expect(html).not.toContain('missing</span>');
  });

  it('does not render an add-answers button without the callback prop', () => {
    const html = renderToStaticMarkup(<ReadinessCheckPanel result={gappedResult} />);
    expect(html).not.toContain('Add answers');
  });

  it('does not render a text input for a non-choice gap without the callback prop', () => {
    const html = renderToStaticMarkup(<ReadinessCheckPanel result={gappedResult} />);
    expect(html).not.toContain('<input');
    expect(html).toContain('missing</span>');
  });

  it('renders a text input instead of plain "missing" text for a non-choice gap when editable', () => {
    const html = renderToStaticMarkup(<ReadinessCheckPanel result={gappedResult} onApplyAnswers={() => {}} />);
    expect(html).toContain('<input');
    expect(html).toContain('Type an answer to add to your request');
    expect(html).not.toContain('missing</span>');
  });

  it('disables Add answers and shows an inline message when a typed answer is obvious junk', async () => {
    const onApplyAnswers = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={gappedResult} onApplyAnswers={onApplyAnswers} />);

    await user.type(screen.getByPlaceholderText('Type an answer to add to your request…'), 'cake');

    expect(screen.getByText('This looks like placeholder text, not a real answer.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add answers/i })).toBeDisabled();
    expect(screen.getByText('Fix or clear the flagged answer above to continue.')).toBeInTheDocument();
  });

  it('re-enables Add answers once a junk answer is corrected', async () => {
    const onApplyAnswers = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={gappedResult} onApplyAnswers={onApplyAnswers} />);

    const input = screen.getByPlaceholderText('Type an answer to add to your request…');
    await user.type(input, 'cake');
    expect(screen.getByRole('button', { name: /Add answers/i })).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'Redeploy the previous image via the existing pipeline.');

    expect(screen.queryByText('This looks like placeholder text, not a real answer.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add answers/i })).toBeEnabled();
  });

  it('collapses advisory gaps behind a toggle while a blocking gap remains', () => {
    render(<ReadinessCheckPanel result={mixedSeverityResult} />);

    expect(screen.getByText("Blocking — request isn't ready")).toBeInTheDocument();
    expect(screen.queryByText('Client / industry tag')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Worth noting.*doesn.t block.*\(1\).*Show/ })
    ).toBeInTheDocument();
  });

  it('expands advisory gaps when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={mixedSeverityResult} />);

    await user.click(screen.getByRole('button', { name: /Worth noting.*doesn.t block.*\(1\).*Show/ }));

    expect(screen.getByText('Client / industry tag')).toBeInTheDocument();
  });

  it('shows advisory gaps expanded by default once there are no blocking gaps', () => {
    render(<ReadinessCheckPanel result={advisoryOnlyResult} />);

    expect(screen.getByText("Worth noting — doesn't block")).toBeInTheDocument();
    expect(screen.getByText('Client / industry tag')).toBeInTheDocument();
  });

  it('calls onApplyAnswers with the typed answer once submitted', async () => {
    const onApplyAnswers = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={gappedResult} onApplyAnswers={onApplyAnswers} />);

    await user.type(
      screen.getByPlaceholderText('Type an answer to add to your request…'),
      'Redeploy the previous image via the existing pipeline.'
    );
    await user.click(screen.getByRole('button', { name: /Add answers/i }));

    expect(onApplyAnswers).toHaveBeenCalledWith({
      confirmedFields: {},
      appendText: 'Rollback: Redeploy the previous image via the existing pipeline..',
    });
  });
});
