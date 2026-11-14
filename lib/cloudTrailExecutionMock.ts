import type { TicketExecutionDashboardData } from './ticketDashboardTypes';

export const cloudTrailExecutionMock: TicketExecutionDashboardData = {
  title: 'Remediate Centralized CloudTrail Logging',
  issueType: 'Task',
  priority: 'Critical',
  readinessStatus: 'BLOCKED',
  decision_summary: {
    can_we_proceed: 'NO',
    blocked_until: 'Exposed credential not rotated',
    do_now: 'Revoke compromised key',
    next_decision: 'Org Trail vs Account-Level Trail',
  },
  flow_container_class: 'border rounded-xl p-4 bg-white shadow-sm',
  flow: [
    { label: 'Can we proceed', value: 'NO', tone: 'negative' },
    { label: 'Blocked until', value: 'Exposed credential not rotated', tone: 'neutral' },
    { label: 'Do now', value: 'Revoke compromised key', tone: 'neutral' },
    { label: 'Next decision', value: 'Org Trail vs Account-Level Trail', tone: 'neutral' },
  ],
  decisions: [
    { label: 'Can we proceed?', value: 'NO', tone: 'red' },
    { label: 'Execution status', value: 'Block capel', tone: 'red' },
    { label: 'Confidence', value: '4/10', tone: 'neutral' },
    {
      label: 'Do now',
      value: 'Revoke compromised key',
      tone: 'blue',
    },
    {
      label: 'Next decision',
      value: 'Org Trail vs Account-Level Trail',
      tone: 'neutral',
    },
  ],
  immediateActions: {
    title: 'Immediate Actions',
    items: [
      'Revoke or rotate exposed AWS credential',
      'Identify dependent systems',
      'Confirm security owner',
    ],
    tone: 'blue',
  },
  parallelActions: {
    title: 'Safe to Start in Parallel',
    items: [
      'Identify account inventory',
      'Validate current logging architecture',
      'Confirm destination ownership',
    ],
    tone: 'blue',
  },
  blockers: [
    {
      title: 'Security-Sensitive Credential Remediation',
      description: 'Must revoke credential before implementation begins',
      neededBy: 'Before start',
    },
    {
      title: 'Destination Validation',
      description: 'Confirm logging.company.internal ownership.',
      neededBy: 'Early implementation',
    },
    {
      title: 'Account Scope Confirmation',
      description: 'Verify target account and region scope',
      neededBy: 'Before completion',
    },
  ],
  needsAttention: {
    blockingNow: [
      {
        title: 'Security-Sensitive Credential Remediation',
        description: 'Must revoke credential before implementation begins',
        neededBy: 'Before start',
      },
    ],
    neededSoon: [
      {
        title: 'Destination Validation',
        description: 'Confirm logging.company.internal ownership.',
        neededBy: 'Early implementation',
      },
    ],
    later: [
      {
        title: 'Account Scope Confirmation',
        description: 'Verify target account and region scope',
        neededBy: 'Before completion',
      },
    ],
  },
  executionPlan: [
    'Contain credential exposure',
    'Confirm logging model',
    'Validate destination mapping',
    'Configure CloudTrail delivery',
    'Validate ingestion and access',
  ],
  definitionOfDone: [
    {
      title: 'CloudTrail logs delivered to central destination',
      detail:
        'Management and data events from the target scope arrive in the approved central logging destination with expected timestamps.',
      defaultOpen: true,
    },
    {
      title: 'Log storage encryption enabled',
      detail:
        'The destination bucket and any log processing path enforce encryption using the approved KMS key and retention policy.',
      defaultOpen: true,
    },
    {
      title: 'More criteria...',
      detail:
        'Access controls, trail health, alert routing, and evidence capture are verified before the ticket is marked complete.',
    },
  ],
  stopCondition: {
    if: 'Compromised key not revoked',
    then: 'Pause implementation',
    when: 'Before execution starts',
  },
  fullDetails: [
    'Credential exposure is security-sensitive and must be contained before implementation begins.',
    'The team still needs to confirm whether centralized logging should use an organization trail or account-level trail configuration.',
    'Logging destination ownership must be validated for logging.company.internal before CloudTrail delivery is changed.',
  ],
};
