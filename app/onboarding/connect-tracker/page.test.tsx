// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const safeGetSessionMock = vi.fn();
vi.mock('@/lib/safeSession', () => ({
  safeGetSession: (...args: unknown[]) => safeGetSessionMock(...args),
}));

import ConnectTrackerOnboardingPage from './page';

function setLocation(search: string) {
  window.history.pushState({}, '', `/onboarding/connect-tracker${search}`);
}

describe('ConnectTrackerOnboardingPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    safeGetSessionMock.mockReset();
    safeGetSessionMock.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    setLocation('');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    safeGetSessionMock.mockResolvedValue({ data: { session: null } });

    render(<ConnectTrackerOnboardingPage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/signin')));
  });

  it('sends "Connect your tracker" to the settings page with next preserved', async () => {
    setLocation('?next=%2Fusage-cost');
    const user = userEvent.setup();

    render(<ConnectTrackerOnboardingPage />);
    const connectButton = await screen.findByRole('button', { name: 'Connect your tracker' });

    await user.click(connectButton);

    expect(pushMock).toHaveBeenCalledWith('/account/integrations?next=%2Fusage-cost');
  });

  it('sends "Skip for now" straight to next', async () => {
    setLocation('?next=%2Fusage-cost');
    const user = userEvent.setup();

    render(<ConnectTrackerOnboardingPage />);
    await screen.findByText('Skip for now');

    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(pushMock).toHaveBeenCalledWith('/usage-cost');
  });

  it('defaults next to /generator when absent', async () => {
    const user = userEvent.setup();

    render(<ConnectTrackerOnboardingPage />);
    await screen.findByText('Skip for now');

    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(pushMock).toHaveBeenCalledWith('/generator');
  });
});
