# Wave Candidate Ranking

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document ranks LucidSpec's workflow-expansion candidates so deterministic support grows in a sequence that is both strategic and safe.

## Ranking dimensions

Each workflow is ranked across four dimensions:

- strategic value
- adjacency to current support
- reuse potential
- trust sensitivity

## Scoring model

For planning simplicity:

- high = 3
- medium = 2
- low = 1

Trust sensitivity increases implementation care, but it does not automatically reduce strategic priority.
It means the workflow needs stronger policy, clearer downgrade behavior, and better tests before promotion.

## Ranked expansion candidates

| Rank | Workflow | Strategic value | Adjacency | Reuse potential | Trust sensitivity | Why it belongs here |
|---|---|---|---|---|---|---|
| 1 | `firewall_rule_change` | high | high | high | high | already partial today, strong family reuse, high customer value |
| 2 | `iam_access_request` | high | high | high | high | already partial today and foundational for identity-access coverage |
| 3 | `cloudtrail_logging_retention` | high | high | high | high | already partial today and naturally extends the logging family |
| 4 | `software_bug_fix` | high | medium | medium | medium | already partial today and important for software-delivery credibility |
| 5 | `vmware_cluster_change` | medium | medium | high | high | already partial today and opens platform-infrastructure family growth |
| 6 | `security_group_update` | high | high | high | high | strongest new workflow next to firewall-rule patterns |
| 7 | `role_assumption_change` | high | high | high | high | strongest new workflow next to IAM-access patterns |
| 8 | `service_account_access` | high | high | high | high | strong identity-access reuse and common real-world need |
| 9 | `monitoring_alert_change` | medium | high | high | medium | close to cloudwatch-alarm logic and likely straightforward to extend |
| 10 | `restore_validation` | high | medium | high | high | strategically important because it turns backup coverage into trustable recovery coverage |
| 11 | `terraform_module_change` | high | medium | high | high | strong infrastructure reuse and good execution-oriented specificity |
| 12 | `ecs_deployment` | high | high | high | high | strategically valuable but operationally risky, so it needs strong controls |
| 13 | `snapshot_policy_update` | medium | high | high | high | good backup-recovery adjacency and likely clean policy reuse |
| 14 | `siem_onboarding` | high | medium | high | high | valuable bridge between logging and compliance, but more complex validation |
| 15 | `sso_policy_change` | high | medium | medium | high | useful identity workflow with more complex approvals and blast radius |
| 16 | `veeam_job_setup` | medium | medium | high | high | useful backup workflow with strong family reuse |
| 17 | `retention_policy_change` | medium | medium | high | medium | useful cross-cutting retention semantics and moderate complexity |
| 18 | `load_balancer_policy_change` | medium | medium | medium | high | useful but less adjacent than firewall and security-group changes |
| 19 | `log_forwarding_change` | medium | medium | high | high | solid logging reuse, but slightly less urgent than alerting and CloudTrail |
| 20 | `tagging_control_remediation` | medium | medium | high | medium | best early compliance workflow because it is more concrete than broad policy remediation |
| 21 | `storage_provisioning` | medium | medium | medium | high | useful platform case, but can become broad quickly |
| 22 | `deployment_workflow_change` | high | medium | medium | medium | strategically useful but wording can become too broad unless tightly constrained |
| 23 | `s3_lifecycle_policy` | medium | medium | high | medium | good backup/retention reuse but not as urgent as restore or snapshots |
| 24 | `dns_failover_change` | medium | medium | medium | high | operationally sensitive and should come after stronger network-security maturity |
| 25 | `server_build` | medium | medium | medium | medium | useful but easier to broaden into generic provisioning requests |
| 26 | `ci_cd_pipeline_change` | high | medium | high | medium | important, but broad enough that it should follow stronger software-delivery routing rules |
| 27 | `audit_control_fix` | medium | low | medium | high | valuable but better after concrete execution-oriented families mature |
| 28 | `evidence_gap_remediation` | medium | low | medium | high | often mixed with planning/governance language, so needs careful boundary work |
| 29 | `policy_enforcement_change` | medium | low | medium | high | too easy to over-route early and should follow stronger compliance family controls |
| 30 | `config_change` | medium | medium | medium | medium | too broad as named and should not be promoted aggressively without subtype boundaries |

## Recommended wave structure

### Wave 1: Promote what already exists

Wave 1 should focus on the current Tier 3 workflows:

- `firewall_rule_change`
- `iam_access_request`
- `cloudtrail_logging_retention`
- `software_bug_fix`
- `vmware_cluster_change`

Why:

- partial logic already exists
- regression coverage already exists
- these workflows are the lowest-risk path to broader deterministic credibility

### Wave 2: Add the strongest adjacent new workflows

Wave 2 should focus on:

- `security_group_update`
- `role_assumption_change`
- `service_account_access`
- `monitoring_alert_change`
- `restore_validation`
- `terraform_module_change`

Why:

- these are highly adjacent to families that Wave 1 will strengthen
- they maximize reuse rather than introducing isolated new logic

### Wave 3: Add strategically important but more complex workflows

Wave 3 should focus on:

- `ecs_deployment`
- `snapshot_policy_update`
- `siem_onboarding`
- `sso_policy_change`
- `veeam_job_setup`
- `retention_policy_change`
- `load_balancer_policy_change`
- `log_forwarding_change`
- `tagging_control_remediation`

Why:

- these matter, but they need stronger family foundations first

### Wave 4: Add the broadest or most ambiguity-prone workflows last

Wave 4 should focus on:

- `storage_provisioning`
- `deployment_workflow_change`
- `s3_lifecycle_policy`
- `dns_failover_change`
- `server_build`
- `ci_cd_pipeline_change`
- `audit_control_fix`
- `evidence_gap_remediation`
- `policy_enforcement_change`
- `config_change`

Why:

- these workflows are either broad, highly sensitive, or easy to over-route without mature family controls

## Ranking takeaway

The ranking confirms a simple principle:

LucidSpec should earn breadth through adjacency.

The strongest next move is to turn existing partial workflows into direct deterministic coverage, then add new workflows that clearly inherit the same policy patterns.

## Day 4 conclusion

The wave ranking creates a safe expansion sequence.

It protects the working logic you already have while making sure the next workflows added are the ones most likely to increase credibility, reuse, and defensibility.
