// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReadinessChecklist } from './ReadinessChecklist';
import type { RubricFactSummary } from '@/lib/apiTypes';

const facts: RubricFactSummary[] = [
  { key: 'target', label: 'Target', question: 'Which service?', severity: 'blocking' },
  { key: 'rollback', label: 'Rollback', question: 'How do you recover?', severity: 'blocking' },
  { key: 'client_tag', label: 'Client', question: 'Who is affected?', severity: 'advisory' },
  { key: 'future_check', label: 'Future check', question: 'A new backend check?', severity: 'advisory' },
];

describe('ReadinessChecklist', () => {
  it('retains every API fact exactly once, with saved values and an unknown-key fallback', async () => {
    const onChange = vi.fn();
    render(<ReadinessChecklist facts={facts} values={{ rollback: 'off', future_check: 'blocking' }} onChange={onChange} />);
    expect(screen.getAllByRole('group')).toHaveLength(facts.length);
    expect(within(screen.getByRole('region', { name: 'Change context' })).getByText('Target')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Additional checks' })).getByText('Future check')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Rollback severity' })).getByRole('button', { name: 'Off' })).toHaveAttribute('aria-pressed', 'true');
    const future = screen.getByRole('group', { name: 'Future check severity' });
    expect(within(future).getByRole('button', { name: 'Blocking' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(within(future).getByRole('button', { name: 'Advisory' }));
    expect(onChange).toHaveBeenCalledWith('future_check', 'advisory');
  });

  it('disables every severity action while saving and omits empty sections', () => {
    render(<ReadinessChecklist facts={[facts[0]]} values={{}} onChange={vi.fn()} disabled />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
    expect(screen.queryByRole('region', { name: 'Planning & impact' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Additional checks' })).not.toBeInTheDocument();
  });
});
