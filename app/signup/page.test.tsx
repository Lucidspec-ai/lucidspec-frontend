// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  signUp: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams('next=%2Fusage-cost'),
}));
vi.mock('@/lib/supabase', () => ({ supabase: { auth: { signUp: mocks.signUp } } }));
vi.mock('@/lib/toast', () => ({ toast: { success: mocks.success, error: mocks.error } }));

import SignUpPage from './page';

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), 'demo@example.com');
  await user.type(screen.getByLabelText('Password'), 'example-password');
  await user.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('SignUpPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows email confirmation without claiming an authenticated session or navigating', async () => {
    mocks.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    render(<SignUpPage />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin?next=%2Fusage-cost');
    await fillAndSubmit();

    expect(screen.getByRole('status')).toHaveTextContent('Check your email for a confirmation link');
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalledWith('Account created');
  });

  it('shows pending state, then preserves the existing signup payload and onboarding destination', async () => {
    let resolveSignup!: (value: unknown) => void;
    mocks.signUp.mockReturnValue(new Promise((resolve) => { resolveSignup = resolve; }));
    render(<SignUpPage />);
    await fillAndSubmit();

    expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'demo@example.com',
      password: 'example-password',
      options: { emailRedirectTo: `${window.location.origin}/onboarding/readiness-standards?next=%2Fusage-cost` },
    });

    await act(async () => resolveSignup({ data: { user: { identities: [{}] }, session: { access_token: 'tok' } }, error: null }));
    expect(mocks.replace).toHaveBeenCalledWith('/onboarding/readiness-standards?next=%2Fusage-cost');
  });

  it('announces API errors and permits another attempt', async () => {
    mocks.signUp.mockResolvedValue({ data: null, error: { message: 'Signup unavailable' } });
    render(<SignUpPage />);
    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('Signup unavailable');
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('preserves the existing duplicate-account response', async () => {
    mocks.signUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null });
    render(<SignUpPage />);
    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('An account with this email already exists. Please sign in.');
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
