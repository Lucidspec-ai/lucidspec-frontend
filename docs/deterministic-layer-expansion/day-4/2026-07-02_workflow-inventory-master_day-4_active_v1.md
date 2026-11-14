# Workflow Inventory Master

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document is the planning inventory for LucidSpec's deterministic workflow expansion.

It combines:

- current verified workflow support
- target workflows from the deterministic expansion specification
- workflow family assignment
- current and target support tiers
- known partial logic status
- known regression-coverage status
- planning priority signals

## Inventory rules

- "Current support tier" reflects verified backend reality today, not desired positioning
- "Target support tier" reflects the intended deterministic end state for that named workflow
- "Partial logic exists" means there is already meaningful extraction, family policy, overlay, or regression scaffolding
- "Regression coverage" means there is already verified test or regression-pack evidence in the backend

## Workflow inventory

| Workflow | Family | Current support tier | Target support tier | Partial logic exists | Regression coverage | Strategic value | Adjacency to current support | Reuse potential | Trust sensitivity | Current status notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `rds_backup` | `backup_recovery` | Tier 1 | Tier 1 | yes | yes | high | high | high | high | one of the current direct pilot workflows |
| `cloudwatch_alarm` | `logging_monitoring` | Tier 1 | Tier 1 | yes | yes | high | high | high | medium | one of the current direct pilot workflows |
| `ec2_patching` | `cloud_operations` | Tier 1 | Tier 1 | yes | yes | high | high | medium | high | one of the current direct pilot workflows |
| `firewall_rule_change` | `network_security` | Tier 3 | Tier 1 | yes | yes | high | high | high | high | partial support only today, but already has extraction and regression signals |
| `iam_access_request` | `identity_access` | Tier 3 | Tier 1 | yes | yes | high | high | high | high | partial support only today, trust-sensitive and strong adjacency candidate |
| `cloudtrail_logging_retention` | `logging_monitoring` | Tier 3 | Tier 1 | yes | yes | high | high | high | high | partial support only today and close to existing monitoring/logging logic |
| `vmware_cluster_change` | `platform_infrastructure` | Tier 3 | Tier 1 | yes | yes | medium | medium | high | high | partial support only today and useful for platform family expansion |
| `software_bug_fix` | `software_delivery` | Tier 3 | Tier 1 | yes | yes | high | medium | medium | medium | partial support only today and useful for software-delivery expansion |
| `ecs_deployment` | `cloud_operations` | Tier 4 | Tier 1 | no | no | high | high | high | high | new target workflow and operationally adjacent to current AWS support |
| `s3_lifecycle_policy` | `backup_recovery` | Tier 4 | Tier 1 | no | no | medium | medium | high | medium | good family reuse with retention and lifecycle controls |
| `security_group_update` | `network_security` | Tier 4 | Tier 1 | no | no | high | high | high | high | directly adjacent to firewall-rule support patterns |
| `load_balancer_policy_change` | `network_security` | Tier 4 | Tier 1 | no | no | medium | medium | medium | high | useful but less direct than firewall and security-group change coverage |
| `dns_failover_change` | `network_security` | Tier 4 | Tier 1 | no | no | medium | medium | medium | high | change-risky and needs careful rollback semantics |
| `storage_provisioning` | `platform_infrastructure` | Tier 4 | Tier 1 | no | no | medium | medium | medium | high | broad infrastructure workflow with family reuse but moderate ambiguity risk |
| `server_build` | `platform_infrastructure` | Tier 4 | Tier 1 | no | no | medium | medium | medium | medium | useful, but can drift into broad provisioning ambiguity if not scoped tightly |
| `terraform_module_change` | `platform_infrastructure` | Tier 4 | Tier 1 | no | no | high | medium | high | high | strong reuse candidate across policy, validation, and rollback patterns |
| `veeam_job_setup` | `backup_recovery` | Tier 4 | Tier 1 | no | no | medium | medium | high | high | useful backup family extension with restore and retention overlap |
| `restore_validation` | `backup_recovery` | Tier 4 | Tier 1 | no | no | high | medium | high | high | strategically important because it validates whether backup workflows are trustworthy |
| `retention_policy_change` | `backup_recovery` | Tier 4 | Tier 1 | no | no | medium | medium | high | medium | strong reuse around retention semantics across backup workflows |
| `snapshot_policy_update` | `backup_recovery` | Tier 4 | Tier 1 | no | no | medium | high | high | high | close to existing backup concepts and likely a clean extension candidate |
| `ci_cd_pipeline_change` | `software_delivery` | Tier 4 | Tier 1 | no | no | high | medium | high | medium | useful but can be broad unless tightly scoped to execution target |
| `deployment_workflow_change` | `software_delivery` | Tier 4 | Tier 1 | no | no | high | medium | medium | medium | strategically useful but semantics can become diffuse without strong boundaries |
| `config_change` | `software_delivery` | Tier 4 | Tier 2 | no | no | medium | medium | medium | medium | too broad for direct Tier 1 without tighter subtype boundaries |
| `role_assumption_change` | `identity_access` | Tier 4 | Tier 1 | no | no | high | high | high | high | closely adjacent to IAM access request semantics |
| `sso_policy_change` | `identity_access` | Tier 4 | Tier 1 | no | no | high | medium | medium | high | strong identity family candidate but approval semantics can be complex |
| `service_account_access` | `identity_access` | Tier 4 | Tier 1 | no | no | high | high | high | high | good reuse with scope, expiry, ownership, and least-privilege rules |
| `siem_onboarding` | `logging_monitoring` | Tier 4 | Tier 1 | no | no | high | medium | high | high | useful observability/compliance bridge with meaningful validation needs |
| `monitoring_alert_change` | `logging_monitoring` | Tier 4 | Tier 1 | no | no | medium | high | high | medium | adjacent to cloudwatch-alarm patterns and likely clean to extend |
| `log_forwarding_change` | `logging_monitoring` | Tier 4 | Tier 1 | no | no | medium | medium | high | high | useful for destination, retention, and validation reuse |
| `audit_control_fix` | `compliance_remediation` | Tier 4 | Tier 2 | no | no | medium | low | medium | high | important but likely better to start at family-level support first |
| `evidence_gap_remediation` | `compliance_remediation` | Tier 4 | Tier 2 | no | no | medium | low | medium | high | valuable, but often planning-heavy and can blur execution boundary |
| `policy_enforcement_change` | `compliance_remediation` | Tier 4 | Tier 2 | no | no | medium | low | medium | high | useful but wide scope and easy to over-route too early |
| `tagging_control_remediation` | `compliance_remediation` | Tier 4 | Tier 1 | no | no | medium | medium | high | medium | best concrete first workflow inside compliance remediation |

## Current-state summary

### Tier 1 today

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

### Tier 3 today

- `firewall_rule_change`
- `iam_access_request`
- `cloudtrail_logging_retention`
- `vmware_cluster_change`
- `software_bug_fix`

### Tier 4 today

All other target workflows in this inventory are future candidates and should currently be treated as not yet covered by strong deterministic routing.

## Inventory observations

### Strongest near-term upgrade set

The best immediate upgrade candidates are the current Tier 3 workflows because they already have:

- some extraction coverage
- family-policy adjacency
- regression-pack evidence
- operational relevance

That set is:

- `firewall_rule_change`
- `iam_access_request`
- `cloudtrail_logging_retention`
- `vmware_cluster_change`
- `software_bug_fix`

### Highest-reuse new additions

The best new workflows for policy reuse are:

- `security_group_update`
- `role_assumption_change`
- `service_account_access`
- `restore_validation`
- `terraform_module_change`
- `monitoring_alert_change`

### Highest trust-sensitivity workflows

The workflows that most need careful deterministic rollout are:

- `firewall_rule_change`
- `iam_access_request`
- `cloudtrail_logging_retention`
- `ecs_deployment`
- `security_group_update`
- `dns_failover_change`
- `restore_validation`
- `role_assumption_change`
- `service_account_access`
- `siem_onboarding`

## Planning implication

LucidSpec should not treat every target workflow as equal.

The right sequence is:

1. promote current Tier 3 workflows
2. add high-adjacency workflows that reuse existing policy patterns
3. introduce broader families only after family-level controls are stable

## Day 4 conclusion

The workflow inventory shows that LucidSpec already has a meaningful expansion base.

The fastest safe path is not to jump randomly into new domains. It is to convert today's partial workflows into direct deterministic coverage and then expand outward through the adjacent families they unlock.
