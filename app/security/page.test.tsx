// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SecurityPage, { metadata } from './page';

describe('public security page', () => {
  it('introduces the approved security overview and four accurate approach cards', () => {
    render(<SecurityPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building trust into every workflow.');
    const approach = screen.getByRole('region', { name: 'Our security approach' });
    expect(within(approach).getAllByRole('article')).toHaveLength(4);
    for (const name of ['Account access', 'Data handling', 'Integration configuration', 'AI-assisted assessment']) {
      expect(within(approach).getByRole('article', { name })).toBeInTheDocument();
    }
    expect(within(approach).getByText(/email and password sign-in through Supabase/)).toBeInTheDocument();
    expect(within(approach).getByText(/Review findings and generated work before acting/)).toBeInTheDocument();
  });

  it('discloses stored readiness records, third-party AI processing, and external tool requests', () => {
    render(<SecurityPage />);
    const overview = screen.getByRole('region', { name: 'Data and access at a glance' });
    expect(within(overview).getByText(/Account settings, saved work, and readiness-check records may be stored/)).toBeInTheDocument();
    expect(within(overview).getByText(/third-party model providers, including OpenAI/)).toBeInTheDocument();
    expect(within(overview).getByText(/Connection tests query the selected tool/)).toHaveTextContent('Sending a ticket transfers prepared work information to the configured destination.');
    expect(within(overview).getByText(/For deployment-specific controls, retention, and provider data terms/)).toBeInTheDocument();
    expect(within(overview).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(within(overview).getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
  });

  it('presents conceptual data flow and user-initiated handoff without implying execution authorization', () => {
    render(<SecurityPage />);
    const flow = screen.getByRole('region', { name: 'How your data flows' });
    expect(within(flow).getByText('A conceptual view of the web work-request workflow.')).toBeInTheDocument();
    expect(within(flow).getAllByRole('listitem')).toHaveLength(3);
    expect(within(flow).getByRole('heading', { name: 'Your input' })).toBeInTheDocument();
    expect(within(flow).getByRole('heading', { name: 'LucidSpec' })).toBeInTheDocument();
    expect(within(flow).getByRole('heading', { name: 'Optional tracker' })).toBeInTheDocument();
    expect(within(flow).getByText(/when you choose Send to tracker in the web app/)).toBeInTheDocument();
    expect(within(flow).getByText(/A readiness result does not grant permission to execute work/)).toBeInTheDocument();
    expect(within(flow).queryByRole('button')).not.toBeInTheDocument();
    expect(within(flow).queryByRole('status')).not.toBeInTheDocument();
  });

  it('removes unsupported guarantees and presents hardening as an engineering priority', () => {
    const { container } = render(<SecurityPage />);
    expect(container.textContent).not.toMatch(/SOC\s*2|ISO\s*27001|HIPAA|GDPR.certif|fully secure|enterprise-grade protection|secure by design|least.privilege|encrypted at rest|no model training|isn’t used to train|never returned|nothing runs in the background|every claim is grounded|Most checks leave no record/i);
    const transparency = screen.getByRole('region', { name: 'Trust through transparency' });
    expect(within(transparency).getByText(/Continued security review and hardening remain engineering priorities/)).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /Illustration of account access/ })).toBeInTheDocument();
  });

  it('preserves the security URL, metadata fields, shared footer, and working contact destination', () => {
    render(<SecurityPage />);
    expect(screen.getByRole('link', { name: 'Talk to Our Team' })).toHaveAttribute('href', '/contact');
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(document.getElementById('security-content')).toHaveAttribute('tabindex', '-1');
    expect(metadata.title).toBe('Security — LucidSpec');
    expect(metadata.openGraph).toMatchObject({ title: 'Security — LucidSpec', url: '/security', images: [{ url: '/opengraph-image' }] });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', images: ['/twitter-image'] });
    expect(metadata.description).toBe('Learn how LucidSpec approaches data handling, account access, AI-assisted processing, and connections to your engineering tools.');
  });
});
