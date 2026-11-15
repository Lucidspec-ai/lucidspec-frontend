// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReadinessChecklist } from './ReadinessChecklist';
import { FactStateControl, ReadinessSummary } from './ReadinessControls';
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
    expect(within(screen.getByRole('region', { name: 'Work Context' })).getByText('Target')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Additional Context' })).getByText('Future check')).toBeInTheDocument();
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
    expect(screen.queryByRole('region', { name: 'Execution Planning' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Additional Context' })).not.toBeInTheDocument();
  });

  it('renders exactly the four requested categories without duplicating or dropping known or new keys', () => {
    const catalog: RubricFactSummary[] = ['target', 'environment', 'change_scope', 'change_type', 'deployment_path', 'dependencies', 'planning_period', 'validation', 'rollback', 'figma_link', 'client_tag', 'new_check'].map((key) => ({ key, label: key, question: 'Existing question', severity: 'advisory' }));
    render(<ReadinessChecklist facts={catalog} values={{}} onChange={vi.fn()} layout="workspace" />);
    expect(screen.getAllByRole('region').map((region) => region.getAttribute('aria-label'))).toEqual(['Work Context', 'Execution Planning', 'Validation & Recovery', 'Additional Context']);
    expect(screen.getAllByRole('group')).toHaveLength(catalog.length);
    expect(within(screen.getByRole('region', { name: 'Execution Planning' })).getByText('planning_period')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Validation & Recovery' })).getByText('validation')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Additional Context' })).getByText('new_check')).toBeInTheDocument();
  });

  it('calculates summary counts only from the loaded catalog, using defaults and selected overrides', () => {
    render(<ReadinessSummary facts={facts} values={{ rollback: 'off', client_tag: 'blocking', obsolete_key: 'off' }} />);
    expect(screen.getAllByRole('definition').map((entry) => entry.querySelector('span')?.textContent)).toEqual(['2', '1', '1']);
    expect(screen.getByText('4 standard checks · Custom Rules are managed separately')).toBeInTheDocument();
    expect(screen.getByText('Missing details prevent readiness.')).toBeInTheDocument();
  });

  it('supports keyboard selection and exposes the selected state without relying on color', async () => {
    const change = vi.fn();
    render(<FactStateControl value="blocking" onChange={change} label="Target" />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Off' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('off');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Advisory' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Blocking' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Off' })).toHaveAttribute('aria-pressed', 'false');
  });
});
