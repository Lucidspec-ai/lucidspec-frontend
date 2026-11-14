import { isEngineeringRelatedInput } from './engineeringRelevance';

type GroundingReadinessClassification = {
  rule: string;
  readiness_status: 'Execution-ready' | 'Not execution-ready';
  proceed_decision: 'yes' | 'no';
  governance: {
    execution_status: 'ready' | 'blocked';
    proceed_prohibited: boolean;
  };
  blocked_until_summary: string;
  invalid_or_unsupported_ticket: false;
  reason: string;
};

type GroundingExecutionPrerequisite = {
  key: string;
  label: string;
  verification_type: 'execution_access' | 'execution_context';
  blocks_readiness: false;
  text: string;
};

type GroundingPolicyScope = 'network_firewall_rule' | 'aws_rds_backup' | 'engineering_operational_change';

type GroundingControlMention = {
  text: string;
  specificity: 'keyword_only' | 'concrete';
};

type GroundingApprovalMention = {
  status: 'mentioned' | 'approved';
  text: string;
};

type GroundingEvidenceBase = {
  schema_version: 'grounding_evidence.v1';
  source: 'frontend_generate_proxy';
  domain: GroundingPolicyScope;
  confidence: 'high' | 'medium' | 'low';
  present_controls: string[];
  missing_controls: string[];
  provided_readiness_controls: string[];
  missing_readiness_controls: string[];
  execution_prerequisites: GroundingExecutionPrerequisite[];
  classification_guidance: {
    block_on_missing_readiness_controls: boolean;
    treat_execution_prerequisites_as_missing_information: false;
  };
  readiness_classification: GroundingReadinessClassification;
};

export type FirewallRuleGroundingEvidence = GroundingEvidenceBase & {
  domain: 'network_firewall_rule';
  action?: 'create' | 'add' | 'configure' | 'implement';
  object_type: 'firewall_rule';
  rule_name?: string;
  environment?: string;
  source_address?: string;
  destination_address?: string;
  protocol?: 'TCP' | 'UDP';
  port?: string;
  change_window?: {
    approval_status?: 'approved';
    change_id?: string;
    text?: string;
  };
  rollback?: {
    action?: string;
    text: string;
  };
  validation?: {
    method?: string;
    text: string;
  };
};

type GeneratePayload = Record<string, unknown>;

export type GenerationPolicyContract = {
  schema_version: 'generation_policy_contract.v1';
  source: 'frontend_generate_proxy';
  applies_to: GroundingPolicyScope;
  instructions: Array<{
    key: string;
    text: string;
  }>;
  examples: Array<{
    label: string;
    input: string;
    expected: {
      readiness_status: 'Execution-ready' | 'Not execution-ready';
      proceed_decision: 'yes' | 'no';
      governance_execution_status: 'ready' | 'blocked';
      proceed_prohibited: boolean;
      blocked_until_summary: string;
      invalid_or_unsupported_ticket: false;
      missing_readiness_controls?: string[];
      execution_prerequisites_are_blockers: false;
    };
  }>;
};

export type RdsBackupGroundingEvidence = GroundingEvidenceBase & {
  domain: 'aws_rds_backup';
  action?: 'create' | 'configure' | 'enable' | 'implement' | 'review';
  object_type: 'rds_backup';
  target?: GroundingControlMention;
  window?: GroundingControlMention;
  retention?: GroundingControlMention;
  kms?: GroundingControlMention;
  monitoring?: GroundingControlMention;
  validation?: GroundingControlMention;
  rollback?: GroundingControlMention;
  approval?: GroundingApprovalMention;
};

export type GenericEngineeringGroundingEvidence = GroundingEvidenceBase & {
  domain: 'engineering_operational_change';
  action?:
    | 'add'
    | 'build'
    | 'configure'
    | 'create'
    | 'deploy'
    | 'enable'
    | 'fix'
    | 'implement'
    | 'migrate'
    | 'patch'
    | 'provision'
    | 'restore'
    | 'review'
    | 'scale'
    | 'update';
  object_type: 'engineering_change';
  target?: GroundingControlMention;
  access?: GroundingControlMention;
  dependencies?: GroundingControlMention;
  window?: GroundingControlMention;
  approval?: GroundingApprovalMention;
  rollback?: GroundingControlMention;
  validation?: GroundingControlMention;
  monitoring?: GroundingControlMention;
  retention?: GroundingControlMention;
  kms?: GroundingControlMention;
};

export type GroundingEvidence =
  | FirewallRuleGroundingEvidence
  | RdsBackupGroundingEvidence
  | GenericEngineeringGroundingEvidence;

const CONTROL_KEYS = [
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
] as const;

const READINESS_CONTROL_KEYS = [
  'source_address',
  'destination_address',
  'protocol',
  'port',
  'change_window',
  'rollback',
] as const;

const RDS_BACKUP_CONTROL_KEYS = [
  'target',
  'window',
  'retention',
  'kms',
  'monitoring',
  'validation',
  'rollback',
  'approval',
] as const;

const RDS_BACKUP_READINESS_CONTROL_KEYS = [...RDS_BACKUP_CONTROL_KEYS] as const;

const GENERIC_ENGINEERING_CONTROL_KEYS = [
  'target',
  'access',
  'dependencies',
  'window',
  'approval',
  'rollback',
  'validation',
  'monitoring',
  'retention',
  'kms',
] as const;

const GENERIC_ENGINEERING_READINESS_CONTROL_KEYS = [
  'target',
  'window',
  'approval',
  'rollback',
  'validation',
] as const;

const IPV4 = '(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}';
const CIDR = `${IPV4}(?:\\/(?:3[0-2]|[12]?\\d))?`;
const FQDN = '(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63}';
const ENDPOINT = `(${CIDR}|${FQDN})`;

const normalizeSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();
const firstMatch = (value: string, pattern: RegExp) => value.match(pattern)?.[1]?.trim() || '';
const stripTrailing = (value: string) => normalizeSpaces(value).replace(/[.;]+$/, '');

function hasKeyword(input: string, keyword: string): boolean {
  return new RegExp(`\\b${keyword}\\b`, 'i').test(input);
}

function keywordMention(input: string, keyword: string, concretePattern?: RegExp): GroundingControlMention | undefined {
  const concreteText = concretePattern ? stripTrailing(firstMatch(input, concretePattern)) : '';
  if (concreteText) {
    return {
      text: concreteText,
      specificity: 'concrete',
    };
  }
  if (!hasKeyword(input, keyword)) return undefined;
  return {
    text: keyword,
    specificity: 'keyword_only',
  };
}

function extractAction(input: string): FirewallRuleGroundingEvidence['action'] | undefined {
  const action = firstMatch(input, /\b(create|add|configure|implement)\b/i).toLowerCase();
  if (action === 'create' || action === 'add' || action === 'configure' || action === 'implement') return action;
  return undefined;
}

function extractProtocolPort(input: string): { protocol?: 'TCP' | 'UDP'; port?: string } {
  const match =
    input.match(/\b(?:on|over|using)\s+(TCP|UDP)\s+(\d{1,5})\b/i) ||
    input.match(/\b(TCP|UDP)\s*\/\s*(\d{1,5})\b/i);
  if (!match) return {};

  const port = match[2];
  const portNumber = Number(port);
  if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) return {};
  return { protocol: match[1].toUpperCase() as 'TCP' | 'UDP', port };
}

function extractRollback(input: string): FirewallRuleGroundingEvidence['rollback'] | undefined {
  const text = stripTrailing(firstMatch(input, /\brollback\s*(?:is|:)?\s*([^.;]+)/i));
  if (!text) return undefined;
  const action = firstMatch(text, /\b(remove|delete|disable|revert)\b/i).toLowerCase() || undefined;
  return { action, text };
}

function extractValidation(input: string): FirewallRuleGroundingEvidence['validation'] | undefined {
  const text = stripTrailing(firstMatch(input, /\bvalidate\s+(?:with|by|via)?\s*([^.;]+)/i));
  if (!text) return undefined;
  const method =
    firstMatch(text, /\b(connectivity test|firewall logs?|packet capture|hit counts?|logs?|test|verification)\b/i)
      .toLowerCase() || undefined;
  return { method, text };
}

function extractChangeWindow(input: string): FirewallRuleGroundingEvidence['change_window'] | undefined {
  const changeId = firstMatch(input, /\b(CHG-\d+)\b/i).toUpperCase();
  const text = stripTrailing(firstMatch(input, /\b((?:approved\s+)?change window\s+CHG-\d+)\b/i));
  if (!changeId && !text) return undefined;
  return {
    approval_status: /\bapproved\b/i.test(input) ? 'approved' : undefined,
    change_id: changeId || undefined,
    text: text || undefined,
  };
}

function controlPresence(
  evidence: Omit<
    FirewallRuleGroundingEvidence,
    | 'present_controls'
    | 'missing_controls'
    | 'provided_readiness_controls'
    | 'missing_readiness_controls'
    | 'execution_prerequisites'
    | 'classification_guidance'
    | 'readiness_classification'
  >
) {
  const present = CONTROL_KEYS.filter((key) => Boolean(evidence[key]));
  const providedReadiness = READINESS_CONTROL_KEYS.filter((key) => {
    if (key === 'change_window') {
      return evidence.change_window?.approval_status === 'approved' && Boolean(evidence.change_window.change_id);
    }
    return Boolean(evidence[key]);
  });
  return {
    present_controls: present,
    missing_controls: CONTROL_KEYS.filter((key) => !present.includes(key)),
    provided_readiness_controls: providedReadiness,
    missing_readiness_controls: READINESS_CONTROL_KEYS.filter((key) => !providedReadiness.includes(key)),
  };
}

function executionPrerequisites(evidence: {
  environment?: string;
  rule_name?: string;
}): FirewallRuleGroundingEvidence['execution_prerequisites'] {
  const policyTarget = evidence.environment ? `${evidence.environment} firewall policy` : 'target firewall policy';
  const ruleTarget = evidence.rule_name ? ` for rule ${evidence.rule_name}` : '';
  return [
    {
      key: 'firewall_policy_access',
      label: 'Firewall policy access',
      verification_type: 'execution_access',
      blocks_readiness: false,
      text: `Verify operator access to the ${policyTarget}${ruleTarget} before making the change.`,
    },
    {
      key: 'firewall_policy_target',
      label: 'Firewall policy target',
      verification_type: 'execution_context',
      blocks_readiness: false,
      text: `Verify the active policy target is the intended ${policyTarget} before applying the rule.`,
    },
  ];
}

function confidenceFor(presentControls: string[]): FirewallRuleGroundingEvidence['confidence'] {
  if (CONTROL_KEYS.every((key) => presentControls.includes(key))) return 'high';
  if (presentControls.length >= 7) return 'medium';
  return 'low';
}

function readinessClassification(
  missingReadinessControls: string[]
): GroundingReadinessClassification {
  if (!missingReadinessControls.length) {
    return {
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
    };
  }

  return {
    rule: 'network_firewall_rule_required_controls',
    readiness_status: 'Not execution-ready',
    proceed_decision: 'no',
    governance: {
      execution_status: 'blocked',
      proceed_prohibited: true,
    },
    blocked_until_summary: `Missing required operational controls: ${missingReadinessControls.join(', ')}`,
    invalid_or_unsupported_ticket: false,
    reason:
      'The request is a supported firewall rule ticket, but execution should wait until required operational controls are supplied.',
  };
}

function extractRdsBackupAction(input: string): RdsBackupGroundingEvidence['action'] | undefined {
  const action = firstMatch(input, /\b(create|configure|enable|implement|review)\b/i).toLowerCase();
  if (action === 'create' || action === 'configure' || action === 'enable' || action === 'implement' || action === 'review') {
    return action;
  }
  return undefined;
}

function extractApprovalMention(input: string): GroundingApprovalMention | undefined {
  if (/\bapproved\b/i.test(input) && /\b(?:approval|window|change window)\b/i.test(input)) {
    return {
      status: 'approved',
      text: stripTrailing(firstMatch(input, /\b((?:approved\s+)?(?:change\s+)?window[^.;,]*|approved[^.;,]*approval[^.;,]*)/i) || 'approved'),
    };
  }
  if (!/\bapproval\b/i.test(input)) return undefined;
  return {
    status: 'mentioned',
    text: 'approval',
  };
}

function extractGenericEngineeringAction(input: string): GenericEngineeringGroundingEvidence['action'] | undefined {
  const action = firstMatch(
    input,
    /\b(add|build|configure|create|deploy|enable|fix|implement|migrate|patch|provision|restore|review|scale|update)\b/i
  ).toLowerCase();
  if (
    action === 'add' ||
    action === 'build' ||
    action === 'configure' ||
    action === 'create' ||
    action === 'deploy' ||
    action === 'enable' ||
    action === 'fix' ||
    action === 'implement' ||
    action === 'migrate' ||
    action === 'patch' ||
    action === 'provision' ||
    action === 'restore' ||
    action === 'review' ||
    action === 'scale' ||
    action === 'update'
  ) {
    return action;
  }
  return undefined;
}

function extractRdsBackupControls(input: string) {
  return {
    target:
      keywordMention(input, 'target', /\btarget\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'rds', /\b(?:rds|db|database)\s+(?:instance|cluster|target)\s*(?:is|:)?\s*([^.;,]+)/i),
    window:
      keywordMention(input, 'window', /\b(?:backup|change)\s+window\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'window'),
    retention: keywordMention(input, 'retention', /\bretention\s*(?:is|:)?\s*([^.;,]+)/i),
    kms:
      keywordMention(input, 'kms', /\b(?:kms|encryption)\s*(?:key|is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'encryption'),
    monitoring: keywordMention(input, 'monitoring', /\bmonitoring\s*(?:is|:)?\s*([^.;,]+)/i),
    validation: keywordMention(input, 'validation', /\bvalidation\s*(?:is|:)?\s*([^.;,]+)/i),
    rollback: keywordMention(input, 'rollback', /\brollback\s*(?:is|:)?\s*([^.;,]+)/i),
    approval: extractApprovalMention(input),
  };
}

function rdsControlPresence(
  evidence: Omit<
    RdsBackupGroundingEvidence,
    | 'present_controls'
    | 'missing_controls'
    | 'provided_readiness_controls'
    | 'missing_readiness_controls'
    | 'execution_prerequisites'
    | 'classification_guidance'
    | 'readiness_classification'
  >
) {
  const present = RDS_BACKUP_CONTROL_KEYS.filter((key) => Boolean(evidence[key]));
  const providedReadiness = RDS_BACKUP_READINESS_CONTROL_KEYS.filter((key) => Boolean(evidence[key]));
  return {
    present_controls: present,
    missing_controls: RDS_BACKUP_CONTROL_KEYS.filter((key) => !present.includes(key)),
    provided_readiness_controls: providedReadiness,
    missing_readiness_controls: RDS_BACKUP_READINESS_CONTROL_KEYS.filter((key) => !providedReadiness.includes(key)),
  };
}

function rdsExecutionPrerequisites(target?: GroundingControlMention): GroundingExecutionPrerequisite[] {
  const targetText = target?.specificity === 'concrete' ? target.text : 'intended RDS backup target';
  return [
    {
      key: 'rds_backup_operator_access',
      label: 'RDS backup operator access',
      verification_type: 'execution_access',
      blocks_readiness: false,
      text: `Verify operator access to ${targetText} before changing backup settings.`,
    },
    {
      key: 'rds_backup_target_scope',
      label: 'RDS backup target scope',
      verification_type: 'execution_context',
      blocks_readiness: false,
      text: `Verify the backup target scope matches ${targetText} before execution.`,
    },
  ];
}

function rdsConfidenceFor(presentControls: string[]): RdsBackupGroundingEvidence['confidence'] {
  if (RDS_BACKUP_CONTROL_KEYS.every((key) => presentControls.includes(key))) return 'high';
  if (presentControls.length >= 5) return 'medium';
  return 'low';
}

function rdsReadinessClassification(missingReadinessControls: string[]): GroundingReadinessClassification {
  if (!missingReadinessControls.length) {
    return {
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
    };
  }

  return {
    rule: 'aws_rds_backup_required_controls',
    readiness_status: 'Not execution-ready',
    proceed_decision: 'no',
    governance: {
      execution_status: 'blocked',
      proceed_prohibited: true,
    },
    blocked_until_summary: `Missing required RDS backup controls: ${missingReadinessControls.join(', ')}`,
    invalid_or_unsupported_ticket: false,
    reason:
      'The request is an RDS backup ticket, but execution should wait until the missing backup control categories are supplied.',
  };
}

function extractGenericEngineeringControls(input: string) {
  return {
    target:
      keywordMention(input, 'target', /\b(?:target|scope|destination|system|resource)\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'destination') ||
      keywordMention(input, 'scope'),
    access:
      keywordMention(input, 'access', /\b(?:access|permissions?|rbac|iam)\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'iam') ||
      keywordMention(input, 'rbac'),
    dependencies:
      keywordMention(input, 'dependencies', /\bdependenc(?:y|ies)\s*(?:is|are|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'dependency'),
    window:
      keywordMention(input, 'window', /\b(?:change|maintenance|deploy(?:ment)?|backup)\s+window\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'window'),
    approval: extractApprovalMention(input),
    rollback:
      keywordMention(input, 'rollback', /\brollback\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'revert') ||
      keywordMention(input, 'restore'),
    validation:
      keywordMention(input, 'validation', /\b(?:validate|validation|verify|verification)\s*(?:with|by|via|is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'verify'),
    monitoring:
      keywordMention(input, 'monitoring', /\b(?:monitoring|alerting|observability)\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'alerting'),
    retention:
      keywordMention(input, 'retention', /\b(?:retention|lifecycle)\s*(?:is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'lifecycle'),
    kms:
      keywordMention(input, 'kms', /\b(?:kms|encryption)\s*(?:key|is|:)?\s*([^.;,]+)/i) ||
      keywordMention(input, 'encryption'),
  };
}

function genericEngineeringControlPresence(
  evidence: Omit<
    GenericEngineeringGroundingEvidence,
    | 'present_controls'
    | 'missing_controls'
    | 'provided_readiness_controls'
    | 'missing_readiness_controls'
    | 'execution_prerequisites'
    | 'classification_guidance'
    | 'readiness_classification'
  >
) {
  const present = GENERIC_ENGINEERING_CONTROL_KEYS.filter((key) => Boolean(evidence[key]));
  const providedReadiness = GENERIC_ENGINEERING_READINESS_CONTROL_KEYS.filter((key) => Boolean(evidence[key]));
  return {
    present_controls: present,
    missing_controls: GENERIC_ENGINEERING_CONTROL_KEYS.filter((key) => !present.includes(key)),
    provided_readiness_controls: providedReadiness,
    missing_readiness_controls: GENERIC_ENGINEERING_READINESS_CONTROL_KEYS.filter((key) => !providedReadiness.includes(key)),
  };
}

function genericEngineeringExecutionPrerequisites(
  target?: GroundingControlMention
): GroundingExecutionPrerequisite[] {
  const targetText = target?.specificity === 'concrete' ? target.text : 'intended engineering change target';
  return [
    {
      key: 'engineering_change_access',
      label: 'Engineering change access',
      verification_type: 'execution_access',
      blocks_readiness: false,
      text: `Verify operator access to ${targetText} before making the change.`,
    },
    {
      key: 'engineering_change_scope',
      label: 'Engineering change scope',
      verification_type: 'execution_context',
      blocks_readiness: false,
      text: `Verify the intended change scope matches ${targetText} before execution.`,
    },
  ];
}

function genericEngineeringConfidenceFor(
  presentControls: string[],
  missingReadinessControls: string[]
): GenericEngineeringGroundingEvidence['confidence'] {
  if (!missingReadinessControls.length && presentControls.length >= 6) return 'high';
  if (presentControls.length >= 3) return 'medium';
  return 'low';
}

function genericEngineeringReadinessClassification(
  missingReadinessControls: string[]
): GroundingReadinessClassification {
  if (!missingReadinessControls.length) {
    return {
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
    };
  }

  return {
    rule: 'engineering_operational_controls_present',
    readiness_status: 'Not execution-ready',
    proceed_decision: 'no',
    governance: {
      execution_status: 'blocked',
      proceed_prohibited: true,
    },
    blocked_until_summary: `Missing required operational controls: ${missingReadinessControls.join(', ')}`,
    invalid_or_unsupported_ticket: false,
    reason:
      'The request is engineering-related, but execution should wait until the missing operational control categories are supplied.',
  };
}

export const FIREWALL_RULE_GENERATION_POLICY_CONTRACT: GenerationPolicyContract = {
  schema_version: 'generation_policy_contract.v1',
  source: 'frontend_generate_proxy',
  applies_to: 'network_firewall_rule',
  instructions: [
    {
      key: 'preserve_user_controls',
      text: 'Preserve operational controls explicitly stated by the user, including rule name, environment, source, destination, protocol, port, change window, rollback, and validation.',
    },
    {
      key: 'do_not_block_on_provided_controls',
      text: 'Do not convert already-provided operational controls into blockers or missing information.',
    },
    {
      key: 'ground_blockers_only',
      text: 'Do not invent extra blockers, systems, remediation actions, owners, or dependencies unless they are grounded in the request or supplied grounding_evidence.',
    },
    {
      key: 'approved_change_window_is_evidence',
      text: 'Treat the phrase "approved change window CHG-####" as approval evidence for that change window, not as missing approval.',
    },
    {
      key: 'policy_access_is_prerequisite',
      text: 'Firewall policy access and policy target verification are normal execution prerequisites; do not classify them as readiness blockers when required rule controls are present.',
    },
  ],
  examples: [
    {
      label: 'positive_fully_grounded_firewall_rule',
      input:
        'Create the approved DC-West firewall rule MIG-APP-443 to allow 10.20.10.0/24 to 10.40.5.25 on TCP 443 during approved change window CHG-7821; rollback is to remove the rule; validate with connectivity test and firewall logs.',
      expected: {
        readiness_status: 'Execution-ready',
        proceed_decision: 'yes',
        governance_execution_status: 'ready',
        proceed_prohibited: false,
        blocked_until_summary: 'None for current proceed scope',
        invalid_or_unsupported_ticket: false,
        missing_readiness_controls: [],
        execution_prerequisites_are_blockers: false,
      },
    },
    {
      label: 'negative_missing_rollback',
      input:
        'Create firewall rule APP-DNS-53 from 10.1.0.0/24 to dns.example.com using UDP 53 during approved change window CHG-9001.',
      expected: {
        readiness_status: 'Not execution-ready',
        proceed_decision: 'no',
        governance_execution_status: 'blocked',
        proceed_prohibited: true,
        blocked_until_summary: 'Missing required operational controls: rollback',
        invalid_or_unsupported_ticket: false,
        missing_readiness_controls: ['rollback'],
        execution_prerequisites_are_blockers: false,
      },
    },
  ],
};

export const RDS_BACKUP_GENERATION_POLICY_CONTRACT: GenerationPolicyContract = {
  schema_version: 'generation_policy_contract.v1',
  source: 'frontend_generate_proxy',
  applies_to: 'aws_rds_backup',
  instructions: [
    {
      key: 'preserve_user_controls',
      text: 'Preserve user-provided RDS backup controls exactly as requested, including target, window, retention, KMS, monitoring, validation, rollback, and approval.',
    },
    {
      key: 'keyword_controls_are_grounded',
      text: 'When the user supplies shorthand control keywords, treat those keywords as grounded requirements and do not rewrite them as missing information.',
    },
    {
      key: 'do_not_invent_approval_gaps',
      text: 'If the request explicitly mentions approval or window, do not add invented approval blockers or claim the approval requirement was omitted.',
    },
    {
      key: 'do_not_block_on_provided_controls',
      text: 'Do not convert already-provided RDS backup controls into blockers, missing details, or ungrounded remediation steps.',
    },
    {
      key: 'normal_prereqs_are_not_blockers',
      text: 'Routine RDS access and scope verification are normal execution prerequisites; do not classify them as readiness blockers when the requested backup controls are present.',
    },
  ],
  examples: [
    {
      label: 'positive_keyword_grounded_rds_backup',
      input: 'RDS backups with target, window, retention, KMS, monitoring, validation, rollback, approval',
      expected: {
        readiness_status: 'Execution-ready',
        proceed_decision: 'yes',
        governance_execution_status: 'ready',
        proceed_prohibited: false,
        blocked_until_summary: 'None for current proceed scope',
        invalid_or_unsupported_ticket: false,
        missing_readiness_controls: [],
        execution_prerequisites_are_blockers: false,
      },
    },
    {
      label: 'negative_missing_rollback_and_validation',
      input: 'RDS backups with target, window, retention, KMS, monitoring, approval',
      expected: {
        readiness_status: 'Not execution-ready',
        proceed_decision: 'no',
        governance_execution_status: 'blocked',
        proceed_prohibited: true,
        blocked_until_summary: 'Missing required RDS backup controls: validation, rollback',
        invalid_or_unsupported_ticket: false,
        missing_readiness_controls: ['validation', 'rollback'],
        execution_prerequisites_are_blockers: false,
      },
    },
  ],
};

export const GENERIC_ENGINEERING_GENERATION_POLICY_CONTRACT: GenerationPolicyContract = {
  schema_version: 'generation_policy_contract.v1',
  source: 'frontend_generate_proxy',
  applies_to: 'engineering_operational_change',
  instructions: [
    {
      key: 'preserve_user_controls',
      text: 'Preserve operational controls explicitly stated by the user across engineering domains, including target, access, dependencies, window, approval, rollback, validation, monitoring, retention, and KMS or encryption.',
    },
    {
      key: 'keyword_controls_are_grounded',
      text: 'When the user provides shorthand operational-control keywords, treat those keywords as grounded requirements rather than missing information.',
    },
    {
      key: 'do_not_invent_approval_gaps',
      text: 'If the request explicitly mentions approval or a window, do not add invented approval blockers or claim those controls were omitted.',
    },
    {
      key: 'do_not_block_on_provided_controls',
      text: 'Do not convert already-provided operational controls into blockers, missing details, or ungrounded remediation steps.',
    },
    {
      key: 'normal_prereqs_are_not_blockers',
      text: 'Routine access verification and target-scope checks are normal execution prerequisites; do not classify them as readiness blockers when the request already supplies the required operational controls.',
    },
  ],
  examples: [
    {
      label: 'positive_generic_engineering_controls',
      input: 'Deploy ECS service with target, window, approval, rollback, validation, monitoring',
      expected: {
        readiness_status: 'Execution-ready',
        proceed_decision: 'yes',
        governance_execution_status: 'ready',
        proceed_prohibited: false,
        blocked_until_summary: 'None for current proceed scope',
        invalid_or_unsupported_ticket: false,
        missing_readiness_controls: [],
        execution_prerequisites_are_blockers: false,
      },
    },
    {
      label: 'negative_missing_generic_controls',
      input: 'Deploy ECS service with target, rollback, monitoring',
      expected: {
        readiness_status: 'Not execution-ready',
        proceed_decision: 'no',
        governance_execution_status: 'blocked',
        proceed_prohibited: true,
        blocked_until_summary: 'Missing required operational controls: window, approval, validation',
        invalid_or_unsupported_ticket: false,
        missing_readiness_controls: ['window', 'approval', 'validation'],
        execution_prerequisites_are_blockers: false,
      },
    },
  ],
};

function extractFirewallRuleGroundingEvidence(taskInput?: string | null): FirewallRuleGroundingEvidence | null {
  const input = normalizeSpaces(String(taskInput || ''));
  if (!input) return null;
  if (!/\bfirewall\s+rule\b/i.test(input)) return null;

  const action = extractAction(input);
  const ruleName =
    firstMatch(input, /\bfirewall rule\s+([A-Z0-9][A-Z0-9_-]{2,})\b/i) ||
    firstMatch(input, /\brule\s+([A-Z0-9][A-Z0-9_-]{2,})\b/i);
  const environment = firstMatch(input, /\bapproved\s+([A-Z0-9_-]+)\s+firewall rule\b/i);
  const sourceAddress =
    firstMatch(input, new RegExp(`\\b(?:allow|from)\\s+${ENDPOINT}\\s+(?:to|->)\\b`, 'i')) ||
    firstMatch(input, new RegExp(`\\bfrom\\s+${ENDPOINT}\\s+(?:on|over|using|during)\\b`, 'i')) ||
    firstMatch(input, new RegExp(`\\bsource\\s+(?:is\\s+)?${ENDPOINT}\\b`, 'i'));
  const destinationAddress =
    firstMatch(input, new RegExp(`\\bto\\s+${ENDPOINT}\\b`, 'i')) ||
    firstMatch(input, new RegExp(`\\bdestination\\s+(?:is\\s+)?${ENDPOINT}\\b`, 'i'));
  const { protocol, port } = extractProtocolPort(input);

  const base = {
    schema_version: 'grounding_evidence.v1' as const,
    source: 'frontend_generate_proxy' as const,
    domain: 'network_firewall_rule' as const,
    confidence: 'low' as const,
    action,
    object_type: 'firewall_rule' as const,
    rule_name: ruleName || undefined,
    environment: environment || undefined,
    source_address: sourceAddress || undefined,
    destination_address: destinationAddress || undefined,
    protocol,
    port,
    change_window: extractChangeWindow(input),
    rollback: extractRollback(input),
    validation: extractValidation(input),
  };
  const controls = controlPresence(base);

  return {
    ...base,
    confidence: confidenceFor(controls.present_controls),
    ...controls,
    execution_prerequisites: executionPrerequisites(base),
    classification_guidance: {
      block_on_missing_readiness_controls: controls.missing_readiness_controls.length > 0,
      treat_execution_prerequisites_as_missing_information: false,
    },
    readiness_classification: readinessClassification(controls.missing_readiness_controls),
  };
}

function extractRdsBackupGroundingEvidence(taskInput?: string | null): RdsBackupGroundingEvidence | null {
  const input = normalizeSpaces(String(taskInput || ''));
  if (!input) return null;
  if (!/\brds\b/i.test(input) || !/\bbackup(?:s)?\b/i.test(input)) return null;

  const controls = extractRdsBackupControls(input);
  const base = {
    schema_version: 'grounding_evidence.v1' as const,
    source: 'frontend_generate_proxy' as const,
    domain: 'aws_rds_backup' as const,
    confidence: 'low' as const,
    action: extractRdsBackupAction(input),
    object_type: 'rds_backup' as const,
    ...controls,
  };
  const presence = rdsControlPresence(base);

  return {
    ...base,
    confidence: rdsConfidenceFor(presence.present_controls),
    ...presence,
    execution_prerequisites: rdsExecutionPrerequisites(base.target),
    classification_guidance: {
      block_on_missing_readiness_controls: presence.missing_readiness_controls.length > 0,
      treat_execution_prerequisites_as_missing_information: false,
    },
    readiness_classification: rdsReadinessClassification(presence.missing_readiness_controls),
  };
}

function extractGenericEngineeringGroundingEvidence(taskInput?: string | null): GenericEngineeringGroundingEvidence | null {
  const input = normalizeSpaces(String(taskInput || ''));
  if (!input || !isEngineeringRelatedInput(input)) return null;

  const controls = extractGenericEngineeringControls(input);
  const base = {
    schema_version: 'grounding_evidence.v1' as const,
    source: 'frontend_generate_proxy' as const,
    domain: 'engineering_operational_change' as const,
    confidence: 'low' as const,
    action: extractGenericEngineeringAction(input),
    object_type: 'engineering_change' as const,
    ...controls,
  };
  const presence = genericEngineeringControlPresence(base);
  if (presence.present_controls.length < 2) return null;

  return {
    ...base,
    confidence: genericEngineeringConfidenceFor(
      presence.present_controls,
      presence.missing_readiness_controls
    ),
    ...presence,
    execution_prerequisites: genericEngineeringExecutionPrerequisites(base.target),
    classification_guidance: {
      block_on_missing_readiness_controls: presence.missing_readiness_controls.length > 0,
      treat_execution_prerequisites_as_missing_information: false,
    },
    readiness_classification: genericEngineeringReadinessClassification(
      presence.missing_readiness_controls
    ),
  };
}

export function extractGroundingEvidence(taskInput?: string | null): GroundingEvidence | null {
  return (
    extractFirewallRuleGroundingEvidence(taskInput) ||
    extractRdsBackupGroundingEvidence(taskInput) ||
    extractGenericEngineeringGroundingEvidence(taskInput)
  );
}

export function addGroundingEvidenceToGeneratePayload(payload: GeneratePayload): GeneratePayload {
  const taskInput = typeof payload.task_input === 'string' ? payload.task_input : '';
  const groundingEvidence = extractGroundingEvidence(taskInput);
  if (!groundingEvidence) return payload;

  const generationPolicyContract =
    groundingEvidence.domain === 'aws_rds_backup'
      ? RDS_BACKUP_GENERATION_POLICY_CONTRACT
      : groundingEvidence.domain === 'engineering_operational_change'
        ? GENERIC_ENGINEERING_GENERATION_POLICY_CONTRACT
        : FIREWALL_RULE_GENERATION_POLICY_CONTRACT;

  return {
    ...payload,
    grounding_evidence: groundingEvidence,
    generation_policy_contract: generationPolicyContract,
  };
}
