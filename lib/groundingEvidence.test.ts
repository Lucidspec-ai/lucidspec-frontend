import { describe, expect, it } from 'vitest';

import {
  FIREWALL_RULE_GENERATION_POLICY_CONTRACT,
  GENERIC_ENGINEERING_GENERATION_POLICY_CONTRACT,
  RDS_BACKUP_GENERATION_POLICY_CONTRACT,
  addGroundingEvidenceToGeneratePayload,
  extractGroundingEvidence,
} from './groundingEvidence';

const groundedPrompt =
  'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821; rollback is to remove the rule; validate with connectivity test and firewall logs.';
const rdsBackupPrompt =
  'RDS backups with target, window, retention, KMS, monitoring, validation, rollback, approval';
const genericEngineeringPrompt =
  'Deploy ECS service with target, window, approval, rollback, validation, monitoring';

describe('groundingEvidence', () => {
  it('extracts concrete firewall rule controls from the original request', () => {
    expect(extractGroundingEvidence(groundedPrompt)).toEqual({
      schema_version: 'grounding_evidence.v1',
      source: 'frontend_generate_proxy',
      domain: 'network_firewall_rule',
      confidence: 'high',
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
        text: 'approved change window CHG-7821',
      },
      rollback: {
        action: 'remove',
        text: 'to remove the rule',
      },
      validation: {
        method: 'connectivity test',
        text: 'connectivity test and firewall logs',
      },
      present_controls: [
        'action',
        'object_type',
        'rule_name',
        'environment',
        'source_address',
        'destination_address',
        'protocol',
        'port',
        'change_window',
        'rollback',
        'validation',
      ],
      missing_controls: [],
      provided_readiness_controls: [
        'source_address',
        'destination_address',
        'protocol',
        'port',
        'change_window',
        'rollback',
      ],
      missing_readiness_controls: [],
      execution_prerequisites: [
        {
          key: 'firewall_policy_access',
          label: 'Firewall policy access',
          verification_type: 'execution_access',
          blocks_readiness: false,
          text: 'Verify operator access to the DC-West firewall policy for rule MIG-APP-443 before making the change.',
        },
        {
          key: 'firewall_policy_target',
          label: 'Firewall policy target',
          verification_type: 'execution_context',
          blocks_readiness: false,
          text: 'Verify the active policy target is the intended DC-West firewall policy before applying the rule.',
        },
      ],
      classification_guidance: {
        block_on_missing_readiness_controls: false,
        treat_execution_prerequisites_as_missing_information: false,
      },
      readiness_classification: {
        rule: 'network_firewall_rule_required_controls',
        readiness_status: 'Execution-ready',
        proceed_decision: 'yes',
        governance: {
          execution_status: 'ready',
          proceed_prohibited: false,
        },
        blocked_until_summary: 'None for current proceed scope',
        invalid_or_unsupported_ticket: false,
        reason:
          'Required firewall rule controls are present: source, destination, protocol, port, change window, and rollback.',
      },
    });
  });

  it('separates missing readiness controls from execution prerequisites', () => {
    const evidence = extractGroundingEvidence(
      'Add firewall rule APP-DNS-53 from 10.1.0.0/24 to dns.example.com using UDP 53.'
    );

    expect(evidence).toMatchObject({
      confidence: 'medium',
      action: 'add',
      object_type: 'firewall_rule',
      rule_name: 'APP-DNS-53',
      source_address: '10.1.0.0/24',
      destination_address: 'dns.example.com',
      protocol: 'UDP',
      port: '53',
    });
    expect(evidence?.present_controls).toEqual([
      'action',
      'object_type',
      'rule_name',
      'source_address',
      'destination_address',
      'protocol',
      'port',
    ]);
    expect(evidence?.missing_controls).toContain('change_window');
    expect(evidence?.missing_controls).toContain('rollback');
    expect(evidence?.missing_controls).toContain('validation');
    expect(evidence?.provided_readiness_controls).toEqual([
      'source_address',
      'destination_address',
      'protocol',
      'port',
    ]);
    expect(evidence?.missing_readiness_controls).toEqual(['change_window', 'rollback']);
    expect(evidence?.execution_prerequisites).toEqual([
      {
        key: 'firewall_policy_access',
        label: 'Firewall policy access',
        verification_type: 'execution_access',
        blocks_readiness: false,
        text: 'Verify operator access to the target firewall policy for rule APP-DNS-53 before making the change.',
      },
      {
        key: 'firewall_policy_target',
        label: 'Firewall policy target',
        verification_type: 'execution_context',
        blocks_readiness: false,
        text: 'Verify the active policy target is the intended target firewall policy before applying the rule.',
      },
    ]);
    expect(evidence?.classification_guidance).toEqual({
      block_on_missing_readiness_controls: true,
      treat_execution_prerequisites_as_missing_information: false,
    });
    expect(evidence?.readiness_classification).toEqual({
      rule: 'network_firewall_rule_required_controls',
      readiness_status: 'Not execution-ready',
      proceed_decision: 'no',
      governance: {
        execution_status: 'blocked',
        proceed_prohibited: true,
      },
      blocked_until_summary: 'Missing required operational controls: change_window, rollback',
      invalid_or_unsupported_ticket: false,
      reason:
        'The request is a supported firewall rule ticket, but execution should wait until required operational controls are supplied.',
    });
  });

  it('does not mark firewall policy access as missing when readiness controls are provided', () => {
    const evidence = extractGroundingEvidence(groundedPrompt);

    expect(evidence?.missing_readiness_controls).toEqual([]);
    expect(evidence?.execution_prerequisites.map((item) => item.key)).toEqual([
      'firewall_policy_access',
      'firewall_policy_target',
    ]);
    expect(evidence?.execution_prerequisites.every((item) => item.blocks_readiness === false)).toBe(true);
    expect(evidence?.missing_controls).not.toContain('firewall_policy_access');
    expect(evidence?.missing_controls).not.toContain('firewall_policy_target');
  });

  it('recommends the expected execution-ready backend classification for the DC-West prompt', () => {
    const evidence = extractGroundingEvidence(groundedPrompt);

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
  });

  it('adds grounding evidence to generate payloads without changing ticket semantics', () => {
    const payload = addGroundingEvidenceToGeneratePayload({
      task_input: groundedPrompt,
      user_email: 'engineer@example.com',
      proceed_decision: 'no',
    });

    expect(payload).toMatchObject({
      task_input: groundedPrompt,
      user_email: 'engineer@example.com',
      proceed_decision: 'no',
      grounding_evidence: {
        domain: 'network_firewall_rule',
        confidence: 'high',
        rule_name: 'MIG-APP-443',
        source_address: '10.20.10.0/24',
        destination_address: '10.40.5.25',
        protocol: 'TCP',
        port: '443',
        missing_readiness_controls: [],
        classification_guidance: {
          block_on_missing_readiness_controls: false,
          treat_execution_prerequisites_as_missing_information: false,
        },
        readiness_classification: {
          readiness_status: 'Execution-ready',
          proceed_decision: 'yes',
          governance: {
            execution_status: 'ready',
            proceed_prohibited: false,
          },
          blocked_until_summary: 'None for current proceed scope',
          invalid_or_unsupported_ticket: false,
        },
      },
      generation_policy_contract: {
        schema_version: 'generation_policy_contract.v1',
        applies_to: 'network_firewall_rule',
      },
    });
  });

  it('defines backend generator policy instructions and positive/negative examples', () => {
    expect(FIREWALL_RULE_GENERATION_POLICY_CONTRACT.instructions).toEqual([
      expect.objectContaining({
        key: 'preserve_user_controls',
        text: expect.stringContaining('Preserve operational controls explicitly stated by the user'),
      }),
      expect.objectContaining({
        key: 'do_not_block_on_provided_controls',
        text: expect.stringContaining('Do not convert already-provided operational controls into blockers'),
      }),
      expect.objectContaining({
        key: 'ground_blockers_only',
        text: expect.stringContaining('Do not invent extra blockers'),
      }),
      expect.objectContaining({
        key: 'approved_change_window_is_evidence',
        text: expect.stringContaining('approved change window CHG-####'),
      }),
      expect.objectContaining({
        key: 'policy_access_is_prerequisite',
        text: expect.stringContaining('normal execution prerequisites'),
      }),
    ]);
    expect(FIREWALL_RULE_GENERATION_POLICY_CONTRACT.examples).toEqual([
      expect.objectContaining({
        label: 'positive_fully_grounded_firewall_rule',
        expected: expect.objectContaining({
          readiness_status: 'Execution-ready',
          proceed_decision: 'yes',
          governance_execution_status: 'ready',
          proceed_prohibited: false,
          blocked_until_summary: 'None for current proceed scope',
          invalid_or_unsupported_ticket: false,
          execution_prerequisites_are_blockers: false,
        }),
      }),
      expect.objectContaining({
        label: 'negative_missing_rollback',
        expected: expect.objectContaining({
          readiness_status: 'Not execution-ready',
          proceed_decision: 'no',
          governance_execution_status: 'blocked',
          proceed_prohibited: true,
          invalid_or_unsupported_ticket: false,
          missing_readiness_controls: ['rollback'],
          execution_prerequisites_are_blockers: false,
        }),
      }),
    ]);
  });

  it('extracts shorthand RDS backup controls as grounded request evidence', () => {
    expect(extractGroundingEvidence(rdsBackupPrompt)).toEqual({
      schema_version: 'grounding_evidence.v1',
      source: 'frontend_generate_proxy',
      domain: 'aws_rds_backup',
      confidence: 'high',
      action: undefined,
      object_type: 'rds_backup',
      target: {
        text: 'target',
        specificity: 'keyword_only',
      },
      window: {
        text: 'window',
        specificity: 'keyword_only',
      },
      retention: {
        text: 'retention',
        specificity: 'keyword_only',
      },
      kms: {
        text: 'kms',
        specificity: 'keyword_only',
      },
      monitoring: {
        text: 'monitoring',
        specificity: 'keyword_only',
      },
      validation: {
        text: 'validation',
        specificity: 'keyword_only',
      },
      rollback: {
        text: 'rollback',
        specificity: 'keyword_only',
      },
      approval: {
        status: 'mentioned',
        text: 'approval',
      },
      present_controls: ['target', 'window', 'retention', 'kms', 'monitoring', 'validation', 'rollback', 'approval'],
      missing_controls: [],
      provided_readiness_controls: ['target', 'window', 'retention', 'kms', 'monitoring', 'validation', 'rollback', 'approval'],
      missing_readiness_controls: [],
      execution_prerequisites: [
        {
          key: 'rds_backup_operator_access',
          label: 'RDS backup operator access',
          verification_type: 'execution_access',
          blocks_readiness: false,
          text: 'Verify operator access to intended RDS backup target before changing backup settings.',
        },
        {
          key: 'rds_backup_target_scope',
          label: 'RDS backup target scope',
          verification_type: 'execution_context',
          blocks_readiness: false,
          text: 'Verify the backup target scope matches intended RDS backup target before execution.',
        },
      ],
      classification_guidance: {
        block_on_missing_readiness_controls: false,
        treat_execution_prerequisites_as_missing_information: false,
      },
      readiness_classification: {
        rule: 'aws_rds_backup_required_controls',
        readiness_status: 'Execution-ready',
        proceed_decision: 'yes',
        governance: {
          execution_status: 'ready',
          proceed_prohibited: false,
        },
        blocked_until_summary: 'None for current proceed scope',
        invalid_or_unsupported_ticket: false,
        reason:
          'The request explicitly includes the required RDS backup controls: target, window, retention, KMS, monitoring, validation, rollback, and approval.',
      },
    });
  });

  it('adds RDS backup grounding evidence and the matching generator contract', () => {
    const payload = addGroundingEvidenceToGeneratePayload({
      task_input: rdsBackupPrompt,
      user_email: 'engineer@example.com',
    });

    expect(payload).toMatchObject({
      task_input: rdsBackupPrompt,
      user_email: 'engineer@example.com',
      grounding_evidence: {
        domain: 'aws_rds_backup',
        confidence: 'high',
        missing_readiness_controls: [],
        approval: {
          status: 'mentioned',
        },
        classification_guidance: {
          block_on_missing_readiness_controls: false,
          treat_execution_prerequisites_as_missing_information: false,
        },
        readiness_classification: {
          readiness_status: 'Execution-ready',
          proceed_decision: 'yes',
          governance: {
            execution_status: 'ready',
            proceed_prohibited: false,
          },
          blocked_until_summary: 'None for current proceed scope',
          invalid_or_unsupported_ticket: false,
        },
      },
      generation_policy_contract: {
        schema_version: 'generation_policy_contract.v1',
        applies_to: 'aws_rds_backup',
      },
    });
  });

  it('defines backend generator instructions for shorthand RDS backup prompts', () => {
    expect(RDS_BACKUP_GENERATION_POLICY_CONTRACT.instructions).toEqual([
      expect.objectContaining({
        key: 'preserve_user_controls',
        text: expect.stringContaining('Preserve user-provided RDS backup controls'),
      }),
      expect.objectContaining({
        key: 'keyword_controls_are_grounded',
        text: expect.stringContaining('treat those keywords as grounded requirements'),
      }),
      expect.objectContaining({
        key: 'do_not_invent_approval_gaps',
        text: expect.stringContaining('do not add invented approval blockers'),
      }),
      expect.objectContaining({
        key: 'do_not_block_on_provided_controls',
        text: expect.stringContaining('Do not convert already-provided RDS backup controls'),
      }),
      expect.objectContaining({
        key: 'normal_prereqs_are_not_blockers',
        text: expect.stringContaining('normal execution prerequisites'),
      }),
    ]);
    expect(RDS_BACKUP_GENERATION_POLICY_CONTRACT.examples).toEqual([
      expect.objectContaining({
        label: 'positive_keyword_grounded_rds_backup',
        expected: expect.objectContaining({
          readiness_status: 'Execution-ready',
          proceed_decision: 'yes',
          governance_execution_status: 'ready',
          proceed_prohibited: false,
          blocked_until_summary: 'None for current proceed scope',
          invalid_or_unsupported_ticket: false,
          missing_readiness_controls: [],
          execution_prerequisites_are_blockers: false,
        }),
      }),
      expect.objectContaining({
        label: 'negative_missing_rollback_and_validation',
        expected: expect.objectContaining({
          readiness_status: 'Not execution-ready',
          proceed_decision: 'no',
          governance_execution_status: 'blocked',
          proceed_prohibited: true,
          blocked_until_summary: 'Missing required RDS backup controls: validation, rollback',
          invalid_or_unsupported_ticket: false,
          missing_readiness_controls: ['validation', 'rollback'],
          execution_prerequisites_are_blockers: false,
        }),
      }),
    ]);
  });

  it('extracts generic engineering shorthand controls across domains', () => {
    expect(extractGroundingEvidence(genericEngineeringPrompt)).toEqual({
      schema_version: 'grounding_evidence.v1',
      source: 'frontend_generate_proxy',
      domain: 'engineering_operational_change',
      confidence: 'high',
      action: 'deploy',
      object_type: 'engineering_change',
      target: {
        text: 'target',
        specificity: 'keyword_only',
      },
      access: undefined,
      dependencies: undefined,
      window: {
        text: 'window',
        specificity: 'keyword_only',
      },
      approval: {
        status: 'mentioned',
        text: 'approval',
      },
      rollback: {
        text: 'rollback',
        specificity: 'keyword_only',
      },
      validation: {
        text: 'validation',
        specificity: 'keyword_only',
      },
      monitoring: {
        text: 'monitoring',
        specificity: 'keyword_only',
      },
      retention: undefined,
      kms: undefined,
      present_controls: ['target', 'window', 'approval', 'rollback', 'validation', 'monitoring'],
      missing_controls: ['access', 'dependencies', 'retention', 'kms'],
      provided_readiness_controls: ['target', 'window', 'approval', 'rollback', 'validation'],
      missing_readiness_controls: [],
      execution_prerequisites: [
        {
          key: 'engineering_change_access',
          label: 'Engineering change access',
          verification_type: 'execution_access',
          blocks_readiness: false,
          text: 'Verify operator access to intended engineering change target before making the change.',
        },
        {
          key: 'engineering_change_scope',
          label: 'Engineering change scope',
          verification_type: 'execution_context',
          blocks_readiness: false,
          text: 'Verify the intended change scope matches intended engineering change target before execution.',
        },
      ],
      classification_guidance: {
        block_on_missing_readiness_controls: false,
        treat_execution_prerequisites_as_missing_information: false,
      },
      readiness_classification: {
        rule: 'engineering_operational_controls_present',
        readiness_status: 'Execution-ready',
        proceed_decision: 'yes',
        governance: {
          execution_status: 'ready',
          proceed_prohibited: false,
        },
        blocked_until_summary: 'None for current proceed scope',
        invalid_or_unsupported_ticket: false,
        reason:
          'The request includes grounded operational controls for target, window, approval, rollback, and validation.',
      },
    });
  });

  it('adds a generic engineering grounding contract when shorthand operational controls are present', () => {
    const payload = addGroundingEvidenceToGeneratePayload({
      task_input: genericEngineeringPrompt,
      user_email: 'engineer@example.com',
    });

    expect(payload).toMatchObject({
      task_input: genericEngineeringPrompt,
      user_email: 'engineer@example.com',
      grounding_evidence: {
        domain: 'engineering_operational_change',
        confidence: 'high',
        action: 'deploy',
        missing_readiness_controls: [],
        classification_guidance: {
          block_on_missing_readiness_controls: false,
          treat_execution_prerequisites_as_missing_information: false,
        },
        readiness_classification: {
          readiness_status: 'Execution-ready',
          proceed_decision: 'yes',
          governance: {
            execution_status: 'ready',
            proceed_prohibited: false,
          },
          blocked_until_summary: 'None for current proceed scope',
          invalid_or_unsupported_ticket: false,
        },
      },
      generation_policy_contract: {
        schema_version: 'generation_policy_contract.v1',
        applies_to: 'engineering_operational_change',
      },
    });
  });

  it('defines backend generator instructions for generic engineering shorthand prompts', () => {
    expect(GENERIC_ENGINEERING_GENERATION_POLICY_CONTRACT.instructions).toEqual([
      expect.objectContaining({
        key: 'preserve_user_controls',
        text: expect.stringContaining('Preserve operational controls explicitly stated by the user across engineering domains'),
      }),
      expect.objectContaining({
        key: 'keyword_controls_are_grounded',
        text: expect.stringContaining('grounded requirements'),
      }),
      expect.objectContaining({
        key: 'do_not_invent_approval_gaps',
        text: expect.stringContaining('do not add invented approval blockers'),
      }),
      expect.objectContaining({
        key: 'do_not_block_on_provided_controls',
        text: expect.stringContaining('Do not convert already-provided operational controls'),
      }),
      expect.objectContaining({
        key: 'normal_prereqs_are_not_blockers',
        text: expect.stringContaining('normal execution prerequisites'),
      }),
    ]);
    expect(GENERIC_ENGINEERING_GENERATION_POLICY_CONTRACT.examples).toEqual([
      expect.objectContaining({
        label: 'positive_generic_engineering_controls',
        expected: expect.objectContaining({
          readiness_status: 'Execution-ready',
          proceed_decision: 'yes',
          governance_execution_status: 'ready',
          proceed_prohibited: false,
          blocked_until_summary: 'None for current proceed scope',
          invalid_or_unsupported_ticket: false,
          missing_readiness_controls: [],
          execution_prerequisites_are_blockers: false,
        }),
      }),
      expect.objectContaining({
        label: 'negative_missing_generic_controls',
        expected: expect.objectContaining({
          readiness_status: 'Not execution-ready',
          proceed_decision: 'no',
          governance_execution_status: 'blocked',
          proceed_prohibited: true,
          blocked_until_summary: 'Missing required operational controls: window, approval, validation',
          invalid_or_unsupported_ticket: false,
          missing_readiness_controls: ['window', 'approval', 'validation'],
          execution_prerequisites_are_blockers: false,
        }),
      }),
    ]);
  });

  it('does not add evidence for non-firewall-rule prompts', () => {
    const payload = { task_input: 'Create a CloudWatch alarm for high CPU.' };
    expect(addGroundingEvidenceToGeneratePayload(payload)).toBe(payload);
  });
});
