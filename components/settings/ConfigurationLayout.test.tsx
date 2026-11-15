// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/account/checklist',
  router: { push: vi.fn(), refresh: vi.fn() },
  signOut: vi.fn(),
}));
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname, useRouter: () => mocks.router }));
vi.mock('@/lib/safeSession', () => ({ safeGetSession: async () => ({ data: { session: { user: { email: 'demo@example.com' } } } }) }));
vi.mock('@/lib/supabase', () => ({ supabase: { auth: {
  signOut: mocks.signOut,
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
} } }));
vi.mock('@/components/AdminLink', () => ({ default: () => null }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), info: vi.fn() } }));

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountLayout from '@/app/account/layout';
import FounderStoryPage from '@/app/founder/page';
import IntegrationsPage from '@/app/integrations/page';
import SecurityPage from '@/app/security/page';
import FeaturesPage from '@/app/features/page';

describe('configuration page navigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(['/account', '/account/ticket-style', '/account/integrations', '/onboarding/readiness-standards', '/onboarding/connect-tracker'])(
    'shows application navigation and hides marketing content on %s', async (pathname) => {
      mocks.pathname = pathname;
      render(<><Navbar /><Footer /></>);
      const nav = screen.getByRole('navigation', { name: 'Application' });
      expect(within(nav).getByRole('link', { name: 'Work Requests' })).toHaveAttribute('href', '/generator');
      expect(within(nav).getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/account');
      expect(screen.queryByRole('link', { name: 'Features' })).not.toBeInTheDocument();
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
      await screen.findByRole('button', { name: 'Sign out' });
    }
  );

  it.each(['/signin', '/signup', '/accounting', '/onboarding-guide'])(
    'preserves public navigation and footer on %s', async (pathname) => {
      mocks.pathname = pathname;
      render(<><Navbar /><Footer /></>);
      expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '/features');
      expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
      expect(screen.queryByRole('navigation', { name: 'Application' })).not.toBeInTheDocument();
      await screen.findByRole('button', { name: 'Sign out' });
    }
  );

  it('uses the reference sidebar and personal account header only on the readiness route', async () => {
    mocks.pathname = '/account/checklist';
    render(<><Navbar /><AccountLayout><h1>Readiness Standards</h1></AccountLayout><Footer /></>);
    expect(await screen.findByRole('link', { name: 'Your account settings' })).toHaveAttribute('href', '/account');
    expect(await screen.findByText('Personal account')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(nav).getByRole('link', { name: 'Readiness Standards' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Ticket Examples' })).toHaveAttribute('href', '/account/ticket-style');
    expect(screen.getByText('Application menu')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Features' })).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('marks the active settings page and links directly to existing custom rules', () => {
    mocks.pathname = '/account/ticket-style';
    render(<AccountLayout><h1>Ticket standards</h1></AccountLayout>);
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(nav).getByRole('link', { name: 'Ticket Standards' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Readiness Standards' })).not.toHaveAttribute('aria-current');
    expect(within(nav).getByRole('link', { name: 'Custom Rules' })).toHaveAttribute('href', '/account/checklist#custom-rules');
    expect(screen.getByRole('heading', { name: 'Ticket standards' })).toBeInTheDocument();
  });

  it('uses the existing sign-out handler from the application header', async () => {
    mocks.pathname = '/account/checklist';
    mocks.signOut.mockResolvedValue({ error: null });
    render(<Navbar />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    expect(mocks.router.push).toHaveBeenCalledWith('/');
    expect(mocks.router.refresh).toHaveBeenCalled();
  });

  it.each([
    { pathname: '/founder', Page: FounderStoryPage, activeLink: 'About', target: '#founder-content' },
    { pathname: '/integrations', Page: IntegrationsPage, activeLink: 'Integrations', target: '#integrations-content' },
    { pathname: '/security', Page: SecurityPage, activeLink: 'Security', target: '#security-content' },
    { pathname: '/features', Page: FeaturesPage, activeLink: 'Features', target: '#features-content' },
  ])('reuses homepage navigation and a single footer on $pathname', async ({ pathname, Page, activeLink, target }) => {
    mocks.pathname = pathname;
    render(<><Navbar /><Page /><Footer /></>);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getByRole('link', { name: activeLink })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', target);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    await screen.findByRole('button', { name: 'Sign out' });
  });
});
