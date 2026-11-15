// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReadinessCheckPanel } from './ReadinessCheckPanel';
import type { ReadinessCheckResponse, ReadinessFact } from '@/lib/apiTypes';

const fact = (changes: Partial<ReadinessFact>): ReadinessFact => ({ key: 'rollback', label: 'Rollback', question: 'How will you recover?', consequence: 'Recovery needs a plan.', severity: 'blocking', present: false, value: null, quote: null, uncertain: false, ...changes });
const rollback = fact({});
const target = fact({ key: 'target', label: 'Target system', present: true, value: 'billing-api', quote: 'billing-api' });
const advisory = fact({ key: 'validation', label: 'Validation approach', severity: 'advisory', question: 'How will success be verified?' });
const environment = fact({ key: 'environment', label: 'Environment', question: 'Where will this run?', choices: ['Production', 'Staging'] });
const uncertain = fact({ key: 'scope', label: 'Change scope', present: true, value: 'Deploy the API', uncertain: true });
const failed = fact({ key: 'custom:control', label: 'Change control evidence', source: 'custom_rule', evaluated: false, present: true });
const result = (changes: Partial<ReadinessCheckResponse> = {}): ReadinessCheckResponse => ({ mode: 'ai', summary: 'Review this service change.', ready: false, facts: [advisory, rollback, target, uncertain], risks: ['No load test planned'], assumptions: ['Schema migration already landed'], ai_authored: false, pii_masked: false, ...changes });
const count = (label: string) => screen.getByText(label, { selector: 'dt' }).parentElement!.querySelector('dd')!.textContent;

describe('ReadinessCheckPanel', () => {
  it('derives counts from returned facts, prioritizes blocking questions, and separates uncertain extractions from satisfied checks', () => {
    render(<ReadinessCheckPanel result={result()} onApplyAnswers={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Needs clarification' })).toBeInTheDocument();
    expect(screen.getByText('Assessment: Not ready')).toBeInTheDocument();
    expect(count('Blocking findings')).toBe('1');
    expect(count('Advisory findings')).toBe('1');
    expect(count('Satisfied checks')).toBe('1');
    expect(count('Uncertain facts')).toBe('1');
    expect(screen.getAllByRole('textbox').map(input => input.getAttribute('id'))).toEqual(expect.arrayContaining([expect.stringContaining('rollback'), expect.stringContaining('validation')]));
    expect(screen.getAllByRole('textbox')[0]).toHaveAccessibleName('Rollback');
    expect(within(screen.getByRole('region', { name: 'Extracted information' })).getByText('Uncertain')).toBeInTheDocument();
    expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
    expect(screen.getByText('No load test planned')).toBeInTheDocument();
    expect(screen.getByText('Schema migration already landed')).toBeInTheDocument();
  });

  it('recommends review for advisory-only results instead of treating zero blockers as execution approval', () => {
    render(<ReadinessCheckPanel result={result({ ready: true, facts: [target, advisory] })} />);
    expect(screen.getByRole('heading', { name: 'Review recommended' })).toBeInTheDocument();
    expect(count('Blocking findings')).toBe('0');
    expect(screen.getByText('Assessment: Ready')).toBeInTheDocument();
    expect(screen.getByText(/It is not execution approval/)).toBeInTheDocument();
    expect(screen.queryByText(/Looks ready|Ready for execution/)).not.toBeInTheDocument();
  });

  it('presents a response-derived ready outcome only when the response is ready', () => {
    render(<ReadinessCheckPanel result={result({ ready: true, facts: [target], risks: [], assumptions: [] })} />);
    expect(screen.getByRole('heading', { name: 'No gaps reported' })).toBeInTheDocument();
    expect(count('Satisfied checks')).toBe('1');
    expect(screen.getByText(/No blocking or advisory findings were returned/)).toBeInTheDocument();
  });

  it('does not infer readiness from an empty response or from zero blocking gaps', () => {
    const { rerender } = render(<ReadinessCheckPanel result={result({ ready: false, facts: [] })} />);
    expect(screen.getByRole('heading', { name: 'Needs clarification' })).toBeInTheDocument();
    expect(screen.getByText(/did not mark this request ready/)).toBeInTheDocument();
    rerender(<ReadinessCheckPanel result={result({ ready: true, facts: [] })} />);
    expect(screen.getByRole('heading', { name: 'Check details unavailable' })).toBeInTheDocument();
    expect(screen.getByText(/Readiness cannot be explained/)).toBeInTheDocument();
  });

  it('distinguishes failed evaluations from missing, satisfied, and uncertain checks', async () => {
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={result({ ready: false, facts: [failed, rollback, target] })} onApplyAnswers={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Evaluation incomplete' })).toBeInTheDocument();
    expect(count('Blocking findings')).toBe('1');
    expect(count('Satisfied checks')).toBe('1');
    expect(screen.getByRole('region', { name: 'Unavailable evaluations' })).toHaveTextContent('Could not evaluate this check');
    expect(screen.queryByRole('textbox', { name: failed.label })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'All Checks (3)' }));
    expect(screen.getByText('Not evaluated')).toBeInTheDocument();
  });

  it('preserves the actual outcome when ready conflicts with returned blocking findings', () => {
    render(<ReadinessCheckPanel result={result({ ready: true })} />);
    expect(screen.getByText('Assessment: Ready')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Review required' })).toBeInTheDocument();
    expect(screen.getByText(/blocking findings remain in its response/)).toBeInTheDocument();
  });

  it('preserves an uncertainty flag even when the same fact could not be evaluated', async () => {
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={result({ facts: [{ ...failed, uncertain: true, value: 'Possibly supplied' }] })} />);
    expect(count('Uncertain facts')).toBe('1');
    expect(count('Satisfied checks')).toBe('0');
    const extracted = screen.getByRole('region', { name: 'Extracted information' });
    expect(within(extracted).getByText('Not evaluated')).toBeInTheDocument();
    expect(within(extracted).getByText('Uncertain')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'All Checks (1)' }));
    expect(screen.getByText('Not evaluated · Uncertain')).toBeInTheDocument();
  });

  it('maps dropdowns to confirmed fields and text answers to the original label-based append format', async () => {
    const user = userEvent.setup(), apply = vi.fn();
    render(<ReadinessCheckPanel result={result({ facts: [environment, rollback, advisory] })} onApplyAnswers={apply} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Environment' }), 'Production');
    await user.type(screen.getByRole('textbox', { name: 'Rollback' }), 'Redeploy the previous image');
    await user.type(screen.getByRole('textbox', { name: 'Validation approach' }), 'Run the smoke test');
    await user.click(screen.getByRole('button', { name: 'Add answers & re-check' }));
    expect(apply).toHaveBeenCalledWith({ confirmedFields: { environment: 'Production' }, appendText: 'Rollback: Redeploy the previous image.\nValidation approach: Run the smoke test.' });
  });

  it('retains answers across tab changes, supports arrow/Home/End navigation, and keeps uncertainty and source evidence visible', async () => {
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={result()} onApplyAnswers={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Rollback' }), 'Use the recovery pipeline');
    screen.getByRole('tab', { name: 'Findings & Clarifications' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Extracted Information' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', screen.getByRole('tab', { selected: true }).id);
    expect(screen.getByText('From request: “billing-api”')).toBeInTheDocument();
    expect(screen.getByText('Uncertain')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Risks' })).toHaveFocus();
    expect(screen.getByText('No load test planned')).toBeInTheDocument();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'All Checks (4)' })).toHaveFocus();
    expect(within(screen.getByRole('region', { name: 'All assessment checks' })).getAllByRole('listitem')).toHaveLength(4);
    await user.keyboard('{Home}');
    expect(screen.getByRole('textbox', { name: 'Rollback' })).toHaveValue('Use the recovery pipeline');
  });

  it('keeps the answer-quality guard and associates feedback with the correct field', async () => {
    const user = userEvent.setup();
    render(<ReadinessCheckPanel result={result({ facts: [rollback] })} onApplyAnswers={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: 'Rollback' });
    await user.type(input, 'cake');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(expect.stringContaining('This looks like placeholder text, not a real answer.'));
    expect(screen.getByRole('button', { name: 'Add answers & re-check' })).toBeDisabled();
    await user.clear(input);
    await user.type(input, 'Use the rollback pipeline');
    expect(screen.getByRole('button', { name: 'Add answers & re-check' })).toBeEnabled();
  });

  it('keeps read-only findings read-only when there is no answer handler', () => {
    render(<ReadinessCheckPanel result={result({ facts: [environment, rollback] })} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add answers/ })).not.toBeInTheDocument();
  });

  it('rechecks with pending answers and preserves the ready boolean as the generation gate', async () => {
    const user = userEvent.setup(), recheck = vi.fn(), generate = vi.fn(), apply = vi.fn();
    const { rerender } = render(<ReadinessCheckPanel result={result()} onApplyAnswers={apply} onRecheck={recheck} onGenerateTicket={generate} />);
    expect(screen.getByRole('button', { name: 'Generate ticket' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Recheck readiness' }));
    expect(recheck).toHaveBeenCalledOnce();
    await user.type(screen.getByRole('textbox', { name: 'Rollback' }), 'Deploy the previous image');
    await user.click(screen.getByRole('button', { name: 'Recheck readiness' }));
    expect(apply).toHaveBeenCalledWith({ confirmedFields: {}, appendText: 'Rollback: Deploy the previous image.' });
    rerender(<ReadinessCheckPanel result={result({ ready: true })} onRecheck={recheck} onGenerateTicket={generate} />);
    await user.click(screen.getByRole('button', { name: 'Generate ticket' }));
    expect(generate).toHaveBeenCalledOnce();
    rerender(<ReadinessCheckPanel result={result({ ready: true })} onRecheck={recheck} onGenerateTicket={generate} busy generatingTicket />);
    expect(screen.getByRole('button', { name: /Generating…/ })).toBeDisabled();
  });

  it('collects an override reason without assuming it succeeded and shows the existing pending/error states', async () => {
    const user = userEvent.setup(), override = vi.fn();
    const props = { result: result(), onOverride: override };
    const { rerender } = render(<ReadinessCheckPanel {...props} />);
    await user.click(screen.getByRole('button', { name: 'Mark ready anyway' }));
    expect(screen.getByRole('button', { name: 'Confirm override' })).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: /Why is this ready/ }), 'Covered by the incident runbook');
    await user.click(screen.getByRole('button', { name: 'Confirm override' }));
    expect(override).toHaveBeenCalledWith('Covered by the incident runbook');
    expect(screen.getByText('Assessment: Not ready')).toBeInTheDocument();
    rerender(<ReadinessCheckPanel {...props} overriding />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    rerender(<ReadinessCheckPanel {...props} overrideError="Override could not be saved" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Override could not be saved');
    expect(screen.getByRole('textbox', { name: /Why is this ready/ })).toHaveValue('Covered by the incident runbook');
  });
});
