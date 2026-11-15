// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import FeaturesPage, { metadata } from './page';

describe('public features page', () => {
  it('presents an illustrative product preview and a working example-findings anchor', () => {
    render(<FeaturesPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('From rough requests to clearer engineering handoffs.');
    const preview = screen.getByRole('figure', { name: 'Illustrative product view. Findings shown are examples, not a live assessment.' });
    expect(within(preview).getByText('Production service update')).toBeInTheDocument();
    expect(within(preview).getByText('Needs clarification')).toBeInTheDocument();
    expect(within(preview).getByText('Rollback procedure unresolved')).toBeInTheDocument();
    expect(within(preview).getByRole('link', { name: 'Review example findings' })).toHaveAttribute('href', '#find-and-resolve-gaps');
    expect(screen.getByRole('region', { name: 'Turn a rough request into actionable work.' })).toHaveAttribute('id', 'find-and-resolve-gaps');
    expect(within(preview).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(preview).queryByRole('button')).not.toBeInTheDocument();
    expect(within(preview).queryByRole('status')).not.toBeInTheDocument();
  });

  it('explains four stages and illustrates account-scoped treatments without fake settings controls', () => {
    render(<FeaturesPage />);
    const workflow = screen.getByRole('region', { name: 'A clearer path from request to handoff' });
    expect(within(workflow).getAllByRole('listitem')).toHaveLength(4);
    for (const name of ['Define readiness', 'Assess work', 'Resolve gaps', 'Prepare handoff']) expect(within(workflow).getByRole('heading', { name })).toBeInTheDocument();
    const standards = screen.getByRole('region', { name: 'Your standards, your workflow.' });
    expect(within(standards).getByText('Configure Off, Advisory, and Blocking for checks in your account.')).toBeInTheDocument();
    expect(within(standards).getByRole('link', { name: 'View readiness settings' })).toHaveAttribute('href', '/account/checklist');
    expect(within(standards).getByRole('link', { name: 'View ticket examples' })).toHaveAttribute('href', '/account/ticket-style');
    const preview = within(standards).getByRole('figure', { name: 'Illustrative configuration. Example selections only.' });
    const table = within(preview).getByRole('table', { name: 'Example readiness treatments' });
    for (const [name, severity] of [['Target system', 'Blocking'], ['Validation approach', 'Advisory'], ['Rollback plan', 'Off']]) {
      expect(within(table).getByRole('row', { name: `${name} ${severity}` })).toBeInTheDocument();
    }
    expect(within(preview).queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(preview).queryByRole('button')).not.toBeInTheDocument();
    expect(within(preview).getByText('Treats missing information as blocking in the assessment.')).toBeInTheDocument();
  });

  it('keeps findings qualified and shows a rough request with unresolved gaps rather than a fabricated ready outcome', () => {
    render(<FeaturesPage />);
    const gap = screen.getByRole('region', { name: 'Turn a rough request into actionable work.' });
    expect(within(gap).getByText(/review the findings before acting/)).toBeInTheDocument();
    const example = within(gap).getByRole('figure', { name: 'Illustrative assessment. No customer data is shown.' });
    expect(within(example).getByRole('blockquote')).toHaveTextContent('Deploy the latest version of our payment service to production. Testing is complete.');
    expect(within(example).getByText('Validation approach needs detail')).toBeInTheDocument();
    expect(within(example).getByText('Rollback procedure unresolved')).toBeInTheDocument();
    expect(within(example).queryByText(/^Ready$/)).not.toBeInTheDocument();
    const capabilities = screen.getByRole('region', { name: 'Four core capabilities' });
    expect(within(capabilities).getAllByRole('article')).toHaveLength(4);
    expect(within(capabilities).getByText(/supporting request text where available/)).toBeInTheDocument();
    expect(within(capabilities).getByRole('heading', { name: 'Account-specific rules' })).toBeInTheDocument();
    expect(within(capabilities).getByText(/where configured and authorized/)).toBeInTheDocument();
  });

  it('preserves the additional supported features in native disclosures and links to existing destinations', async () => {
    render(<FeaturesPage />);
    const user = userEvent.setup();
    const additional = screen.getByRole('region', { name: 'More of the workflow, covered.' });
    for (const name of ['Plain-language intake and built-in checks', 'Ticket examples and suggested standards', 'AI-authored change checks', 'Post-generation review', 'Configured tracker handoff', 'Input handling and privacy']) {
      const summary = within(additional).getByText(name);
      const details = summary.closest('details');
      expect(details).not.toHaveAttribute('open');
      await user.click(summary);
      expect(details).toHaveAttribute('open');
    }
    expect(within(additional).getByText(/Suggested standards are created inactive for review before activation/)).toBeVisible();
    expect(within(additional).getByText(/When AI-authored work is identified/)).toHaveTextContent('subject to its configured severity.');
    expect(within(additional).getByText(/acceptance-criteria gaps and applicable ticket-type standards/)).toBeVisible();
    expect(within(additional).getByText(/masking of some recognizable sensitive patterns/)).toBeVisible();
    for (const [name, href] of [['View ticket examples', '/account/ticket-style'], ['Explore integrations', '/integrations'], ['Read the security overview', '/security']]) {
      expect(within(additional).getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('retains public metadata and demo links while removing unsupported guarantees', () => {
    const { container } = render(<FeaturesPage />);
    expect(screen.getByRole('link', { name: 'Request a Demo' })).toHaveAttribute('href', '/contact');
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(document.getElementById('features-content')).toHaveAttribute('tabindex', '-1');
    expect(container.textContent).not.toMatch(/Every claim is grounded|every flag grounded|nothing invented|only moved downstream|every finished ticket goes straight|Safe and controlled by default|every time, not just on request|organization-wide shared/i);
    expect(metadata.title).toBe('Features — LucidSpec');
    expect(metadata.openGraph).toMatchObject({ title: 'Features — LucidSpec', url: '/features', images: [{ url: '/opengraph-image' }] });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', images: ['/twitter-image'] });
    expect(metadata.description).toContain('From rough requests to clearer engineering handoffs.');
  });
});
