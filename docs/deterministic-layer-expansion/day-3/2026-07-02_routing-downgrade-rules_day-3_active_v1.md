# Routing Downgrade Rules

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines when LucidSpec must downgrade routing rather than claiming stronger deterministic support.

The goal is to prevent false precision as coverage expands.

## Core downgrade principle

When the request structure is unclear, mixed, or broader than a single supported execution workflow, LucidSpec must downgrade routing before it evaluates readiness.

Routing should fail safe, not fail optimistic.

## Routing confidence classes

| Confidence class | Meaning | Typical result |
|---|---|---|
| `explicit_direct` | A single direct workflow is clearly identified from raw input | usually Tier 1 |
| `strong_family` | The family is clear, but exact workflow type is not safely identified | usually Tier 2 |
| `partial_signal` | Some support signals exist, but they are not strong enough for confident family or workflow routing | usually Tier 3 |
| `ambiguous` | Competing interpretations exist and no single route is safe | Tier 3, Tier 4, or Tier 5 depending on scope |
| `mixed_scope` | The request combines supported and unsupported or multiple execution scopes | usually Tier 3 or Tier 4 |
| `planning_only` | The request is about planning, governance, or direction rather than a concrete execution step | usually Tier 4 or Tier 5 |
| `unsupported` | The request is outside deterministic execution scope | Tier 5 |
| `unknown` | The request cannot be safely classified with current logic | usually Tier 4 |

## Downgrade categories

### Category 1: Ambiguous request

Use this category when:

- multiple plausible workflow interpretations exist
- the request lacks enough structure to choose one safely
- direct workflow language conflicts with other signals

Required handling:

- do not assign a workflow type
- assign the strongest safe family only if one is genuinely clear
- downgrade support tier
- explain the ambiguity in `routing_reason`

Example posture:

- `workflow_family`: possible
- `workflow_type`: `null`
- `routing_confidence_class`: `ambiguous`

### Category 2: Multi-workflow request

Use this category when:

- the request contains multiple execution changes
- the changes would normally map to more than one workflow
- a single readiness result would hide separate requirements

Required handling:

- do not collapse multiple execution workflows into one direct route
- downgrade to an ambiguous or mixed posture
- require decomposition before Tier 1 treatment

Default result:

- `routing_confidence_class`: `ambiguous`
- `support_tier`: at most Tier 3 until decomposition occurs

### Category 3: Supported + unsupported mixed request

Use this category when:

- one portion of the request is inside current deterministic scope
- another portion is outside scope
- presenting the whole request as covered would mislead the operator

Required handling:

- do not promote the whole request to the strongest supported segment
- downgrade the combined request
- explain that part of the request falls outside verified deterministic coverage

Default result:

- `routing_confidence_class`: `mixed_scope`
- `support_tier`: Tier 3 or Tier 4 depending on how much of the request is covered

### Category 4: Planning or governance-only request

Use this category when:

- the request is about planning, roadmaps, program coordination, leadership updates, or governance
- there is no single concrete execution target
- the system would otherwise be forced to invent an execution workflow

Required handling:

- do not assign workflow-specific readiness support
- avoid execution-ready posture
- return generic or unsupported boundary treatment depending on the request class

Default result:

- `routing_confidence_class`: `planning_only`
- `support_tier`: Tier 4 or Tier 5

### Category 5: Unsupported request class

Use this category when:

- the request is outside deterministic execution-readiness scope
- current support boundary documentation already marks the class unsupported

Required handling:

- assign Tier 5
- surface boundary messaging
- do not imply hidden coverage

## Specific downgrade rules

### Rule 1: More than one direct workflow match downgrades

If multiple direct workflow routes appear plausible, LucidSpec must downgrade instead of selecting the first match.

### Rule 2: Partial signals do not become workflow certainty

If the request contains terms associated with partially supported workflows, LucidSpec must not elevate the request to Tier 1 without direct routing support.

### Rule 3: Family recognition does not eliminate ambiguity

Even when the family is clear, the workflow type should remain `null` if the specific route is not explicit.

### Rule 4: Mixed requests inherit the weaker truth posture

When supported and unsupported scopes are combined, the request should inherit the weaker overall support posture for the combined route.

### Rule 5: Planning language blocks execution overclaim

If the request is fundamentally planning-oriented, LucidSpec must not present deterministic execution-readiness support unless a single execution target is separately identified.

## Downgrade matrix

| Request condition | workflow_family | workflow_type | confidence | support tier | Why |
|---|---|---|---|---|---|
| Single direct pilot workflow | set | set | `explicit_direct` | Tier 1 | direct route is verified |
| Clear family, unclear workflow | set | `null` | `strong_family` | Tier 2 | family support exists without workflow certainty |
| Partial workflow signals only | maybe set | `null` | `partial_signal` | Tier 3 | some support exists, but not enough for stronger routing |
| Ambiguous or multi-workflow request | maybe set | `null` | `ambiguous` | Tier 3 or 4 | single route would be false precision |
| Supported + unsupported mixed request | maybe set | `null` | `mixed_scope` | Tier 3 or 4 | combined scope is weaker than its strongest segment |
| Planning/governance-only request | usually `null` | `null` | `planning_only` | Tier 4 or 5 | no single execution target |
| Unsupported request class | `null` | `null` | `unsupported` | Tier 5 | outside deterministic scope |

## Required operator explanation behavior

Every downgraded route should explain:

- what was recognized
- what was not certain enough
- why LucidSpec did not claim stronger support

That explanation should reduce confusion, not just reduce confidence.

## Day 3 conclusion

LucidSpec protects trust by downgrading early.

The system should treat ambiguity, mixed scope, and planning-only requests as routing problems first, not as opportunities to stretch workflow certainty past what the backend can verify.
