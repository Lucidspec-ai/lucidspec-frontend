// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IntegrationsPage, { metadata } from './page';

describe('public integrations page', () => {
  it('explains the upstream workflow with an explicitly illustrative assessment', () => {
    render(<IntegrationsPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Keep your tools. Improve what goes into them.');
    const workflow = screen.getByRole('figure', { name: 'Illustrative workflow · Not a live assessment' });
    for (const text of ['Rough work request', 'Readiness assessment', 'Your work tracker', 'Needs clarification', 'Target system identified', 'Deployment procedure unspecified', 'Validation approach needs clarification']) {
      expect(within(workflow).getByText(text)).toBeInTheDocument();
    }
    expect(within(workflow).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(workflow).queryByRole('button')).not.toBeInTheDocument();
    expect(within(workflow).queryByRole('status')).not.toBeInTheDocument();
  });

  it('limits provider claims to approved configuration availability and existing setup links', () => {
    render(<IntegrationsPage />);
    const supported = screen.getByRole('region', { name: 'Supported integrations' });
    expect(within(supported).getAllByRole('article')).toHaveLength(3);
    for (const provider of ['Jira', 'ServiceNow', 'Linear']) {
      const card = within(supported).getByRole('article', { name: provider });
      expect(within(card).getByText('Configuration available')).toBeInTheDocument();
      expect(within(card).getByRole('link', { name: `Configure ${provider}` })).toHaveAttribute('href', '/account/integrations');
    }
    expect(screen.queryByText(/^Live$|fully verified|guaranteed|tenant.isolated|server.enforced/i)).not.toBeInTheDocument();
  });

  it('explains user review and permissions without presenting roadmap capabilities as available', () => {
    render(<IntegrationsPage />);
    const steps = screen.getByRole('region', { name: 'From request to handoff' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3);
    expect(within(steps).getByText(/where supported and authorized/)).toBeInTheDocument();
    const roadmap = screen.getByRole('region', { name: 'On the roadmap' });
    for (const name of ['GitHub Actions', 'AI coding agents']) {
      const card = within(roadmap).getByRole('article', { name });
      expect(within(card).getByText('Planned')).toBeInTheDocument();
      expect(within(card).queryByRole('link')).not.toBeInTheDocument();
      expect(within(card).queryByRole('button')).not.toBeInTheDocument();
    }
    expect(screen.getByText(/Integration availability and permissions depend on configuration/)).toHaveTextContent('A configured connection does not grant authorization to execute work.');
  });

  it('preserves the public URL, contact destination, metadata, and shared footer', () => {
    render(<IntegrationsPage />);
    expect(screen.getByRole('link', { name: 'Discuss Your Workflow' })).toHaveAttribute('href', '/contact');
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Founder Story' })).toHaveAttribute('href', '/founder');
    expect(document.getElementById('integrations-content')).toHaveAttribute('tabindex', '-1');
    expect(metadata.title).toBe('Integrations — LucidSpec');
    expect(metadata.openGraph).toMatchObject({ url: '/integrations' });
    expect(metadata.description).toContain('configurable Jira, ServiceNow, and Linear connections');
    expect(metadata.description).not.toMatch(/dispatch straight|fully verified/i);
  });
});
