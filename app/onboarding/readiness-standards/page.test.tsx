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

import ReadinessStandardsOnboardingPage from './page';
import type { RubricSettings } from '@/lib/apiTypes';

const SETTINGS: RubricSettings = {
  facts: [
    { key: 'target', label: 'Target', question: 'Which service or app does this touch?', severity: 'blocking' },
    { key: 'validation', label: 'Validation', question: 'How will anyone know it worked?', severity: 'blocking' },
    { key: 'client_tag', label: 'Client / industry tag', question: 'Which client or industry is this request tied to?', severity: 'advisory' },
  ],
  fact_settings: {},
};

function setLocation(search: string) {
  window.history.pushState({}, '', `/onboarding/readiness-standards${search}`);
}

function factButtons(label: string) {
  const container = screen.getByText(label).closest('div') as HTMLElement;
  const buttons = within(container).getAllByRole('button');
  return { off: buttons[0], advisory: buttons[1], blocking: buttons[2] };
}

describe('ReadinessStandardsOnboardingPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    apiGetMock.mockReset();
    apiFetchMock.mockReset();
    toastMock.error.mockReset();
    toastMock.success.mockReset();
    safeGetSessionMock.mockReset();
    safeGetSessionMock.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    apiGetMock.mockResolvedValue(SETTINGS);
    apiFetchMock.mockResolvedValue(SETTINGS);
    setLocation('');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    safeGetSessionMock.mockResolvedValue({ data: { session: null } });

    render(<ReadinessStandardsOnboardingPage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/signin')));
  });

  it('renders the fact catalog pre-filled with its default severities', async () => {
    render(<ReadinessStandardsOnboardingPage />);

    await screen.findByText('Target');
    expect(factButtons('Target').blocking).toHaveAttribute('aria-pressed', 'true');
    expect(factButtons('Client / industry tag').advisory).toHaveAttribute('aria-pressed', 'true');
  });

  it('Continue saves the current state and moves on to connect-tracker with next preserved', async () => {
    setLocation('?next=%2Fusage-cost');
    const user = userEvent.setup();

    render(<ReadinessStandardsOnboardingPage />);
    await screen.findByText('Target');

    // Adjust one field before continuing.
    await user.click(factButtons('Client / industry tag').blocking);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/rubric-settings',
        expect.objectContaining({
          method: 'PUT',
          body: { fact_settings: { target: 'blocking', validation: 'blocking', client_tag: 'blocking' } },
        })
      )
    );
    expect(pushMock).toHaveBeenCalledWith('/onboarding/connect-tracker?next=%2Fusage-cost');
    expect(toastMock.success).toHaveBeenCalledWith('Readiness standards saved');
  });

  it('stays on the current step after a failed save and preserves selections for retry', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('network error'));
    apiFetchMock.mockResolvedValueOnce({ ...SETTINGS, fact_settings: { client_tag: 'off' } });
    const user = userEvent.setup();

    render(<ReadinessStandardsOnboardingPage />);
    await screen.findByText('Target');
    await user.click(factButtons('Client / industry tag').off);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(toastMock.error).toHaveBeenCalled());
    expect(toastMock.error).toHaveBeenCalledWith(expect.stringContaining('Your changes were not saved.'), { durationMs: 8000 });
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Your changes were not saved.');
    expect(pushMock).not.toHaveBeenCalled();
    expect(factButtons('Client / industry tag').off).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(toastMock.success).toHaveBeenCalledTimes(1));
    expect(pushMock).toHaveBeenCalledWith('/onboarding/connect-tracker?next=%2Fgenerator');
    expect(apiFetchMock).toHaveBeenCalledTimes(2);
    expect(apiFetchMock).toHaveBeenLastCalledWith('/api/account/rubric-settings', expect.objectContaining({ body: { fact_settings: { target: 'blocking', validation: 'blocking', client_tag: 'off' } } }));
  });

  it('continues after a failed save only when the user explicitly chooses to skip', async () => {
    apiFetchMock.mockRejectedValue(new Error('network error'));
    const user = userEvent.setup();
    render(<ReadinessStandardsOnboardingPage />);
    await screen.findByText('Target');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('alert');
    expect(pushMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(pushMock).toHaveBeenCalledWith('/onboarding/connect-tracker?next=%2Fgenerator');
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('Skip for now moves on without saving anything', async () => {
    setLocation('?next=%2Fusage-cost');
    const user = userEvent.setup();

    render(<ReadinessStandardsOnboardingPage />);
    await screen.findByText('Target');

    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(apiFetchMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/onboarding/connect-tracker?next=%2Fusage-cost');
  });

  it('prevents saving unloaded settings but still permits skipping after a load error', async () => {
    apiGetMock.mockRejectedValue(new Error('Service unavailable'));
    const user = userEvent.setup();
    render(<ReadinessStandardsOnboardingPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Readiness standards could not be loaded.');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(apiFetchMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/onboarding/connect-tracker?next=%2Fgenerator');
  });

  it('keeps the current step and controls locked until the save finishes', async () => {
    let resolveSave!: (value: RubricSettings) => void;
    apiFetchMock.mockReturnValue(new Promise<RubricSettings>((resolve) => { resolveSave = resolve; }));
    const user = userEvent.setup();
    render(<ReadinessStandardsOnboardingPage />);
    await screen.findByText('Target');

    expect(screen.getByText('Readiness standards').closest('li')).toHaveAttribute('aria-current', 'step');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBeDisabled();
    expect(factButtons('Target').off).toBeDisabled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();

    await act(async () => resolveSave(SETTINGS));
    expect(pushMock).toHaveBeenCalledWith('/onboarding/connect-tracker?next=%2Fgenerator');
    expect(toastMock.success).toHaveBeenCalledWith('Readiness standards saved');
  });
});
