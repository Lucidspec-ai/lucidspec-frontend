# Shared Controls vs Overlay Rules

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the boundary between family-level shared controls and workflow-level overlays.

Its purpose is to prevent duplication and stop future deterministic expansion from turning into a large set of workflow-specific branches.

## Core rule

Put a rule in family policy when it is meaningfully reusable across multiple workflows in the same family.

Put a rule in a workflow overlay when it is specific enough that generalizing it would either:

- create false requirements for sibling workflows
- weaken trust
- hide a workflow-specific risk

## What belongs in shared family controls

Family policy should own:

- shared required-fact categories
- shared approval expectations
- shared validation patterns
- shared rollback/recovery posture
- shared safe-prework defaults
- shared trust constraints
- shared downgrade patterns for the family

## What must remain overlay-only

Workflow overlays should own:

- workflow-specific required facts
- workflow-specific conditional approvals
- workflow-specific validation evidence details
- workflow-specific rollback triggers or exceptions
- workflow-specific trust constraints
- workflow-specific downgrade triggers

## Decision test

Before adding any new rule, ask:

1. Would this same rule apply to at least two workflows in the family?
2. Would applying it broadly improve consistency without creating false blockers?
3. Would keeping it in the family reduce duplication?

If the answer is yes to all three, it belongs in family policy.

If not, it likely belongs in an overlay.

## Overlay-only examples by family

### `cloud_operations`

Keep overlay-only:

- workload-specific health checks
- service-specific rollback mechanics
- service-specific deployment sequencing
- service-specific approval triggers tied to one platform

Examples:

- `ec2_patching`: pre-patch image or host-specific rollback conditions
- `ecs_deployment`: task definition, service rollout, or cutover-specific checks

### `network_security`

Keep overlay-only:

- workflow-specific access-object details
- workflow-specific validation path differences
- special approval triggers for especially sensitive exposure types

Examples:

- `firewall_rule_change`: exact firewall object semantics
- `security_group_update`: AWS security-group-specific scope fields
- `dns_failover_change`: failover timing and route-health specifics

### `platform_infrastructure`

Keep overlay-only:

- platform-specific capacity parameters
- vendor/tool-specific state expectations
- infrastructure-type-specific recovery procedures

Examples:

- `vmware_cluster_change`: cluster/vSAN/network specifics
- `terraform_module_change`: plan/apply, state, and module-version specifics
- `server_build`: image/build-template-specific details

### `backup_recovery`

Keep overlay-only:

- workflow-specific retention conditions
- workflow-specific restore/proof requirements
- tool-specific encryption or snapshot semantics

Examples:

- `rds_backup`: RDS snapshot/backup policy specifics
- `restore_validation`: restore-proof and success-criteria specifics
- `snapshot_policy_update`: policy-object-specific schedule/retention differences

### `software_delivery`

Keep overlay-only:

- application-specific deployment paths
- workflow-specific validation artifacts
- rollout strategy specifics such as canary/blue-green/sequencing rules

Examples:

- `software_bug_fix`: code-fix scope and deployment target specifics
- `ci_cd_pipeline_change`: pipeline-stage and automation specifics
- `deployment_workflow_change`: release-process-specific conditions

### `identity_access`

Keep overlay-only:

- entitlement-model specifics
- workflow-specific approver combinations
- special expiry/review logic tied to one access type

Examples:

- `iam_access_request`: IAM policy/scope specifics
- `role_assumption_change`: assumption path and trust-policy specifics
- `service_account_access`: non-human identity control specifics

### `logging_monitoring`

Keep overlay-only:

- metric- or tool-specific signal semantics
- destination-specific delivery details
- workflow-specific retention or alarm tuning controls

Examples:

- `cloudwatch_alarm`: metric, threshold, window, and notification specifics
- `cloudtrail_logging_retention`: trail/log retention and destination specifics
- `siem_onboarding`: integration destination and parsing/onboarding specifics

### `compliance_remediation`

Keep overlay-only:

- control-specific evidence rules
- enforcement-mechanism specifics
- remediation closure criteria tied to one control type

Examples:

- `tagging_control_remediation`: tagging-rule specifics
- `policy_enforcement_change`: enforcement mechanism specifics
- `audit_control_fix`: control-test and evidence specifics

## Boundary matrix

| Policy area | Shared family control | Overlay-only |
|---|---|---|
| Required facts | broad categories reused across workflows | exact fact names/conditions unique to one workflow |
| Approvals | default family expectation | special approver logic or workflow-specific approval exception |
| Validation | default validation posture | exact proof artifact, threshold, or success criteria |
| Rollback/recovery | family-level fallback expectation | service/tool/workflow-specific recovery mechanics |
| Safe prework | broad early actions allowed before execution | workflow-specific early work constraints |
| Trust constraints | shared anti-invention limits for the family | workflow-specific trust edge cases |
| Downgrade behavior | family-wide ambiguity patterns | workflow-specific downgrade trigger |

## Anti-duplication rules

- do not restate family required facts inside every overlay
- do not restate family approval defaults inside overlays unless the workflow changes them
- do not duplicate family trust constraints unless the workflow adds a new specific constraint
- if an overlay duplicates family logic, document the reason explicitly

## Escalation rule

If multiple overlays in the same family start repeating the same exception, promote that rule upward into family policy in the next policy revision.

That is the signal that the rule is no longer truly workflow-specific.

## Example boundary decisions

### Example 1: backup family retention expectation

Family-level:

- backup/recovery workflows usually need retention information

Overlay-only:

- the exact retention rule format or threshold for one backup technology

### Example 2: identity approval requirement

Family-level:

- access changes generally require named approver evidence

Overlay-only:

- a specific workflow requiring a second security approver or expiry under a shorter duration

### Example 3: monitoring validation

Family-level:

- monitoring/logging changes require signal-path validation

Overlay-only:

- exact threshold/window behavior for a CloudWatch alarm

## Implementation consequence

When LucidSpec adds a new workflow, the implementation sequence should be:

1. inherit family controls
2. add only workflow-specific differences in the overlay
3. test that the overlay did not silently redefine family semantics

## Day 5 conclusion

LucidSpec will stay maintainable only if overlays remain thin.

This boundary document is what keeps family policy reusable and prevents the deterministic layer from drifting back into one-off workflow logic.
