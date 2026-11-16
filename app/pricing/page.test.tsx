// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PricingPage, { metadata } from './page';

describe('Pricing & Early Access', () => {
  it('distinguishes the founder-approved agreed pilot from individual accounts', () => {
    render(<PricingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ways to try LucidSpec, built for where you are.');
    const pilot = screen.getByRole('region', { name: 'Enterprise Pilot' });
    expect(pilot).toHaveTextContent('Free during an agreed pilot');
    expect(within(pilot).getByText('Scope and duration are defined together.')).toBeInTheDocument();
    expect(within(pilot).getByRole('list')).toBeInTheDocument();
    const individual = screen.getByRole('region', { name: 'Individual Plans' });
    expect(individual).toHaveTextContent('your own readiness settings');
    expect(individual).toHaveTextContent('Billing options depend on your account and configuration.');
    expect(within(individual).queryByText(/Free|unlimited|organization-owned/i)).not.toBeInTheDocument();
    expect(individual).not.toHaveTextContent('View plans in the app');
  });

  it('uses existing contact and signup destinations without selecting a paid plan or starting checkout', () => {
    render(<PricingPage />);
    expect(screen.getByRole('link', { name: 'Discuss an Enterprise Pilot' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Request a Conversation' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toMatch(/stripe|checkout|[?&]plan=/);
    }
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('explains a scoped three-stage pilot without unlimited-use or ROI promises', () => {
    const { container } = render(<PricingPage />);
    const process = screen.getByRole('region', { name: 'How the Enterprise Pilot Works' });
    expect(within(process).getAllByRole('listitem')).toHaveLength(3);
    expect(within(process).getByText(/false positives, workflow fit/)).toBeInTheDocument();
    for (const name of ['Evidence over promises', 'Agreed pilot scope', 'Pricing after validation']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(container.textContent).not.toMatch(/\$\s*\d|unlimited|SSO|SOC 2|guaranteed ROI|no self-serve|no signup|full access|no surprise cutoff/i);
    expect(screen.queryByText('Plans are available in the app.')).not.toBeInTheDocument();
  });

  it('keeps FAQs collapsed initially and accurately distinguishes pilot card requirements from individual billing', async () => {
    const user = userEvent.setup();
    const { container } = render(<PricingPage />);
    const questions = [...container.querySelectorAll('details')];
    expect(questions).toHaveLength(5);
    expect(questions.every(details => !details.open)).toBe(true);
    await user.click(screen.getByText('Do I need a credit card?'));
    const paymentFAQ = screen.getByText('Do I need a credit card?').closest('details')!;
    expect(paymentFAQ).toHaveAttribute('open');
    expect(paymentFAQ).toHaveTextContent('No payment card is required for an agreed enterprise pilot.');
    expect(paymentFAQ).toHaveTextContent('Any paid-plan checkout may request payment details');
    await user.click(screen.getByText('Do I need a credit card?'));
    expect(paymentFAQ).not.toHaveAttribute('open');
  });

  it('qualifies tracker availability and keeps the individual signup route discoverable in FAQs', async () => {
    const user = userEvent.setup();
    render(<PricingPage />);
    await user.click(screen.getByText('Can we use our existing work trackers?'));
    const trackerFAQ = screen.getByText('Can we use our existing work trackers?').closest('details')!;
    expect(trackerFAQ).toHaveTextContent('Availability and permissions depend on setup.');
    expect(trackerFAQ).toHaveTextContent('Verify connection and delivery for your workflow before use.');
    expect(within(trackerFAQ).getByRole('link', { name: 'Explore integrations' })).toHaveAttribute('href', '/integrations');
    await user.click(screen.getByText('Can I try LucidSpec without an enterprise pilot?'));
    expect(screen.getByRole('link', { name: 'Create an individual account' })).toHaveAttribute('href', '/signup');
  });

  it('reuses one marketing footer and removes contradictory pricing metadata', () => {
    const { container } = render(<PricingPage />);
    expect(container.querySelector('#pricing-content')).toHaveAttribute('tabindex', '-1');
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(metadata.title).toBe('Pricing & Early Access — LucidSpec');
    expect(metadata.openGraph).toMatchObject({ url: '/pricing' });
    expect(JSON.stringify(metadata)).not.toMatch(/first pilots|full access|no self-serve|unlimited|\$\d/);
  });
});
