# Routing Contract

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the canonical deterministic routing contract for LucidSpec.

It exists to make routing:

- explicit
- scalable across workflow families
- safe under ambiguity
- consumable by readiness logic and frontend surfaces without semantic drift

## Why this contract is needed

Today, LucidSpec's direct raw-input routing is intentionally narrow. The backend currently routes only a small pilot set directly and falls back to `unknown` for partial, unsupported, or ambiguous cases.

That behavior is safer than false precision, but it is not yet expressive enough for broader deterministic expansion.

The routing contract should therefore separate:

- what family a request appears to belong to
- what workflow type is directly recognized
- how strong the routing confidence is
- what support tier applies
- why the routing result was assigned

## Canonical routing fields

Every deterministically routed request should produce these fields before readiness evaluation:

| Field | Type | Required | Meaning |
|---|---|---|---|
| `workflow_family` | string or null | yes | The best deterministic family match, if one can be safely identified |
| `workflow_type` | string or null | yes | The direct workflow match, only when the system can safely identify a specific workflow |
| `support_tier` | enum | yes | The current deterministic support level for the request |
| `routing_confidence_class` | enum | yes | The confidence category of the routing outcome |
| `routing_reason` | string | yes | A human-readable explanation of why the routing result was produced |

## Field semantics

### `workflow_family`

`workflow_family` should represent the reusable policy family that best matches the request.

Allowed initial values:

- `cloud_operations`
- `network_security`
- `platform_infrastructure`
- `backup_recovery`
- `software_delivery`
- `identity_access`
- `logging_monitoring`
- `compliance_remediation`
- `null`

Rules:

- set this field when a family can be identified without overclaiming workflow certainty
- leave it `null` when the request is too broad, too ambiguous, or not an execution workflow
- this field may be set even when `workflow_type` is `null`

### `workflow_type`

`workflow_type` should represent the exact deterministic workflow route only when there is a direct, trusted workflow match.

Rules:

- use a workflow value only when routing is explicit enough to support workflow-specific policy evaluation
- set to `null` when the request is family-known but not workflow-clear
- set to `null` for ambiguous, mixed, planning-only, and unsupported requests

Current direct pilot examples:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

### `support_tier`

`support_tier` expresses the depth of deterministic support available for this request.

Allowed values:

- `tier_1_direct`
- `tier_2_family`
- `tier_3_partial`
- `tier_4_generic_engineering`
- `tier_5_unsupported`

This field is the main guardrail against false precision.

### `routing_confidence_class`

`routing_confidence_class` expresses how strong the routing signal is, independent of whether the system fully supports the request.

Allowed values:

- `explicit_direct`
- `strong_family`
- `partial_signal`
- `ambiguous`
- `mixed_scope`
- `planning_only`
- `unsupported`
- `unknown`

### `routing_reason`

`routing_reason` is the operator-facing explanation for why the routing result was assigned.

Rules:

- it should be brief, factual, and grounded in detected request structure
- it must not invent hidden dependencies, approvals, or blockers
- it should explain downgrade posture when the result is not Tier 1

Example reasons:

- "Direct backup workflow terms were detected for an RDS backup request."
- "The request maps to the network security family, but no single workflow type was explicit."
- "The request combines multiple execution changes and was downgraded to avoid false precision."
- "The request is planning-oriented and does not identify a single execution target."

## Canonical routing object

```json
{
  "workflow_family": "backup_recovery",
  "workflow_type": "rds_backup",
  "support_tier": "tier_1_direct",
  "routing_confidence_class": "explicit_direct",
  "routing_reason": "Direct backup workflow terms were detected for an RDS backup request."
}
```

## Routing contract rules

### Rule 1: Family and workflow are not the same thing

A request may have:

- both `workflow_family` and `workflow_type`
- only `workflow_family`
- neither

LucidSpec must not force a workflow type just because a family is recognizable.

### Rule 2: Support tier is not the same as confidence

`support_tier` answers: how much deterministic support exists.

`routing_confidence_class` answers: how clear the routing signal is.

They should usually align, but they are not interchangeable.

Example:

- a request may have `strong_family` confidence but still be only `tier_2_family`
- a request may have `partial_signal` confidence and be `tier_3_partial`

### Rule 3: Routing must degrade before readiness overclaims

If routing is unclear, mixed, or governance-only, the routing result must downgrade before workflow-specific readiness logic runs.

### Rule 4: Routing must preserve backend truth boundaries

Until broader classifier support exists, raw-input direct routing must remain aligned with the currently verified support boundary.

That means:

- current Tier 1 direct routing stays narrow
- family identification can expand earlier than workflow-specific routing
- unsupported and ambiguous cases must remain visibly downgraded

## Downstream use of the contract

The routing contract should be consumed by:

- family policy selection
- workflow overlay selection
- readiness downgrade behavior
- unsupported-boundary messaging
- frontend tier display

The routing contract should not be used by the frontend to invent stronger support than the backend assigned.

## Day 3 conclusion

LucidSpec needs a routing contract that distinguishes family recognition from workflow certainty.

That distinction is what allows deterministic coverage to broaden safely without pretending every recognizable request is directly supported.
