// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HomeContent from '@/components/HomeContent';
import { MarketingHeader } from './MarketingHeader';
import { metadata } from '@/app/page';

describe('marketing homepage', () => {
  it('explains readiness and links demo calls to action to the existing contact page', () => {
    render(<HomeContent />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Catch what's missing before it reaches engineering.");
    screen.getAllByRole('link', { name: 'Request a Demo' }).forEach(link => expect(link).toHaveAttribute('href', '/contact'));
    expect(screen.getByRole('link', { name: 'See How It Works' })).toHaveAttribute('href', '#how-it-works');
    expect(screen.getByRole('region', { name: 'How LucidSpec works' })).toHaveAttribute('id', 'how-it-works');
    expect(screen.getByRole('heading', { name: 'Make work ready before execution begins.' })).toBeInTheDocument();
  });

  it('labels the product view as an example and does not expose pretend assessment controls', () => {
    render(<HomeContent />);
    const preview = screen.getByRole('figure', { name: /not a live assessment/ });
    expect(within(preview).getByText('Illustrative example')).toBeInTheDocument();
    expect(within(preview).getByText('Needs clarification')).toBeInTheDocument();
    expect(within(preview).getByText('Deployment procedure unspecified')).toBeInTheDocument();
    expect(within(preview).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(preview).queryByRole('button')).not.toBeInTheDocument();
    expect(within(preview).queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText(/Readiness depends on the information supplied/)).toBeInTheDocument();
  });

  it('distinguishes configurable connections from planned handoffs without security or certification promises', () => {
    render(<HomeContent />);
    const integrations = screen.getByRole('region', { name: 'Integrations' });
    expect(within(integrations).getAllByText('Configurable')).toHaveLength(3);
    ['Jira', 'ServiceNow', 'Linear'].forEach(name => expect(within(integrations).getByRole('heading', { name })).toBeInTheDocument());
    expect(within(integrations).getByText('Planned: GitHub Action')).toBeInTheDocument();
    expect(within(integrations).getByText('Planned: AI coding agent handoff')).toBeInTheDocument();
    expect(within(integrations).getByRole('link', { name: 'Explore integrations' })).toHaveAttribute('href', '/integrations');
    expect(screen.queryByText(/SOC 2|ISO 27001|tenant isolation|NVIDIA|encrypted at rest/i)).not.toBeInTheDocument();
  });

  it('preserves secondary public URLs and existing homepage metadata', () => {
    render(<HomeContent />);
    const company = screen.getByRole('navigation', { name: 'Company footer links' });
    expect(within(company).getByRole('link', { name: 'Founder Story' })).toHaveAttribute('href', '/founder');
    expect(within(company).getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(metadata.title).toBe('LucidSpec — Execution Readiness For Technical Delivery');
    expect(metadata.openGraph).toMatchObject({ url: '/' });
  });
});

describe('homepage navigation', () => {
  it('keeps existing sign-in behavior and working marketing destinations', async () => {
    const signIn = vi.fn();
    render(<MarketingHeader signedIn={false} onSignIn={signIn} onSignOut={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Sign in' })[0]);
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('link', { name: 'Request a Demo' })[0]).toHaveAttribute('href', '/contact');
    const main = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(main).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/founder');
    expect(within(main).getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/security');
  });

  it('opens and closes the mobile menu and restores keyboard focus on Escape', async () => {
    render(<MarketingHeader signedIn={false} onSignIn={vi.fn()} onSignOut={vi.fn()} />);
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const mobile = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(within(mobile).getByRole('link', { name: 'Product overview' })).toHaveAttribute('href', '/features');
    await user.keyboard('{Escape}');
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  });

  it('makes Product disclosures keyboard accessible and closes them on Escape', async () => {
    render(<MarketingHeader signedIn={false} onSignIn={vi.fn()} onSignOut={vi.fn()} />);
    const user = userEvent.setup();
    const product = screen.getByText('Product');
    await user.click(product);
    expect(product.closest('details')).toHaveAttribute('open');
    await user.keyboard('{Escape}');
    expect(product.closest('details')).not.toHaveAttribute('open');
    expect(product).toHaveFocus();
  });

  it('preserves application access and the original sign-out callback for signed-in visitors', async () => {
    const signOut = vi.fn();
    render(<MarketingHeader signedIn onSignIn={vi.fn()} onSignOut={signOut} />);
    expect(screen.getAllByRole('link', { name: 'Work Requests' })[0]).toHaveAttribute('href', '/generator');
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Sign out' })[0]);
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
