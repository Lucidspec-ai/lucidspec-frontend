import { describe, expect, it } from 'vitest';

import { mapTicketExecutionViewToDashboardData } from './ticketExecutionView';

describe('ticket execution view mapping', () => {
  it('maps backend execution view fields without CloudTrail mock data', () => {
    const data = mapTicketExecutionViewToDashboardData({
      header: {
        title: 'Expand NetApp volume',
        issue_type: 'Task',
        priority: 'High',
        status: 'READY',
      },
      decision_strip: {
        can_proceed: true,
        can_proceed_label: 'YES',
        blocked_until: 'No blocker.',
        do_now: 'Expand volume vol_finance_01',
        next_decision: 'None',
        flow: [
          { label: 'Can we proceed', value: 'YES', tone: 'positive' },
          { label: 'Blocked until', value: 'No blocker.', tone: 'neutral' },
        ],
      },
      immediate_actions: {
        must_happen_now: ['Confirm snapshot exists before expansion'],
        safe_to_start_in_parallel: ['Notify storage owner'],
      },
      needs_attention: {
        blocking_now: [],
        needed_soon: [
          {
            title: 'Snapshot owner confirmation',
            description: 'Confirm who owns the pre-change snapshot.',
            needed_by: 'Before or during implementation',
          },
        ],
        later: [
          {
            title: 'Storage handoff',
            description: 'Document final storage owner handoff.',
            needed_by: 'After implementation or handoff',
          },
        ],
      },
      top_blockers: [],
      execution_plan: [
        { step_number: 1, title: 'Validate capacity', description: 'Check current utilization' },
      ],
      definition_of_done: [
        {
          title: 'Volume expanded',
          scope: 'vol_finance_01',
          threshold: '2 TB available',
          validation: 'Storage console confirms new size',
        },
      ],
      stop_conditions: [
        {
          if_this_happens: 'Snapshot validation fails',
          then_do_this: 'Stop expansion',
          when_checked: 'Before resize',
        },
      ],
    });

    const rendered = JSON.stringify(data);
    expect(data.title).toBe('Expand NetApp volume');
    expect(data.decision_summary?.blocked_until).toBe('No blockers identified');
    expect(data.flow.find((item) => item.label === 'Blocked until')?.value).toBe('No blockers identified');
    expect(data.executionPlan).toEqual(['Check current utilization']);
    expect(data.blockers).toEqual([
      {
        title: 'No blockers identified',
        description:
          'No blocking dependency was identified from the provided ticket details. Verify access, dependencies, approvals, and required configuration before starting.',
        neededBy: 'Not applicable',
      },
    ]);
    expect(data.needsAttention).toEqual({
      blockingNow: [],
      neededSoon: [
        {
          title: 'Snapshot owner confirmation',
          description: 'Confirm who owns the pre-change snapshot.',
          neededBy: 'Before or during implementation',
        },
      ],
      later: [
        {
          title: 'Storage handoff',
          description: 'Document final storage owner handoff.',
          neededBy: 'After implementation or handoff',
        },
      ],
    });
    expect(data.immediateActions.items).toContain('Confirm snapshot exists before expansion');
    expect(rendered).not.toContain('CloudTrail');
    expect(rendered).not.toContain('Revoke compromised key');
    expect(rendered).not.toContain('logging.company.internal');
    expect(rendered).not.toContain('Backend did not return');
    expect(rendered).not.toContain('No blocker captured');
  });

  it('maps backend stop condition arrays and skips placeholder rows', () => {
    const data = mapTicketExecutionViewToDashboardData({
      header: {
        title: 'Needs execution details',
        issue_type: 'Story',
        priority: 'Medium',
        status: 'BLOCKED',
      },
      decision_strip: {
        can_proceed: false,
        can_proceed_label: 'NO',
        blocked_until: 'Confirm RBAC or provisioning permissions before implementation starts.',
        do_now: 'Confirm RBAC or provisioning permissions.',
        next_decision: 'Confirm vCenter and ESXi host capacity.',
      },
      stop_conditions: [
        {
          if_this_happens: 'If Stop condition not captured,',
          then_do_this: 'Not captured',
          when_checked: 'Not captured',
        },
        {
          if_this_happens:
            'Stop if vCenter/datacenter target, ESXi host capacity, datastore/storage policy, vDS/VLAN, port groups, or RBAC are missing',
          then_do_this: 'pause the cluster build and escalate to the infrastructure owner',
          when_checked: 'Before execution starts',
        },
      ],
    });

    expect(data.stopCondition).toEqual({
      if:
        'Stop if vCenter/datacenter target, ESXi host capacity, datastore/storage policy, vDS/VLAN, port groups, or RBAC are missing',
      then: 'pause the cluster build and escalate to the infrastructure owner',
      when: 'Before execution starts',
    });
    expect(JSON.stringify(data.stopCondition).toLowerCase()).not.toContain('not captured');
  });

  it('keeps backend execution mapping explicit when optional sections are missing', () => {
    const data = mapTicketExecutionViewToDashboardData({
      header: {
        title: 'Needs explicit execution data',
        issue_type: 'Task',
        priority: 'Medium',
        status: 'BLOCKED',
      },
      decision_strip: {},
      immediate_actions: {},
      top_blockers: [],
      execution_plan: [],
      definition_of_done: [],
      stop_conditions: [],
      full_details: {},
    });

    expect(data.decision_summary).toEqual({
      can_we_proceed: '',
      blocked_until: 'Not available',
      do_now: '',
      next_decision: '',
    });
    expect(data.immediateActions.items).toEqual([]);
    expect(data.parallelActions.items).toEqual([]);
    expect(data.blockers).toEqual([]);
    expect(data.executionPlan).toEqual([]);
    expect(data.definitionOfDone).toEqual([]);
    expect(data.stopCondition).toEqual({
      if: 'Not available',
      then: 'Not available',
      when: 'Not available',
    });
    expect(data.fullDetails).toEqual([]);
  });

  it('renders execution plan descriptions without truncated title labels', () => {
    const data = mapTicketExecutionViewToDashboardData({
      execution_plan: [
        {
          step_number: 1,
          title: 'confirm CloudWatch ca',
          description:
            'Attach alarm action arn:aws:sns:us-east-1:111122223333:OpsAlerts and confirm CloudWatch can publish notifications to the SNS topic.',
        },
        {
          step_number: 2,
          title: 'confirming the Operation',
          description:
            'Coordinate validation by triggering or simulating the alarm path, confirming the Operations team receives the notification, and recording evidence in the ticket.',
        },
        {
          step_number: 3,
          title: 'c:',
          description: 'create the CloudWatch alarm.',
        },
      ],
    });

    expect(data.executionPlan).toEqual([
      'Attach alarm action arn:aws:sns:us-east-1:111122223333:OpsAlerts and confirm CloudWatch can publish notifications to the SNS topic.',
      'Coordinate validation by triggering or simulating the alarm path, confirming the Operations team receives the notification, and recording evidence in the ticket.',
      'Create the CloudWatch alarm.',
    ]);
    expect(JSON.stringify(data.executionPlan)).not.toContain('confirm CloudWatch ca:');
    expect(JSON.stringify(data.executionPlan)).not.toContain('confirming the Operation:');
    expect(JSON.stringify(data.executionPlan)).not.toContain('c:');
  });

  it('omits generic definition of done detail fields when the backend leaves them empty', () => {
    const data = mapTicketExecutionViewToDashboardData({
      definition_of_done: [
        {
          title: 'Alarm is enabled in us-east-1',
          scope: '',
          threshold: '',
          validation: '',
          default_expanded: true,
        },
        {
          title: 'Alarm condition uses CPU utilization above 80% for 10 minutes',
          scope: '',
          threshold: 'CPU utilization above 80% for 10 minutes',
          validation: '',
        },
        {
          title:
            'Alarm condition is configured for CPUUtilization greater than 80% for a 10-minute evaluation window.',
          scope: '',
          threshold: '',
          validation:
            'Confirm namespace AWS/EC2, metric CPUUtilization, dimension InstanceId=i-0abc123def4567890, comparison operator GreaterThanThreshold, threshold > 80%, and evaluation window 10 minutes.',
        },
      ],
    });

    expect(data.definitionOfDone[0].detail).toBe('');
    expect(data.definitionOfDone[1].detail).toBe('Threshold: CPU utilization above 80% for 10 minutes');
    expect(data.definitionOfDone[2].detail).toBe(
      'Validation: Confirm namespace AWS/EC2, metric CPUUtilization, dimension InstanceId=i-0abc123def4567890, comparison operator GreaterThanThreshold, threshold > 80%, and evaluation window 10 minutes.'
    );
    expect(JSON.stringify(data.definitionOfDone)).not.toContain('Acceptance criterion satisfied');
    expect(JSON.stringify(data.definitionOfDone)).not.toContain('Owner validation recorded');
    expect(JSON.stringify(data.definitionOfDone)).not.toContain('No completion detail captured');
  });
});
