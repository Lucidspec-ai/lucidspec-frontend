# Verified Support Boundary

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document records the verified backend workflow-support boundary at the start of deterministic-layer expansion.

This document should be treated as the current source of truth for Day 1 planning.

## Verified direct deterministic workflow support

These are the only workflows the backend currently allows the pilot classifier to route directly from arbitrary raw user input:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

Verified sources:
- `/Users/lavanya/lucidspec_backend/docs/WORKFLOW_SUPPORT_BOUNDARY_V1.md`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/extraction/workflow_classifier.py`

## Verified partial-support workflows

These workflows already have meaningful family rules, extraction coverage, or regression packs, but are not yet direct raw-input pilot coverage:

- `firewall_rule_change`
- `iam_access_request`
- `cloudtrail_logging_retention`
- `vmware_cluster_change`
- `software_bug_fix`

Implication:
- these workflows are not unsupported
- but they should not currently be marketed or treated as equal to direct deterministic coverage

## Verified unsupported request classes

The backend boundary explicitly treats these as not confidently covered execution workflows:

- `broad_program_governance`
- `non_technical_project_brief`
- `presentation_or_training_content`
- `vendor_selection_or_procurement`
- `meeting_notes_without_a_concrete_execution_target`

## Verified ambiguous cross-domain cases

These are explicitly supposed to downgrade rather than receive false precision:

- `multi_workflow_request`
- `supported_plus_partial_workflow_request`
- `governance_or_planning_request_without_single_execution_target`

## Important interpretation

This support boundary means:

- LucidSpec currently has a meaningful deterministic backend layer
- but direct deterministic routing is intentionally conservative
- broader deterministic expansion should build from this boundary, not ignore it

## Day 1 policy implication

Until the deterministic layer is broadened:

- frontend claims should not imply equal direct deterministic support across all presented engineering domains
- customer messaging should distinguish between broad engineering fit and verified direct deterministic workflow depth
- existing direct workflows must remain regression controls during expansion

## Immediate “do not overclaim” rule

Do not treat the following as currently equivalent:

- broad prompt acceptance
- partial policy coverage
- direct deterministic workflow support

They are not the same thing today.
