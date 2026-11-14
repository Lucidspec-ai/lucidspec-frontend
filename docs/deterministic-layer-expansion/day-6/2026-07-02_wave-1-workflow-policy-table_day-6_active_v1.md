# Wave 1 Workflow Policy Table

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document fully specifies the first deterministic expansion set for LucidSpec.

Wave 1 workflows:

- `firewall_rule_change`
- `cloudtrail_logging_retention`
- `iam_access_request`
- `software_bug_fix`
- `vmware_cluster_change`

## Wave 1 policy table

| Workflow | Family | Current tier | Target tier | Execution-ready required facts | Prework-only required facts | Optional helpful facts | Approval policy | Validation policy | Rollback policy | Safe prework policy | Trust constraints | Common ambiguity cases | Downgrade triggers |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `firewall_rule_change` | `network_security` | Tier 3 | Tier 1 | environment, target/rule identity, source scope, destination scope, protocol, port/service, approval, change window, validation, rollback | enough context to identify policy area or target rule plus explicit review/non-execution intent | business rationale, ticket/change ID, owner, dependency system list | production changes should require explicit approval and change window; ambiguous approval should block or downgrade | validate with connectivity test and firewall logs or equivalent grounded proof | rollback is a hard requirement for execution-ready posture | review current firewall policy, gather exact scopes, confirm requester intent, prepare validation method | never invent CIDRs, ports, protocol, approval, or exposure scope | branch-office traffic with no exact source scope, "usual ports", vague validation, mixed firewall + routing request | missing source scope, port/service, or protocol; ambiguous validation; missing approval/change window for production; multi-rule request |
| `cloudtrail_logging_retention` | `logging_monitoring` | Tier 3 | Tier 1 | environment, target trail/scope, log destination, retention requirement, coverage scope, approval, change window, validation | enough context to review current logging posture plus explicit review/non-execution intent | notification target, account/organization scope detail, owner, encryption/key detail, lifecycle notes | production audit logging changes should require explicit approval and change window | validate by confirming fresh log objects/events appear in destination and coverage behaves as requested | rollback is not a universal hard blocker here; if omitted, do not invent it, but preserve conservative trust wording | review current logging architecture, retention settings, destination path, and approval needs | never invent destination bucket, retention term, coverage scope, approval, or observed logging success | "turn on CloudTrail for prod" with no destination, "retain for auditors" with no duration, planning-only audit discussion | missing log destination, retention requirement, or coverage scope; missing approval/change window for production; narrative/non-execution requests |
| `iam_access_request` | `identity_access` | Tier 3 | Tier 1 | environment/account scope, principal, access scope/target role or account, duration or expiry, approval, validation, rollback | enough context to review current access path plus explicit review/non-execution intent | business rationale, least-privilege note, owner, ticket ID, dataset/resource subset detail | named approval is core; ambiguous or unresolved approval should block or downgrade | validate by confirming intended assume-role/access behavior succeeds and scope is limited as requested | rollback is effectively required: remove or expire the granted access path if validation fails | review current access model, confirm scope, collect approver evidence, prepare expiry/review details | never invent principal, approver, duration, entitlement scope, or least-privilege justification | "give analytics prod access" with no target role/account, "temporary access" with no duration, unclear approver, mixed access + policy redesign request | missing duration/expiry, missing or ambiguous approval, vague target scope, planning/training request, combined access request plus broader IAM architecture discussion |
| `software_bug_fix` | `software_delivery` | Tier 3 | Tier 1 | target service/app, environment, change scope, deployment path, dependencies, approval, change window, validation, rollback | enough context to review current code path/dependencies plus explicit review/non-execution intent | incident/ticket reference, owner, test evidence, schema/migration detail, rollout strategy | production changes should require explicit approval and approved execution lane/window | validate by confirming the bug condition stops and service behavior remains healthy | rollback is a hard requirement for execution-ready production delivery unless a safer equivalent mitigation is explicit | review code path, confirm target service ownership, gather dependencies, line up deployment path and validation | never invent service ownership, deployment path, dependency readiness, approval, or rollback plan | "fix this in prod" with no owning service, "deploy the usual way", mixed bug fix + process coaching, unclear dependency signoff | missing target, deployment path, or dependencies; missing approval/change window for production; generic coaching/process request |
| `vmware_cluster_change` | `platform_infrastructure` | Tier 3 | Tier 1 | environment, target cluster/location, capacity or sizing, network design, storage policy, dependencies, approval, change window, validation, rollback | enough context to review current capacity/dependency inventory plus explicit review/non-execution intent | host profile detail, compute/storage ratios, owner, dependency owner, build sequence detail | production platform build/change should require explicit approval and scheduled window | validate by confirming post-build health such as HA/DRS and dependency readiness | rollback is a hard requirement for execution-ready cluster build/change posture | review current capacity, dependencies, landing-zone/network prerequisites, and build sequencing | never invent cluster target, network design, storage policy, dependencies, approval, or recoverability | "build a new cluster for prod" with no location, no network design, or no storage policy; mixed sizing brainstorm + build request | missing target, network design, storage policy, or dependencies; missing approval/change window for production; planning-only capacity review |

## Cross-workflow observations

### Why these five workflows belong in Wave 1

They all already have:

- extraction support
- family-policy adjacency
- real-world regression-pack coverage
- meaningful partial-readiness behavior

### Shared promotion pattern

All five workflows follow the same basic upgrade path:

1. keep current Tier 3 regression behavior stable
2. make workflow routing explicit from raw input
3. formalize required facts and downgrade triggers
4. promote to Tier 1 only after direct routing is verified

### Shared production-control pattern

Four of the five workflows strongly show the same production-control requirement:

- approval
- change window

The exception is `iam_access_request`, where approval is central and change-window semantics are less structurally important than duration/expiry and access scope.

## Wave 1 implementation implication

Wave 1 should not invent new semantics.

It should formalize and promote the semantics that already appear in:

- extraction hooks
- readiness tests
- real-world regression fixtures

## Day 6 conclusion

Wave 1 is the right first expansion set because the backend already contains most of the policy signals needed to specify these workflows cleanly.

The work now is to convert that partial strength into explicit, direct deterministic support without changing the trust posture.
