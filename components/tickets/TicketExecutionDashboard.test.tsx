import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AccordionRow, TicketExecutionDashboard } from './TicketExecutionDashboard';
import { mapTicketExecutionViewToDashboardData } from '@/lib/ticketExecutionView';

describe('TicketExecutionDashboard', () => {
  it('renders long definition of done titles without fixed-height clipping classes', () => {
    const title =
      'Validation test triggers the alarm path and confirms the Operations team receives the notification.';

    const html = renderToStaticMarkup(
      <AccordionRow
        row={{
          title,
          detail:
            'Scope: Validation test triggers the alarm path and confirms the Operations team receives the notification. Threshold: Acceptance criterion satisfied Validation: Test result recorded',
        }}
      />
    );

    expect(html).toContain(title);
    expect(html).toContain('min-h-12');
    expect(html).toContain('whitespace-normal');
    expect(html).not.toContain(' h-12 ');
  });

  it('does not render generic subtext when a definition of done row has no meaningful detail', () => {
    const html = renderToStaticMarkup(
      <AccordionRow
        defaultOpen
        row={{
          title: 'Alarm is enabled in us-east-1.',
          detail: '',
        }}
      />
    );

    expect(html).toContain('Alarm is enabled in us-east-1.');
    expect(html).not.toContain('No completion detail captured');
    expect(html).not.toContain('Acceptance criterion satisfied');
    expect(html).not.toContain('Owner validation recorded');
    expect(html).not.toContain('<p');
  });

  it('renders needs attention as grouped execution buckets', () => {
    const html = renderToStaticMarkup(
      <TicketExecutionDashboard
        data={{
          title: 'Provision Hyper-V VM',
          issueType: 'Task',
          priority: 'High',
          readinessStatus: 'BLOCKED',
          decisions: [],
          immediateActions: { title: 'Immediate Actions', items: ['Confirm host access'] },
          parallelActions: { title: 'Safe to Start in Parallel', items: ['Prepare rollback notes'] },
          needsAttention: {
            blockingNow: [
              {
                title: 'Hyper-V host or cluster access',
                description: 'Confirm the target host or cluster.',
                neededBy: 'Before start',
              },
            ],
            neededSoon: [
              {
                title: 'VM template or base image',
                description: 'Select the approved template.',
                neededBy: 'Before or during implementation',
              },
            ],
            later: [
              {
                title: 'Monitoring and reporting handoff',
                description: 'Confirm operational handoff details.',
                neededBy: 'After implementation or handoff',
              },
            ],
          },
          blockers: [],
          executionPlan: ['Confirm host access'],
          definitionOfDone: [{ title: 'VM created', detail: '' }],
          stopCondition: { if: 'host access is missing', then: 'pause provisioning', when: 'before start' },
          fullDetails: [],
        }}
      />
    );

    expect(html).toContain('Needs Attention');
    expect(html).toContain('Blocking now');
    expect(html).toContain('Needed soon');
    expect(html).toContain('Later');
    expect(html).toContain('Hyper-V host or cluster access');
    expect(html).toContain('VM template or base image');
    expect(html).toContain('Monitoring and reporting handoff');
    expect(html).not.toContain('Top Blockers');
  });

  it('displays backend execution-ready firewall state without local semantic repair', () => {
    const backendExecutionView = {
      header: {
        title: 'Create DC-West firewall rule MIG-APP-443 for TCP 443',
        issue_type: 'implementation',
        priority: 'Medium',
        status: 'Execution-ready',
      },
      decision_strip: {
        can_proceed: true,
        can_proceed_label: 'YES',
        blocked_until: 'None for current proceed scope',
        do_now:
          'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821.',
        next_decision: 'Execute during approved change window CHG-7821.',
        execution_status: 'ready',
        flow: [
          { label: 'Can we proceed', value: 'YES', tone: 'positive' },
          { label: 'Blocked until', value: 'None for current proceed scope', tone: 'neutral' },
          {
            label: 'Do now',
            value:
              'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821.',
            tone: 'neutral',
          },
          { label: 'Next decision', value: 'Execute during approved change window CHG-7821.', tone: 'neutral' },
        ],
      },
      immediate_actions: {
        must_happen_now: ['Create allow rule MIG-APP-443 during CHG-7821.'],
        safe_to_start_in_parallel: ['Prepare validation evidence capture.'],
      },
      needs_attention: {
        blocking_now: [],
        needed_soon: [],
        later: [],
      },
      top_blockers: [],
      execution_plan: [
        {
          step_number: 1,
          title: 'Create rule',
          description:
            'Create allow rule MIG-APP-443 for 10.20.10.0/24 to 10.40.5.25 on TCP 443 during CHG-7821.',
        },
        {
          step_number: 2,
          title: 'Validate',
          description: 'Validate with connectivity test and firewall logs.',
        },
      ],
      definition_of_done: [
        {
          title: 'Rule MIG-APP-443 allows 10.20.10.0/24 to 10.40.5.25 on TCP 443.',
          validation: 'Connectivity test and firewall logs confirm permitted traffic.',
        },
      ],
      stop_conditions: [
        {
          if_this_happens: 'Change window CHG-7821 is not active or validation fails.',
          then_do_this: 'Pause and roll back by removing rule MIG-APP-443.',
          when_checked: 'Before and after applying the rule.',
        },
      ],
    };
    const dashboardData = mapTicketExecutionViewToDashboardData(backendExecutionView);
    const html = renderToStaticMarkup(<TicketExecutionDashboard data={dashboardData} />);

    expect(dashboardData.readinessStatus).toBe('Execution-ready');
    expect(dashboardData.decision_summary?.can_we_proceed).toBe('YES');
    expect(dashboardData.decision_summary?.blocked_until).toBe('None for current proceed scope');
    expect(dashboardData.executionPlan).toContain(
      'Create allow rule MIG-APP-443 for 10.20.10.0/24 to 10.40.5.25 on TCP 443 during CHG-7821.'
    );
    expect(html).toContain('Create DC-West firewall rule MIG-APP-443 for TCP 443');
    expect(html).toContain('Execution-ready');
    expect(html).toContain('YES');
    expect(html).toContain('None for current proceed scope');
    expect(html).toContain('MIG-APP-443');
    expect(html).toContain('Validate with connectivity test and firewall logs.');
    expect(html).not.toContain('Invalid or Unsupported Ticket');
    expect(html).not.toContain('Not execution-ready');
    expect(html).not.toContain('Verify firewall policy access');
  });

  it('omits empty execution sections instead of rendering fabricated placeholder content', () => {
    const html = renderToStaticMarkup(
      <TicketExecutionDashboard
        data={{
          title: 'Review backup configuration',
          issueType: 'Task',
          priority: 'Low',
          readinessStatus: 'UNKNOWN',
          decisions: [],
          immediateActions: { title: 'Immediate Actions', items: [] },
          parallelActions: { title: 'Safe to Start in Parallel', items: [] },
          needsAttention: {
            blockingNow: [],
            neededSoon: [],
            later: [],
          },
          blockers: [],
          executionPlan: [],
          definitionOfDone: [],
          stopCondition: { if: 'Not available', then: 'Not available', when: 'Not available' },
          fullDetails: [],
        }}
      />
    );

    expect(html).not.toContain('Immediate Actions');
    expect(html).not.toContain('Safe to Start in Parallel');
    expect(html).not.toContain('Needs Attention');
    expect(html).not.toContain('Execution Plan');
    expect(html).not.toContain('Definition of Done');
    expect(html).not.toContain('Stop Conditions');
    expect(html).not.toContain('Full Details');
    expect(html).toContain('Review backup configuration');
  });
});
