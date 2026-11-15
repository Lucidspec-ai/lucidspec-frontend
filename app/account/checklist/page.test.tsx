// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const apiGetMock = vi.fn();
const apiFetchMock = vi.fn();
vi.mock('@/lib/api', () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const safeGetSessionMock = vi.fn();
vi.mock('@/lib/safeSession', () => ({
  safeGetSession: (...args: unknown[]) => safeGetSessionMock(...args),
}));

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('@/lib/toast', () => ({
  toast: toastMock,
}));

import ChecklistSettingsPage from './page';
import type { CustomRule, RubricSettings } from '@/lib/apiTypes';

const SETTINGS: RubricSettings = {
  facts: [
    { key: 'target', label: 'Target', question: 'Which service or app does this touch?', severity: 'blocking' },
    { key: 'rollback', label: 'Rollback', question: 'How do you undo it if it breaks?', severity: 'blocking' },
    { key: 'client_tag', label: 'Client / industry tag', question: 'Which client or industry is this request tied to?', severity: 'advisory' },
  ],
  fact_settings: {},
};

const RULE: CustomRule = {
  id: '5f47ac10-58cc-4372-a567-0e02b2c3d479',
  name: 'Concurrent load',
  category: 'Tech Scope',
  prompt_text: 'Does the ticket mention concurrent user load?',
  severity: 'blocking',
  active: true,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
};

function mockSettings(settings: RubricSettings, rules: CustomRule[] = []) {
  apiGetMock.mockImplementation((url: string) =>
    url.includes('custom-rules') ? Promise.resolve({ rules }) : Promise.resolve(settings)
  );
}

function ruleSeverityButtons() {
  const container = screen.getByRole('group', { name: 'Severity' });
  return {
    advisory: within(container).getByRole('button', { name: 'Advisory' }),
    blocking: within(container).getByRole('button', { name: 'Blocking' }),
  };
}

function ruleCategoryButtons() {
  const container = screen.getByRole('group', { name: 'Category' });
  return {
    techScope: within(container).getByRole('button', { name: 'Tech Scope' }),
    riskAndDeploy: within(container).getByRole('button', { name: 'Risk & Deploy' }),
    security: within(container).getByRole('button', { name: 'Security' }),
  };
}

async function openCategory(name: string) {
  await userEvent.setup().click(await screen.findByRole('tab', { name }));
}

function stateButtonsFor(label: string) {
  const row = screen.getByText(label).closest('div') as HTMLElement;
  return {
    off: within(row).getByRole('button', { name: 'Off' }),
    advisory: within(row).getByRole('button', { name: 'Advisory' }),
    blocking: within(row).getByRole('button', { name: 'Blocking' }),
  };
}

function summaryCounts() {
  return within(screen.getByRole('region', { name: 'Selected standard check severities' }))
    .getAllByRole('definition').map((entry) => entry.querySelector('span')?.textContent);
}

describe('ChecklistSettingsPage', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/account/checklist');
    pushMock.mockReset();
    apiGetMock.mockReset();
    apiFetchMock.mockReset();
    safeGetSessionMock.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    safeGetSessionMock.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    safeGetSessionMock.mockResolvedValue({ data: { session: null } });

    render(<ChecklistSettingsPage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/signin')));
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('defaults every field to its built-in severity when nothing is customized', async () => {
    mockSettings(SETTINGS);

    render(<ChecklistSettingsPage />);

    expect(await screen.findByText('Target')).toBeInTheDocument();
    await openCategory('Validation & Recovery');
    expect(stateButtonsFor('Rollback').blocking).toHaveAttribute('aria-pressed', 'true');
    await openCategory('Additional Context');
    expect(stateButtonsFor('Client / industry tag').advisory).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects a previously-saved override', async () => {
    mockSettings({ ...SETTINGS, fact_settings: { rollback: 'off' } });

    render(<ChecklistSettingsPage />);
    await openCategory('Validation & Recovery');
    await screen.findByText('Rollback');

    expect(stateButtonsFor('Rollback').off).toHaveAttribute('aria-pressed', 'true');
  });

  it('waits for loaded settings and updates the summary and unsaved state as selections change', async () => {
    let resolveSettings!: (value: RubricSettings) => void;
    const pending = new Promise<RubricSettings>((resolve) => { resolveSettings = resolve; });
    apiGetMock.mockImplementation((url: string) => url.includes('custom-rules') ? Promise.resolve({ rules: [] }) : pending);
    const user = userEvent.setup();
    render(<ChecklistSettingsPage />);
    expect(screen.queryByRole('region', { name: 'Selected standard check severities' })).not.toBeInTheDocument();
    await act(async () => resolveSettings({ ...SETTINGS, fact_settings: { rollback: 'off' } }));
    expect(summaryCounts()).toEqual(['1', '1', '1']);
    expect(screen.getByRole('button', { name: 'Save standards' })).toBeDisabled();

    await user.click(stateButtonsFor('Target').advisory);
    expect(summaryCounts()).toEqual(['0', '2', '1']);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save standards' })).toBeEnabled();

    await user.click(stateButtonsFor('Target').blocking);
    expect(summaryCounts()).toEqual(['1', '1', '1']);
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save standards' })).toBeDisabled();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('reloads the backend-confirmed values after a successful save', async () => {
    mockSettings(SETTINGS);
    const saved = { ...SETTINGS, fact_settings: { rollback: 'off' as const } };
    apiFetchMock.mockResolvedValue(saved);
    const user = userEvent.setup();
    const page = render(<ChecklistSettingsPage />);
    await openCategory('Validation & Recovery');
    await screen.findByText('Rollback');
    await user.click(stateButtonsFor('Rollback').off);
    await user.click(screen.getByRole('button', { name: 'Save standards' }));
    await screen.findByText('Readiness standards saved.');
    expect(summaryCounts()).toEqual(['1', '1', '1']);
    page.unmount();

    mockSettings(saved);
    render(<ChecklistSettingsPage />);
    await openCategory('Validation & Recovery');
    await screen.findByText('Rollback');
    expect(stateButtonsFor('Rollback').off).toHaveAttribute('aria-pressed', 'true');
    expect(summaryCounts()).toEqual(['1', '1', '1']);
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save standards' })).toBeDisabled();
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not show zero counts or enable saving when readiness settings fail to load', async () => {
    apiGetMock.mockImplementation((url: string) => url.includes('custom-rules') ? Promise.resolve({ rules: [] }) : Promise.reject(new Error('Service unavailable')));
    render(<ChecklistSettingsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Readiness standards could not be loaded.');
    expect(screen.queryByRole('region', { name: 'Selected standard check severities' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save standards' })).not.toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('clicking Off then Save sends the updated fact_settings map', async () => {
    mockSettings(SETTINGS);
    apiFetchMock.mockResolvedValue({ ...SETTINGS, fact_settings: { rollback: 'off' } });
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Validation & Recovery');
    await screen.findByText('Rollback');

    await user.click(stateButtonsFor('Rollback').off);
    await user.click(screen.getByRole('button', { name: /Save standards/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/rubric-settings',
        expect.objectContaining({
          method: 'PUT',
          body: { fact_settings: { target: 'blocking', rollback: 'off', client_tag: 'advisory' } },
        })
      )
    );
  });

  it('a normally-advisory field can be upgraded to Blocking', async () => {
    mockSettings(SETTINGS);
    apiFetchMock.mockResolvedValue({ ...SETTINGS, fact_settings: { client_tag: 'blocking' } });
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Additional Context');
    await screen.findByText('Client / industry tag');

    await user.click(stateButtonsFor('Client / industry tag').blocking);
    await user.click(screen.getByRole('button', { name: /Save standards/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/rubric-settings',
        expect.objectContaining({
          method: 'PUT',
          body: { fact_settings: { target: 'blocking', rollback: 'blocking', client_tag: 'blocking' } },
        })
      )
    );
  });

  it('shows success only after the API confirms the save and clears it when edited again', async () => {
    mockSettings(SETTINGS);
    let resolveSave!: (value: RubricSettings) => void;
    apiFetchMock.mockReturnValue(new Promise<RubricSettings>((resolve) => { resolveSave = resolve; }));
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Validation & Recovery');
    await screen.findByText('Rollback');
    await user.click(stateButtonsFor('Rollback').off);
    expect(screen.getByRole('status')).toHaveTextContent('You have unsaved changes.');
    await user.click(screen.getByRole('button', { name: 'Save standards' }));

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(stateButtonsFor('Rollback').blocking).toBeDisabled();
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(screen.queryByText('Readiness standards saved.')).not.toBeInTheDocument();

    await act(async () => resolveSave({ ...SETTINGS, fact_settings: { rollback: 'off' } }));
    expect(screen.getByRole('status')).toHaveTextContent('Readiness standards saved.');
    expect(toastMock.success).toHaveBeenCalledWith('Readiness standards saved');

    await user.click(stateButtonsFor('Rollback').blocking);
    expect(screen.getByRole('status')).toHaveTextContent('You have unsaved changes.');
    expect(screen.queryByText('Readiness standards saved.')).not.toBeInTheDocument();
  });

  it('retains selections and displays a persistent error when a save fails, allowing retry', async () => {
    mockSettings(SETTINGS);
    apiFetchMock.mockRejectedValueOnce(new Error('Service unavailable'));
    apiFetchMock.mockResolvedValueOnce({ ...SETTINGS, fact_settings: { rollback: 'off' } });
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Validation & Recovery');
    await screen.findByText('Rollback');
    await user.click(stateButtonsFor('Rollback').off);
    await user.click(screen.getByRole('button', { name: 'Save standards' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Changes were not saved. Service unavailable');
    expect(stateButtonsFor('Rollback').off).toHaveAttribute('aria-pressed', 'true');
    expect(toastMock.success).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save standards' }));
    expect(await screen.findByText('Readiness standards saved.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenCalledTimes(2);
  });

  it('renders the custom-rules list', async () => {
    mockSettings(SETTINGS, [RULE]);

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');

    expect(await screen.findByText('Concurrent load')).toBeInTheDocument();
    expect(screen.getByText('Tech Scope')).toBeInTheDocument();
    expect(screen.getByText('blocking')).toBeInTheDocument();
  });

  it('shows a ticket-type tag and a suggested-from-example badge for a proposed rule', async () => {
    mockSettings(SETTINGS, [
      { ...RULE, ticket_type: 'Bug', source: 'example_extraction', active: false },
    ]);

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');

    await screen.findByText('Concurrent load');
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Suggested from example')).toBeInTheDocument();
  });

  it('does not show the suggested-from-example badge for a manually-authored rule', async () => {
    mockSettings(SETTINGS, [{ ...RULE, source: 'manual' }]);

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');

    await screen.findByText('Concurrent load');
    expect(screen.queryByText('Suggested from example')).not.toBeInTheDocument();
  });

  it('shows a placeholder message when there are no custom rules yet', async () => {
    mockSettings(SETTINGS, []);

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');

    expect(await screen.findByText('No custom rules yet.')).toBeInTheDocument();
  });

  it('adding a rule posts the form and clears it on success', async () => {
    mockSettings(SETTINGS, []);
    apiFetchMock.mockResolvedValue(RULE);
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    await screen.findByText('No custom rules yet.');

    await user.click(screen.getByRole('button', { name: '+ Add Custom Rule' }));
    await user.type(screen.getByLabelText('Rule name'), RULE.name);
    await user.click(ruleCategoryButtons().techScope);
    await user.type(screen.getByLabelText('What should this rule check?'), RULE.prompt_text);
    await user.click(ruleSeverityButtons().blocking);
    await user.click(screen.getByRole('button', { name: 'Add Custom Rule' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/custom-rules',
        expect.objectContaining({
          method: 'POST',
          body: {
            name: RULE.name,
            category: RULE.category,
            prompt_text: RULE.prompt_text,
            severity: 'blocking',
          },
        })
      )
    );
    // The form closes on success -- the trigger button reappears.
    await waitFor(() => expect(screen.getByRole('button', { name: '+ Add Custom Rule' })).toBeInTheDocument());
  });

  it('editing a rule pre-fills the form and sends a PUT', async () => {
    mockSettings(SETTINGS, [RULE]);
    apiFetchMock.mockResolvedValue({ ...RULE, severity: 'advisory' });
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    await screen.findByText('Concurrent load');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Rule name')).toHaveValue(RULE.name);

    await user.click(ruleSeverityButtons().advisory);
    await user.click(screen.getByRole('button', { name: 'Save Custom Rule' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        `/api/account/custom-rules/${RULE.id}`,
        expect.objectContaining({
          method: 'PUT',
          body: expect.objectContaining({ severity: 'advisory' }),
        })
      )
    );
  });

  it('pausing a rule sends active: false', async () => {
    mockSettings(SETTINGS, [RULE]);
    apiFetchMock.mockResolvedValue({ ...RULE, active: false });
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    await screen.findByText('Concurrent load');

    await user.click(screen.getByRole('button', { name: 'Pause' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        `/api/account/custom-rules/${RULE.id}`,
        expect.objectContaining({ method: 'PUT', body: { active: false } })
      )
    );
  });

  it('deleting a rule removes it from the list', async () => {
    mockSettings(SETTINGS, [RULE]);
    apiFetchMock.mockResolvedValue({ status: 'deleted' });
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    await screen.findByText('Concurrent load');

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        `/api/account/custom-rules/${RULE.id}`,
        expect.objectContaining({ method: 'DELETE' })
      )
    );
    await waitFor(() => expect(screen.queryByText('Concurrent load')).not.toBeInTheDocument());
  });

  it('a rejected save surfaces a toast instead of crashing', async () => {
    mockSettings(SETTINGS, []);
    apiFetchMock.mockRejectedValue(new Error('unsafe_input'));
    const user = userEvent.setup();

    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    await screen.findByText('No custom rules yet.');

    await user.click(screen.getByRole('button', { name: '+ Add Custom Rule' }));
    await user.type(screen.getByLabelText('Rule name'), RULE.name);
    await user.click(ruleCategoryButtons().techScope);
    await user.type(screen.getByLabelText('What should this rule check?'), RULE.prompt_text);
    await user.click(screen.getByRole('button', { name: 'Add Custom Rule' }));

    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('unsafe_input'));
    // The form must stay open with what the user typed, not silently vanish.
    expect(screen.getByLabelText('Rule name')).toHaveValue(RULE.name);
    expect(screen.getByRole('alert')).toHaveTextContent('Your rule was not saved. unsafe_input');
    expect(screen.getByLabelText('What should this rule check?')).toHaveValue(RULE.prompt_text);
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('offers a custom-rules tab and does not claim a failed rule load is empty', async () => {
    apiGetMock.mockImplementation((url: string) => url.includes('custom-rules') ? Promise.reject(new Error('Service unavailable')) : Promise.resolve(SETTINGS));
    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    expect(screen.getByRole('tab', { name: 'Custom Rules' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
    expect(screen.queryByText('No custom rules yet.')).not.toBeInTheDocument();
  });

  it('shows one category at a time and retains selections when switching categories', async () => {
    mockSettings(SETTINGS);
    const user = userEvent.setup();
    render(<ChecklistSettingsPage />);
    await screen.findByRole('tab', { name: 'Work Context' });
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Work Context');
    expect(screen.queryByRole('group', { name: 'Rollback severity' })).not.toBeInTheDocument();
    await user.click(stateButtonsFor('Target').off);
    await openCategory('Validation & Recovery');
    await user.click(stateButtonsFor('Rollback').advisory);
    await openCategory('Additional Context');
    expect(screen.getByRole('group', { name: 'Client / industry tag severity' })).toBeInTheDocument();
    await openCategory('Work Context');
    expect(stateButtonsFor('Target').off).toHaveAttribute('aria-pressed', 'true');
    expect(summaryCounts()).toEqual(['0', '2', '1']);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('supports arrow, Home, and End keys with focus and tab-panel relationships', async () => {
    mockSettings(SETTINGS);
    const user = userEvent.setup();
    render(<ChecklistSettingsPage />);
    const first = await screen.findByRole('tab', { name: 'Work Context' });
    first.focus();
    await user.keyboard('{ArrowRight}');
    const planning = screen.getByRole('tab', { name: 'Execution Planning' });
    expect(planning).toHaveFocus();
    expect(planning).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', planning.getAttribute('aria-controls'));
    expect(screen.getByText('No checks in this category are available for your account.')).toBeInTheDocument();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Custom Rules' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Home}');
    expect(first).toHaveFocus();
    expect(screen.getAllByRole('tab').filter(tab => tab.tabIndex === 0)).toEqual([first]);
  });

  it('honors existing custom-rules deep links and subsequent hash navigation', async () => {
    window.history.replaceState(null, '', '/account/checklist#custom-rules');
    mockSettings(SETTINGS);
    render(<ChecklistSettingsPage />);
    expect(await screen.findByRole('tabpanel', { name: 'Custom Rules' })).toBeInTheDocument();
    act(() => {
      window.history.replaceState(null, '', '#additional-context');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByRole('tabpanel', { name: 'Additional Context' })).toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('discards standard edits back to the last confirmed settings without saving or clearing a custom draft', async () => {
    mockSettings({ ...SETTINGS, fact_settings: { target: 'off' } });
    const user = userEvent.setup();
    render(<ChecklistSettingsPage />);
    await screen.findByText('Target');
    await user.click(stateButtonsFor('Target').blocking);
    await openCategory('Custom Rules');
    await user.click(screen.getByRole('button', { name: '+ Add Custom Rule' }));
    await user.type(screen.getByLabelText('Rule name'), 'My draft');
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(screen.getByLabelText('Rule name')).toHaveValue('My draft');
    await openCategory('Work Context');
    expect(stateButtonsFor('Target').off).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Save standards' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('No unsaved changes.');
    await openCategory('Custom Rules');
    expect(screen.getByLabelText('Rule name')).toHaveValue('My draft');
    expect(apiFetchMock).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('keeps the custom-rule preview operation and supported severity values', async () => {
    mockSettings(SETTINGS);
    apiFetchMock.mockResolvedValue({ present: true, evaluated: true, value: '100 users' });
    const user = userEvent.setup();
    render(<ChecklistSettingsPage />);
    await openCategory('Custom Rules');
    await user.click(screen.getByRole('button', { name: '+ Add Custom Rule' }));
    await user.type(screen.getByLabelText('Rule name'), RULE.name);
    await user.type(screen.getByLabelText('What should this rule check?'), RULE.prompt_text);
    await user.type(screen.getByLabelText('Example ticket to test'), '100 users');
    expect(within(screen.getByRole('group', { name: 'Severity' })).queryByRole('button', { name: 'Off' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Test rule' }));
    await screen.findByText('Matched: "100 users"');
    expect(apiFetchMock).toHaveBeenCalledWith('/api/account/custom-rules/preview', expect.objectContaining({
      method: 'POST', body: { name: RULE.name, category: 'Tech Scope', prompt_text: RULE.prompt_text, severity: 'advisory', sample_text: '100 users' },
    }));
    expect(toastMock.success).not.toHaveBeenCalled();
  });
});
