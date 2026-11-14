# Workflow Family Map

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document groups the current and target LucidSpec workflows into deterministic families.

Its job is to prevent one-off workflow growth by making family structure explicit before implementation expands.

## Family map

### `cloud_operations`

Current direct workflow:

- `ec2_patching`

Target workflows:

- `ecs_deployment`

Family notes:

- strong AWS operational adjacency
- high reuse around environment, target resource, rollout window, validation, and rollback expectations
- strong candidate family for early structured expansion

### `network_security`

Current partial workflow:

- `firewall_rule_change`

Target workflows:

- `security_group_update`
- `load_balancer_policy_change`
- `dns_failover_change`

Family notes:

- high trust sensitivity
- strong shared controls around source, destination, protocol, scope, approvals, rollback, and validation
- one of the best families for policy reuse once firewall change support is upgraded

### `platform_infrastructure`

Current partial workflow:

- `vmware_cluster_change`

Target workflows:

- `storage_provisioning`
- `server_build`
- `terraform_module_change`

Family notes:

- strong reuse around target platform, owner, dependency coordination, rollout window, recovery, and validation
- can drift into broad ambiguous infrastructure requests if routing is not kept narrow

### `backup_recovery`

Current direct workflow:

- `rds_backup`

Target workflows:

- `s3_lifecycle_policy`
- `veeam_job_setup`
- `restore_validation`
- `retention_policy_change`
- `snapshot_policy_update`

Family notes:

- strong reuse around asset, schedule, retention, encryption, recovery path, and restore validation
- one of the clearest families for reuse-led deterministic expansion

### `software_delivery`

Current partial workflow:

- `software_bug_fix`

Target workflows:

- `ci_cd_pipeline_change`
- `deployment_workflow_change`
- `config_change`

Family notes:

- useful strategic family but prone to broad phrasing and ambiguous execution scope
- needs especially careful routing boundaries to avoid overclaiming support

### `identity_access`

Current partial workflow:

- `iam_access_request`

Target workflows:

- `role_assumption_change`
- `sso_policy_change`
- `service_account_access`

Family notes:

- high trust and approval sensitivity
- strong shared controls around scope, approver, least-privilege rationale, expiry, and validation
- excellent reuse candidate once current IAM partial support is promoted

### `logging_monitoring`

Current direct workflow:

- `cloudwatch_alarm`

Current partial workflow:

- `cloudtrail_logging_retention`

Target workflows:

- `siem_onboarding`
- `monitoring_alert_change`
- `log_forwarding_change`

Family notes:

- one of the strongest expansion families because it already has one direct workflow and one partial workflow
- strong reuse around source system, destination, retention, alerting target, validation, and ownership

### `compliance_remediation`

Current workflows:

- no direct or partial workflow verified yet in the current support boundary

Target workflows:

- `audit_control_fix`
- `evidence_gap_remediation`
- `policy_enforcement_change`
- `tagging_control_remediation`

Family notes:

- strategically useful but easier to overstate because requests often blur planning, governance, and execution
- should likely start with concrete execution workflows before broader family claims

## Family maturity view

| Family | Current maturity | Why |
|---|---|---|
| `logging_monitoring` | strongest | already has one direct workflow and one partial workflow |
| `backup_recovery` | strong | has one direct workflow and clear shared operational controls |
| `cloud_operations` | strong but narrow | one direct workflow today and clear AWS adjacency |
| `network_security` | promising | strong partial workflow and high reuse potential |
| `identity_access` | promising | strong partial workflow and clear trust-sensitive controls |
| `platform_infrastructure` | emerging | one partial workflow and useful policy reuse patterns |
| `software_delivery` | emerging but broad | partial support exists, but routing boundaries need care |
| `compliance_remediation` | early | no current verified direct or partial workflow in support boundary |

## Recommended family expansion order

1. `logging_monitoring`
2. `backup_recovery`
3. `network_security`
4. `identity_access`
5. `cloud_operations`
6. `platform_infrastructure`
7. `software_delivery`
8. `compliance_remediation`

## Why this order is safest

This order favors:

- reuse of existing deterministic controls
- adjacency to already-working workflows
- clearer operational semantics
- lower risk of false precision during early expansion

It intentionally avoids starting with the broadest and most easily over-routed families.

## Day 4 conclusion

The family map shows that LucidSpec should expand by strengthening a few dense families first, not by scattering support across unrelated workflows.

That is what turns the deterministic layer into a reusable policy system instead of a collection of isolated workflow branches.
