// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  signInWithPassword: vi.fn(),
  safeGetSession: vi.fn(),
  unsubscribe: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router,
  useSearchParams: () => new URLSearchParams('next=%2Fusage-cost'),
}));
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: {
    signInWithPassword: mocks.signInWithPassword,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: mocks.unsubscribe } } }),
  } },
}));
vi.mock('@/lib/safeSession', () => ({ safeGetSession: mocks.safeGetSession }));
vi.mock('@/lib/toast', () => ({ toast: { success: mocks.success, error: mocks.error } }));

import SignInPage from './page';

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), 'demo@example.com');
  await user.type(screen.getByLabelText('Password'), 'example-password');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.safeGetSession.mockResolvedValue({ data: { session: null } });
  });

  it('preserves password signin and the requested destination', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    render(<SignInPage />);
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/signup?next=%2Fusage-cost');
    await fillAndSubmit();

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'demo@example.com', password: 'example-password' });
    expect(mocks.router.replace).toHaveBeenCalledWith('/usage-cost');
  });

  it('announces a signin error without a success message or navigation', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    render(<SignInPage />);
    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid login credentials');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it('preserves the redirect for an existing session', async () => {
    mocks.safeGetSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    render(<SignInPage />);
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/usage-cost'));
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });
});
