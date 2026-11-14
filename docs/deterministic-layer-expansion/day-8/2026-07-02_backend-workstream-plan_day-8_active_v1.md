# Backend Workstream Plan

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document converts the deterministic-layer expansion plan into backend execution workstreams that can be implemented safely in small slices.

The goal is to avoid one large migration PR and instead ship a sequence of controlled changes that preserve current behavior.

## Workstream principles

- routing should expand before support claims expand
- family policy should be reusable before workflow overlays grow
- trust evaluation should be aligned before workflows are promoted
- canonical output contracts should remain stable while backend internals evolve
- tests should gate every promotion step

## Workstream map

| Workstream | Goal | Primary backend areas | Main output | Main risk if done poorly |
|---|---|---|---|---|
| Routing expansion | broaden routing without false precision | `app/domains/tickets/v2/extraction/workflow_classifier.py`, `app/domains/tickets/v2/extraction/execution_facts.py`, related classifier tests | richer routing contract and safer family/workflow detection | over-routing unsupported or ambiguous requests |
| Family policy framework | introduce reusable family-level policy controls | `app/domains/tickets/v2/policy/registry.py`, family policy helpers, readiness integration points | shared family required facts, approvals, validation, rollback, safe-prework defaults | duplicating or conflicting logic across workflows |
| Workflow overlay expansion | formalize Wave 1 workflow-specific requirements | `app/domains/tickets/v2/policy/real_world_regression_packs.py`, overlay definitions, overlay policy tests | thin workflow overlays on top of family policy | turning overlays into one-off full policies |
| Trust evaluator alignment | keep anti-invention and unsupported-boundary behavior honest | trust evaluator tests, readiness-trust surfaces, operator trust visibility surfaces | trust rules aligned to new family/workflow paths | invented approvals, blockers, or support claims |
| Canonical output contract alignment | preserve stable downstream semantics while routing/policy grow | readiness output contract, operator frontend view-model contract, visibility surfaces | stable canonical routing/readiness projection | frontend/backend semantic drift |
| Workflow-specific tests | make each new support claim measurable | extraction tests, readiness tests, regression packs, gold-set checks, shadow comparisons | promotion-grade test coverage per workflow | regressions pass unnoticed or promotions happen without evidence |

## Workstream 1: Routing expansion

### Objective

Move LucidSpec from narrow direct pilot routing plus `unknown` fallback toward a scalable routing model that can express:

- workflow family
- workflow type
- support tier
- routing confidence
- routing reason

### Scope

- extend the workflow-classification layer
- preserve the current unsupported boundary
- add family-detection behavior before broad direct workflow promotion
- keep Tier 1 routing narrow until tests prove direct workflow support

### Suggested implementation chunks

1. add internal routing result shape without changing external support claims
2. add family-level signal detection for Wave 1 workflows
3. add ambiguity and mixed-scope downgrade handling
4. promote direct routing only for workflows that satisfy tier-promotion test rules

### Boundaries

- do not rewrite readiness semantics inside routing
- do not let the frontend infer routing confidence
- do not weaken unsupported request handling

## Workstream 2: Family policy framework

### Objective

Create reusable family-level policy controls so new workflows inherit shared logic instead of duplicating it.

### Scope

- family-level required facts
- family-level approval policy
- family-level validation policy
- family-level rollback/recovery defaults
- family-level safe-prework defaults
- family-level trust constraints

### Suggested implementation chunks

1. define family policy objects or profiles in policy registry
2. wire family policy into readiness evaluation
3. validate that existing Tier 1 workflows still behave the same
4. add family-policy regression tests before workflow overlay promotion

### Boundaries

- extraction must still own fact capture
- workflow overlays must stay thinner than family policy
- readiness engine should consume family policy, not author it

## Workstream 3: Workflow overlay expansion

### Objective

Convert Wave 1 workflows from partially supported overlay/regression shapes into explicit promotion-ready workflow overlays.

### Scope

- `firewall_rule_change`
- `cloudtrail_logging_retention`
- `iam_access_request`
- `software_bug_fix`
- `vmware_cluster_change`

### Suggested implementation chunks

1. formalize overlay definitions for the five Wave 1 workflows
2. align required facts to the Day 6 workflow policy sheets
3. align downgrade triggers to the documented ambiguity patterns
4. keep overlays thin by inheriting family controls first

### Boundaries

- do not re-embed family policy into every overlay
- do not change canonical readiness vocabulary
- do not promote workflows to Tier 1 before routing and tests are ready

## Workstream 4: Trust evaluator alignment

### Objective

Ensure the trust system remains honest as routing and overlays expand.

### Scope

- anti-invention behavior
- unsupported-boundary posture
- preservation of explicit controls
- trust findings surfaced to operator-facing contracts

### Suggested implementation chunks

1. review trust-sensitive facts added by Wave 1 workflows
2. add family-specific anti-invention assertions
3. verify trust findings remain stable in readiness/operator surfaces
4. add trust regression coverage before tier promotion

### Boundaries

- trust must not invent new blockers to compensate for weak routing
- unsupported-boundary notices must remain contract-driven
- trust surfaces must not silently change frontend meaning

## Workstream 5: Canonical output contract alignment

### Objective

Keep downstream output stable while the backend gains richer routing and policy structure.

### Scope

- routing contract projection
- readiness output contract
- operator frontend view model
- visibility/export surfaces that consume unsupported boundary and trust state

### Suggested implementation chunks

1. add routing fields behind stable contract boundaries
2. ensure readiness output remains canonical and backward-safe
3. update operator/frontend projection only after backend semantics are fixed
4. lock new output fields with contract tests

### Boundaries

- frontend-facing semantics must not change ad hoc
- hidden traces must remain hidden unless intentionally promoted
- output contract changes must be test-locked before broader rollout

## Workstream 6: Workflow-specific test expansion

### Objective

Make every new support claim testable before release.

### Scope

- extraction tests
- readiness tests
- regression packs
- gold-set cases
- shadow comparisons where applicable

### Suggested implementation chunks

1. lock baseline Tier 1 tests
2. add Wave 1 extraction and readiness assertions
3. complete Wave 1 regression scenario coverage
4. add shadow comparison or family scorecard gates before direct promotion

### Boundaries

- no workflow should be promoted without its test pack
- no family rule change should merge without sibling-regression checks
- unsupported-boundary coverage must remain part of every review

## PR slicing strategy

Recommended PR slicing:

1. routing scaffolding PR
2. family-policy framework PR
3. one PR per Wave 1 workflow overlay and tests
4. trust-alignment PR if shared trust behavior changes
5. output-contract/projection PR only after semantics are settled
6. promotion PR that flips support status only after all tests are green

## Why this slicing is safer

This strategy separates:

- semantics from presentation
- shared family logic from workflow specifics
- support promotion from support implementation

That makes rollback easier if a later PR introduces drift.

## Day 8 conclusion

The backend expansion should be implemented as a sequence of narrow workstreams, not as one migration.

That is the safest way to widen deterministic coverage without destabilizing the trust and readiness behavior LucidSpec already has.
