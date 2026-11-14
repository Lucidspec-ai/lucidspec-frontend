import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LeanTicketCard } from './LeanTicketCard';
import type { TicketAcCheckResponse, TicketDetailResponse, TicketDispatchResult } from '@/lib/apiTypes';

const ticket: TicketDetailResponse = {
  id: 't1',
  title: 'Fix duplicate charge bug in billing-api',
  description: 'Duplicate charges occur on retry in the checkout handler.',
  ticket_type: 'Bug Fix',
  acceptance_criteria: 'No duplicate charges appear in checkout logs after deploy.',
  technical_summary: 'Guard the retry-count check in the checkout handler.',
  dependencies: 'None stated.',
  assumptions: 'Schema migration already landed.',
  expected_outcome: 'Checkout no longer double-charges on retry.',
};

describe('LeanTicketCard', () => {
  it('renders all 8 fields', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} />);

    expect(html).toContain(ticket.title);
    expect(html).toContain(ticket.ticket_type);
    expect(html).toContain(ticket.description);
    expect(html).toContain(ticket.acceptance_criteria);
    expect(html).toContain(ticket.technical_summary);
    expect(html).toContain(ticket.dependencies);
    expect(html).toContain(ticket.assumptions);
    expect(html).toContain(ticket.expected_outcome);
  });

  it('does not render a Send to tracker button without the callback prop', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} />);
    expect(html).not.toContain('Send to tracker');
  });

  it('renders a Send to tracker button when the callback prop is provided', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} onSendToTracker={() => {}} />);
    expect(html).toContain('Send to tracker');
  });

  it('shows a success message with a link on a created result', () => {
    const result: TicketDispatchResult = {
      status: 'created',
      provider: 'linear',
      external_key: 'ENG-42',
      external_url: 'https://linear.app/x/ENG-42',
    };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onSendToTracker={() => {}} dispatchResult={result} />
    );
    expect(html).toContain('Sent to Linear');
    expect(html).toContain('ENG-42');
    expect(html).toContain('https://linear.app/x/ENG-42');
  });

  it('shows an informational message on a skipped result', () => {
    const result: TicketDispatchResult = { status: 'skipped', error: 'ticketing_not_configured' };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onSendToTracker={() => {}} dispatchResult={result} />
    );
    expect(html).toContain('configured yet for this workspace');
  });

  it('shows an error message on a failed result', () => {
    const result: TicketDispatchResult = { status: 'failed', error: 'boom' };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onSendToTracker={() => {}} dispatchResult={result} />
    );
    expect(html).toContain('send this to the tracker');
  });

  it('renders fields as read-only text without onTicketChange', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} />);
    expect(html).not.toContain('<textarea');
  });

  it('renders editable textareas and structured-field selects when onTicketChange is provided', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} onTicketChange={() => {}} />);
    expect(html).toContain('<textarea');
    expect(html).toContain(ticket.description);
    expect(html).toContain('Environment');
    expect(html).toContain('Planning period');
    expect(html).toContain('Change type');
  });

  it('does not render a Check acceptance criteria button without the callback prop', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} />);
    expect(html).not.toContain('Check acceptance criteria');
  });

  it('renders acceptance-criteria coverage gaps and consistency flags', () => {
    const acResult: TicketAcCheckResponse = {
      coverage_gaps: [
        {
          category: 'error_handling',
          label: 'Error handling',
          suggested_criterion: 'Verify an invalid CUSIP returns a clear error message.',
        },
      ],
      consistency_flags: [{ issue: 'AC references staging but the ticket environment is Production.' }],
      standards_gaps: [],
    };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onCheckAcceptanceCriteria={() => {}} acCheckResult={acResult} />
    );
    expect(html).toContain('Check acceptance criteria');
    expect(html).toContain('Verify an invalid CUSIP returns a clear error message.');
    expect(html).toContain('AC references staging but the ticket environment is Production.');
  });

  it('shows a clean message when the acceptance-criteria check finds nothing', () => {
    const acResult: TicketAcCheckResponse = { coverage_gaps: [], consistency_flags: [], standards_gaps: [] };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onCheckAcceptanceCriteria={() => {}} acCheckResult={acResult} />
    );
    expect(html).toContain('No coverage gaps or contradictions found.');
  });

  it('renders unmet ticket standards from standards_gaps', () => {
    const acResult: TicketAcCheckResponse = {
      coverage_gaps: [],
      consistency_flags: [],
      standards_gaps: [
        {
          key: 'custom_rule_5f47ac10-58cc-4372-a567-0e02b2c3d479',
          label: 'Repro steps required',
          question: 'Does it include repro steps?',
          consequence: '"Repro steps required" is not satisfied.',
          severity: 'blocking',
          present: false,
          uncertain: false,
          source: 'custom_rule',
          evaluated: true,
        },
      ],
    };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onCheckAcceptanceCriteria={() => {}} acCheckResult={acResult} />
    );
    expect(html).toContain('Ticket standards not yet met');
    expect(html).toContain('Repro steps required');
    expect(html).toContain('&quot;Repro steps required&quot; is not satisfied.');
  });

  it('does not show a satisfied (present) standard as a gap', () => {
    const acResult: TicketAcCheckResponse = {
      coverage_gaps: [],
      consistency_flags: [],
      standards_gaps: [
        {
          key: 'custom_rule_5f47ac10-58cc-4372-a567-0e02b2c3d479',
          label: 'Repro steps required',
          question: 'Does it include repro steps?',
          consequence: 'not satisfied',
          severity: 'blocking',
          present: true,
          uncertain: false,
          source: 'custom_rule',
          evaluated: true,
        },
      ],
    };
    const html = renderToStaticMarkup(
      <LeanTicketCard ticket={ticket} onCheckAcceptanceCriteria={() => {}} acCheckResult={acResult} />
    );
    expect(html).not.toContain('Ticket standards not yet met');
    expect(html).toContain('No coverage gaps or contradictions found.');
  });

  it('labels the dispatch button with the connected provider', () => {
    const html = renderToStaticMarkup(
      <LeanTicketCard
        ticket={ticket}
        onSendToTracker={() => {}}
        connectionStatus={{ configured: true, provider: 'jira', has_credentials: true }}
      />
    );
    expect(html).toContain('Send to Jira');
    expect(html).not.toContain('Not connected to a tracker yet');
  });

  it('shows a connect hint when nothing is configured yet', () => {
    const html = renderToStaticMarkup(
      <LeanTicketCard
        ticket={ticket}
        onSendToTracker={() => {}}
        connectionStatus={{ configured: false, has_credentials: false }}
      />
    );
    expect(html).toContain('Not connected to a tracker yet');
    expect(html).toContain('/account/integrations');
    expect(html).toContain('Send to tracker');
  });

  it('does not show a connect hint while connection status is still unknown', () => {
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticket} onSendToTracker={() => {}} />);
    expect(html).not.toContain('Not connected to a tracker yet');
    expect(html).toContain('Send to tracker');
  });

  it('renders fine when the ticket carries custom_rule_results', () => {
    // Regression guard: FIELDS was once typed keyof TicketDetailResponse,
    // which silently widened to include custom_rule_results (an object) in
    // the plain-text rendering loop -- confirms that can't happen again.
    const ticketWithCustomRules: TicketDetailResponse = {
      ...ticket,
      custom_rule_results: { custom_rule_abc: 'handles 500 concurrent users' },
    };
    const html = renderToStaticMarkup(<LeanTicketCard ticket={ticketWithCustomRules} />);
    expect(html).not.toContain('[object Object]');
    expect(html).toContain(ticket.title);
  });
});
