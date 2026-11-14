# Legacy Boundary Do Not Touch List

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document lists the backend areas that should not be broadly refactored during early deterministic-layer expansion.

The goal is not to freeze the entire backend forever.

The goal is to protect working logic while the new family-policy and workflow-overlay structure is being introduced.

## Do not touch yet

### 1. Canonical readiness vocabulary and base semantics

Do not broadly refactor:

- `/Users/lavanya/lucidspec_backend/app/readiness.py`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/readiness/engine.py`

Why:

- these files anchor canonical readiness meaning
- changes here have cross-workflow blast radius
- expansion should add policy inputs first, not rewrite state semantics

Allowed exception:

- narrow, test-backed changes required to consume new family/overlay policy without changing the meaning of the state model

### 2. Current Tier 1 direct workflow behavior

Do not weaken or broadly rewrite direct support behavior for:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

Relevant anchors include:

- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/extraction/workflow_classifier.py`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/extraction/execution_facts.py`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/policy/real_world_regression_packs.py`

Why:

- these workflows are the baseline controls
- they are the proof that the deterministic layer already works

### 3. Operator frontend view-model semantics

Do not broadly rewrite:

- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/policy/operator_frontend_view_model.py`
- related operator visibility surface files under `app/domains/tickets/v2/policy/`

Why:

- frontend contract drift will create confusion during backend expansion
- semantic expansion should happen in routing/policy/readiness first, not in UI-facing projection

Allowed exception:

- additive, contract-tested fields introduced only after backend semantics are stable

### 4. Unsupported-boundary behavior

Do not relax or blur:

- unsupported request handling
- unsupported boundary notices
- gold-set unsupported cases

Relevant anchors include:

- `/Users/lavanya/lucidspec_backend/docs/WORKFLOW_SUPPORT_BOUNDARY_V1.md`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/policy/gold_set_scope.py`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/policy/gold_set_scorecard.py`
- operator visibility/unsupported-boundary tests

Why:

- unsupported-boundary honesty is part of the trust model
- early expansion is exactly when false precision risk is highest

### 5. Shadow current-path comparison behavior

Do not broadly rewrite:

- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/shadow/current_path_projection.py`
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/shadow/runtime.py`

Why:

- shadow comparison is one of the safest ways to validate the new path against current behavior
- if this moves too early, you lose your drift detector while changing the system

### 6. Legacy ticket generation/governance stack outside the v2 family-policy path

Do not broadly refactor during early expansion:

- `/Users/lavanya/lucidspec_backend/app/ticket_readiness_policy.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_governance.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_trust.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_domain.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_execution.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_finalize.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_operator_review.py`

Why:

- these files are part of the broader legacy/production flow
- expansion should first happen inside the v2 deterministic path and its policy/readiness/test structure
- broad refactors here would mix migration risk with workflow expansion risk

### 7. Gold-set and regression contract discipline

Do not loosen:

- gold-set fixture contracts
- required anti-invention categories
- required regression scenarios
- ownership-boundary assertions

Relevant anchors include:

- `/Users/lavanya/lucidspec_backend/tests/test_ticket_v2_gold_set_contract.py`
- `/Users/lavanya/lucidspec_backend/tests/test_ticket_v2_real_world_regression_packs.py`
- `/Users/lavanya/lucidspec_backend/tests/ticket_ownership_contract.py`

Why:

- once these protections are weakened, support can appear to improve while trust silently degrades

## Safe to touch earlier

These areas are safer early targets:

- routing scaffolding
- family policy registry/framework
- Wave 1 overlay definitions
- workflow-specific extraction extensions
- workflow-specific readiness tests
- regression-pack additions

## Change-control rule

If a proposed PR touches both:

- a new family/overlay implementation area
- and one of the "do not touch yet" areas above

then the PR should usually be split unless the legacy touch is narrowly required and fully test-backed.

## Day 8 conclusion

LucidSpec should widen deterministic support by building around the legacy core first, not by refactoring the core while expansion is still underway.

This list is what keeps the migration disciplined.
