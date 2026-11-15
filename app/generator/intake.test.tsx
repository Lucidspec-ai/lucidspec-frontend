// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReadinessCheckResponse } from '@/lib/apiTypes';

const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn(), session: vi.fn(), post: vi.fn(), get: vi.fn(), fetch: vi.fn(), signOut: vi.fn(), single: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock('@/lib/safeSession', () => ({ safeGetSession: mocks.session }));
vi.mock('@/lib/supabase', () => ({ supabase: {
  auth: { signOut: mocks.signOut, onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }) },
  from: () => ({ select: () => ({ eq: () => ({ single: mocks.single }) }) }),
} }));
vi.mock('@/lib/api', () => ({ apiGet: mocks.get, apiPost: mocks.post, apiFetch: mocks.fetch, ApiError: class extends Error {} }));
vi.mock('@/lib/toast', () => ({ toast: { success: mocks.success, error: mocks.error, info: mocks.info } }));

import GeneratorPage from './page';
import { WORK_REQUEST_EXAMPLES, REQUEST_PRIVACY_DISCLOSURE } from '@/components/workspace/WorkRequestIntake';

const gapped: ReadinessCheckResponse = {
  mode: 'ai', summary: 'Review the billing service change.', ready: false,
  facts: [{ key: 'rollback', label: 'Rollback', question: 'How will you recover?', consequence: 'Recovery needs a plan.', severity: 'blocking', present: false, value: null, quote: null, uncertain: false }],
  risks: [], assumptions: [], ai_authored: false, pii_masked: false,
};

let sessionNumber = 0;
async function openIntake() {
  render(<GeneratorPage />);
  await screen.findByRole('heading', { name: 'Start with what you know.' });
  await waitFor(() => expect(within(screen.getByRole('navigation', { name: 'Application' })).getByText('7 / 100 used')).toBeInTheDocument());
  return userEvent.setup();
}

describe('generator intake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.post.mockReset();
    mocks.get.mockReset();
    window.localStorage.clear();
    window.history.replaceState(null, '', '/generator');
    mocks.session.mockResolvedValue({ data: { session: { access_token: `intake-test-${++sessionNumber}`, user: { id: 'demo', email: 'demo@example.com' } } } });
    mocks.single.mockResolvedValue({ data: { role: 'user' } });
    mocks.get.mockImplementation((path: string) => {
      if (path === '/api/me/quota') return Promise.resolve({ plan: 'pro', used: 7, limit: 100 });
      return Promise.resolve({});
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('reuses settings navigation and shows actual account data without any readiness result', async () => {
    await openIntake();
    const sidebar = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(sidebar).getByRole('link', { name: 'Work Requests' })).toHaveAttribute('href', '/generator');
    expect(within(sidebar).getByRole('link', { name: 'Work Requests' })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('link', { name: 'Readiness Standards' })).toHaveAttribute('href', '/account/checklist');
    expect(screen.getByRole('textbox', { name: 'Describe the work' })).toHaveValue('');
    expect(screen.getByRole('heading', { name: 'What happens next?' })).toBeInTheDocument();
    expect(screen.queryByText(/Looks ready/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generate ticket' })).not.toBeInTheDocument();
    expect(screen.getByText(REQUEST_PRIVACY_DISCLOSURE)).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('populates each example into the editable input without submitting and supports keyboard selection', async () => {
    const user = await openIntake();
    const input = screen.getByRole('textbox', { name: 'Describe the work' });
    for (const example of WORK_REQUEST_EXAMPLES) {
      const button = screen.getByRole('button', { name: new RegExp(example.title) });
      button.focus();
      await user.keyboard('{Enter}');
      expect(input).toHaveValue(example.prompt);
      expect(input).toHaveFocus();
      expect(button).toHaveAttribute('aria-pressed', 'true');
    }
    await user.type(input, ' Keep existing APIs.');
    expect(input).toHaveValue(WORK_REQUEST_EXAMPLES[2].prompt + ' Keep existing APIs.');
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('keeps placeholder controls and existing guidance inside collapsed Advanced options', async () => {
    const user = await openIntake();
    const summary = screen.getByText('Advanced options');
    const details = summary.closest('details')!;
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByRole('checkbox').closest('details')).not.toHaveAttribute('open');
    await user.click(summary);
    expect(details).toHaveAttribute('open');
    expect(screen.getByRole('link', { name: 'View parked placeholders' })).toHaveAttribute('href', '/generator/placeholders');
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Save for later' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Tips & starters' }));
    expect(screen.getByRole('dialog', { name: 'Prompt tips and starters' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(summary);
    await user.click(summary);
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('preserves minimum-length and engineering validation before any assessment API call', async () => {
    const user = await openIntake();
    const input = screen.getByRole('textbox', { name: 'Describe the work' });
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please write at least 8 characters.');
    await user.type(input, 'Plan a birthday party');
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    expect(await screen.findByRole('dialog', { name: 'Engineering input required' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(input).toHaveFocus();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('calls the original assessment endpoint and waits for its response before showing results', async () => {
    const user = await openIntake();
    let resolve!: (value: ReadinessCheckResponse) => void;
    mocks.post.mockReturnValue(new Promise<ReadinessCheckResponse>(done => { resolve = done; }));
    await user.click(screen.getByRole('button', { name: /Production Change/ }));
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    expect(await screen.findByRole('button', { name: 'Checking readiness…' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Generate ticket' })).not.toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.post).toHaveBeenCalledWith('/api/generate/readiness-check', { task_input: WORK_REQUEST_EXAMPLES[1].prompt }, expect.objectContaining({ token: expect.stringMatching(/^intake-test/), timeoutMs: 30000 }));
    await act(async () => resolve(gapped));
    expect(await screen.findByText('1 blocking finding needs attention. Add details or edit the request, then recheck.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate ticket' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Edit request' }));
    expect(screen.getByPlaceholderText(/Describe the target system/)).toHaveValue(WORK_REQUEST_EXAMPLES[1].prompt);
  });

  it('sends the existing placeholder flag and only offers generation after a ready API response', async () => {
    const user = await openIntake();
    mocks.post.mockResolvedValue({ ...gapped, ready: true, facts: [] });
    await user.click(screen.getByRole('button', { name: /Feature Request/ }));
    await user.click(screen.getByText('Advanced options'));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalled());
    await screen.findByRole('button', { name: 'Generate ticket' });
    expect(mocks.post).toHaveBeenCalledWith('/api/generate/readiness-check', { task_input: WORK_REQUEST_EXAMPLES[0].prompt, is_placeholder: true }, expect.anything());
    expect(mocks.success).toHaveBeenCalledWith('Readiness check complete');
  });

  it('retains edited input and placeholder state on assessment failure and permits retry', async () => {
    const user = await openIntake();
    mocks.post.mockRejectedValueOnce(new Error('Service unavailable')).mockResolvedValueOnce(gapped);
    const input = screen.getByRole('textbox', { name: 'Describe the work' });
    await user.type(input, '  Fix the billing API retry bug  ');
    await user.click(screen.getByText('Advanced options'));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
    expect(input).toHaveValue('  Fix the billing API retry bug  ');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(mocks.success).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    await screen.findByText('1 blocking finding needs attention. Add details or edit the request, then recheck.');
    expect(mocks.post).toHaveBeenCalledTimes(2);
    expect(mocks.post).toHaveBeenLastCalledWith('/api/generate/readiness-check', { task_input: 'Fix the billing API retry bug', is_placeholder: true }, expect.anything());
  });

  it('does not label the account Free when quota cannot be loaded', async () => {
    mocks.get.mockRejectedValue(new Error('Quota unavailable'));
    render(<GeneratorPage />);
    await screen.findByRole('heading', { name: 'Start with what you know.' });
    await waitFor(() => expect(within(screen.getByRole('navigation', { name: 'Application' })).getByText('Usage unavailable')).toBeInTheDocument());
    expect(screen.queryByText('Free plan')).not.toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
});

describe('generator readiness review integration', () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.post.mockReset(); mocks.get.mockReset();
    window.localStorage.clear(); window.history.replaceState(null, '', '/generator');
    mocks.session.mockResolvedValue({ data: { session: { access_token: `review-test-${++sessionNumber}`, user: { id: 'demo', email: 'demo@example.com' } } } });
    mocks.single.mockResolvedValue({ data: { role: 'user' } });
    mocks.get.mockImplementation((path: string) => Promise.resolve(path === '/api/me/quota' ? { plan: 'pro', used: 7, limit: 100 } : {}));
    Element.prototype.scrollIntoView = vi.fn();
  });

  async function assess(response: ReadinessCheckResponse) {
    const user = await openIntake();
    mocks.post.mockResolvedValueOnce(response);
    await user.type(screen.getByRole('textbox', { name: 'Describe the work' }), 'Deploy the billing-api change');
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    await screen.findByRole('heading', { name: 'Readiness Review' });
    return user;
  }

  it('renders the actual route with its original request, sidebar, and real summary counts', async () => {
    await assess(gapped);
    expect(screen.getByText('Deploy the billing-api change')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All Checks (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate ticket' })).toBeDisabled();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(mocks.post).toHaveBeenCalledTimes(1);
  });

  it('preserves confirmed-field keys, appended answer text, and the original recheck endpoint', async () => {
    const choice = { ...gapped.facts[0], key: 'environment', label: 'Environment', choices: ['Production', 'Staging'] };
    const user = await assess({ ...gapped, facts: [choice, ...gapped.facts] });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Environment' }), 'Production');
    await user.type(screen.getByRole('textbox', { name: 'Rollback' }), 'Redeploy the previous image');
    let resolve!: (value: ReadinessCheckResponse) => void;
    mocks.post.mockReturnValueOnce(new Promise<ReadinessCheckResponse>(done => { resolve = done; }));
    await user.click(screen.getByRole('button', { name: 'Recheck readiness' }));
    await screen.findByRole('button', { name: 'Checking readiness…' });
    expect(mocks.post).toHaveBeenLastCalledWith('/api/generate/readiness-check', { task_input: 'Deploy the billing-api change\nRollback: Redeploy the previous image.', confirmed_fields: { environment: 'Production' } }, expect.objectContaining({ timeoutMs: 30000 }));
    await act(async () => resolve({ ...gapped, ready: true, facts: [{ ...choice, choices: [], present: true, value: 'Production', uncertain: true }] }));
    expect(await screen.findByText('Uncertain')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate ticket' })).toBeEnabled();
  });

  it('preserves duplicate-check handling and the existing request editor', async () => {
    const user = await assess(gapped);
    await user.click(screen.getByRole('button', { name: 'Recheck readiness' }));
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.info).toHaveBeenCalledWith('Already showing the readiness check for this input.');
    await user.click(screen.getByRole('button', { name: 'Edit request' }));
    const input = screen.getByPlaceholderText(/Describe the target system/);
    expect(input).toHaveValue('Deploy the billing-api change');
    await user.type(input, ' in staging');
    expect(screen.getByRole('status')).toHaveTextContent('Request edited. The assessment below is from your last check.');
    mocks.post.mockResolvedValueOnce(gapped);
    await user.click(screen.getByRole('button', { name: 'Check readiness' }));
    await screen.findByRole('button', { name: 'Edit request' });
    expect(mocks.post).toHaveBeenLastCalledWith('/api/generate/readiness-check', { task_input: 'Deploy the billing-api change in staging' }, expect.anything());
  });

  it('preserves the ticket payload, loading, failure, retry, and generated-ticket view without dispatching', async () => {
    const ready = { ...gapped, ready: true, facts: [{ ...gapped.facts[0], severity: 'advisory' as const }] };
    const user = await assess(ready);
    expect(screen.getByRole('heading', { name: 'Review recommended' })).toBeInTheDocument();
    let reject!: (error: Error) => void;
    mocks.post.mockReturnValueOnce(new Promise((_resolve, failed) => { reject = failed; }));
    await user.click(screen.getByRole('button', { name: 'Generate ticket' }));
    expect(await screen.findByRole('button', { name: /Generating…/ })).toBeDisabled();
    expect(mocks.post).toHaveBeenLastCalledWith('/api/generate/ticket-detail', { readiness_result: ready, saved_ticket_id: null }, expect.objectContaining({ timeoutMs: 30000 }));
    await act(async () => reject(new Error('Generation unavailable')));
    expect(await screen.findByRole('alert')).toHaveTextContent('Generation unavailable');
    expect(screen.getByRole('heading', { name: 'Readiness Review' })).toBeInTheDocument();
    mocks.post.mockResolvedValueOnce({ id: 'ticket-review', title: 'Deploy billing-api', ticket_type: 'Story', description: 'Deploy the reviewed change.', acceptance_criteria: 'Smoke test passes', technical_summary: 'Use existing pipeline', dependencies: 'None', assumptions: 'None', expected_outcome: 'Updated service' });
    await user.click(screen.getByRole('button', { name: 'Generate ticket' }));
    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith('Ticket generated'));
    expect(screen.queryByRole('tab', { name: 'Findings & Clarifications' })).not.toBeInTheDocument();
    expect(mocks.post.mock.calls.some(([url]) => String(url).includes('dispatch'))).toBe(false);
  });

  it('does not fabricate assessment results after a failed recheck and retains appended request details', async () => {
    const user = await assess(gapped);
    await user.type(screen.getByRole('textbox', { name: 'Rollback' }), 'Redeploy the previous image');
    mocks.post.mockRejectedValueOnce(new Error('Recheck unavailable'));
    await user.click(screen.getByRole('button', { name: 'Recheck readiness' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Recheck unavailable');
    expect(screen.getByRole('textbox', { name: 'Describe the work' })).toHaveValue('Deploy the billing-api change\nRollback: Redeploy the previous image.');
    expect(screen.queryByRole('region', { name: 'Readiness assessment' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generate ticket' })).not.toBeInTheDocument();
  });

  it('only records the existing override after the API succeeds and preserves original findings in the review', async () => {
    const user = await assess(gapped);
    await user.click(screen.getByRole('button', { name: 'Mark ready anyway' }));
    await user.type(screen.getByRole('textbox', { name: /Why is this ready/ }), 'Covered by an approved runbook');
    mocks.post.mockRejectedValueOnce(new Error('Override unavailable'));
    await user.click(screen.getByRole('button', { name: 'Confirm override' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Override unavailable');
    expect(screen.getByRole('button', { name: 'Generate ticket' })).toBeDisabled();
    mocks.post.mockResolvedValueOnce({ ok: true });
    await user.click(screen.getByRole('button', { name: 'Confirm override' }));
    await screen.findByRole('heading', { name: 'Manual override recorded' });
    expect(screen.getByText('Assessment: Not ready')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate ticket' })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Rollback' })).toBeInTheDocument();
    expect(mocks.post).toHaveBeenLastCalledWith('/api/generate/override', expect.objectContaining({ gap_keys: ['rollback'], reason: 'Covered by an approved runbook' }), expect.anything());
  });
});
