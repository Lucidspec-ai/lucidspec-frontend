import { describe, expect, it } from 'vitest';

import { addGroundingEvidenceToGeneratePayload, extractGroundingEvidence } from './groundingEvidence';

const goldenPrompt =
  'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821; rollback is to remove the rule; validate with connectivity test and firewall logs.';

const expectExecutionReady = (prompt: string) => {
  const evidence = extractGroundingEvidence(prompt);

  expect(evidence).toBeTruthy();
  expect(evidence?.missing_readiness_controls).toEqual([]);
  expect(evidence?.readiness_classification).toMatchObject({
    readiness_status: 'Execution-ready',
    proceed_decision: 'yes',
    governance: {
      execution_status: 'ready',
      proceed_prohibited: false,
    },
    blocked_until_summary: 'None for current proceed scope',
    invalid_or_unsupported_ticket: false,
  });
  return evidence;
};

describe('firewall backend grounding contract', () => {
  it('golden: classifies the approved DC-West firewall rule prompt as execution-ready', () => {
    const evidence = expectExecutionReady(goldenPrompt);

    expect(evidence).toMatchObject({
      action: 'create',
      object_type: 'firewall_rule',
      rule_name: 'MIG-APP-443',
      environment: 'DC-West',
      source_address: '10.20.10.0/24',
      destination_address: '10.40.5.25',
      protocol: 'TCP',
      port: '443',
      change_window: {
        approval_status: 'approved',
        change_id: 'CHG-7821',
      },
      rollback: {
        action: 'remove',
      },
      validation: {
        method: 'connectivity test',
      },
    });
  });

  it.each([
    {
      label: 'TCP CIDR to IP with remove rollback and connectivity/log validation',
      prompt:
        'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821; rollback is to remove the rule; validate with connectivity test and firewall logs.',
      expected: {
        source_address: '10.20.10.0/24',
        destination_address: '10.40.5.25',
        protocol: 'TCP',
        port: '443',
        rollback_action: 'remove',
        validation_method: 'connectivity test',
      },
    },
    {
      label: 'UDP IP to CIDR with delete rollback and logs validation',
      prompt:
        'Add the approved DC-East firewall rule DNS-APP-53 from 10.20.10.15 to 10.40.8.0/24 using UDP 53 during approved change window CHG-9002; rollback: delete the rule; validate via firewall logs.',
      expected: {
        source_address: '10.20.10.15',
        destination_address: '10.40.8.0/24',
        protocol: 'UDP',
        port: '53',
        rollback_action: 'delete',
        validation_method: 'firewall logs',
      },
    },
    {
      label: 'TCP IP to CIDR with packet capture validation',
      prompt:
        'Configure the approved Core firewall rule API-DB-8443 from 10.3.4.5 to 10.9.0.0/24 on TCP 8443 during approved change window CHG-9003; rollback is remove rule API-DB-8443; validate by packet capture.',
      expected: {
        source_address: '10.3.4.5',
        destination_address: '10.9.0.0/24',
        protocol: 'TCP',
        port: '8443',
        rollback_action: 'remove',
        validation_method: 'packet capture',
      },
    },
    {
      label: 'UDP CIDR to IP with firewall hit count validation',
      prompt:
        'Implement the approved Edge firewall rule NTP-OUT-123 to allow 10.44.0.0/24 to 10.55.66.77 over UDP 123 during approved change window CHG-9004; rollback is to delete the rule; validate with firewall hit count.',
      expected: {
        source_address: '10.44.0.0/24',
        destination_address: '10.55.66.77',
        protocol: 'UDP',
        port: '123',
        rollback_action: 'delete',
        validation_method: 'hit count',
      },
    },
  ])('variant: $label', ({ prompt, expected }) => {
    const evidence = expectExecutionReady(prompt);

    expect(evidence).toMatchObject({
      source_address: expected.source_address,
      destination_address: expected.destination_address,
      protocol: expected.protocol,
      port: expected.port,
      rollback: {
        action: expected.rollback_action,
      },
      validation: {
        method: expected.validation_method,
      },
    });
  });

  it.each([
    {
      label: 'missing source',
      prompt:
        'Create the approved DC-West firewall rule MIG-APP-443 to allow traffic to 10.40.5.25 on TCP 443 during approved change window CHG-7821; rollback is to remove the rule; validate with connectivity test.',
      missing: ['source_address'],
    },
    {
      label: 'missing destination',
      prompt:
        'Create the approved DC-West firewall rule MIG-APP-443 from 10.20.10.0/24 on TCP 443 during approved change window CHG-7821; rollback is to remove the rule; validate with firewall logs.',
      missing: ['destination_address'],
    },
    {
      label: 'missing port and protocol',
      prompt:
        'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 during approved change window CHG-7821; rollback is to remove the rule; validate with connectivity test.',
      missing: ['protocol', 'port'],
    },
    {
      label: 'missing rollback',
      prompt:
        'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821; validate with firewall logs.',
      missing: ['rollback'],
    },
    {
      label: 'missing change approval',
      prompt:
        'Create the DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during change window CHG-7821; rollback is to remove the rule; validate with connectivity test.',
      missing: ['change_window'],
    },
  ])('negative: $label', ({ prompt, missing }) => {
    const evidence = extractGroundingEvidence(prompt);

    expect(evidence).toBeTruthy();
    expect(evidence?.missing_readiness_controls).toEqual(missing);
    expect(evidence?.readiness_classification).toMatchObject({
      readiness_status: 'Not execution-ready',
      proceed_decision: 'no',
      governance: {
        execution_status: 'blocked',
        proceed_prohibited: true,
      },
      invalid_or_unsupported_ticket: false,
    });
    expect(evidence?.readiness_classification.blocked_until_summary).toBe(
      `Missing required operational controls: ${missing.join(', ')}`
    );
  });

  it('regression: fully grounded firewall prompts do not emit Invalid or Unsupported Ticket', () => {
    const payload = addGroundingEvidenceToGeneratePayload({ task_input: goldenPrompt });
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain('Invalid or Unsupported Ticket');
    expect(serialized).not.toContain('"ticket_type":"invalid"');
    expect(serialized).not.toContain('"invalid_reason"');
    expect(serialized).toContain('"invalid_or_unsupported_ticket":false');
  });
});
