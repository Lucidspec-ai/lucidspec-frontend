# Deterministic Test Strategy

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the testing strategy for LucidSpec's deterministic-layer expansion.

The strategy must do two things at the same time:

- protect the logic that already works
- make new workflow coverage measurable before promotion

## Core testing principle

Deterministic support should only expand when test evidence proves that:

- the workflow routes correctly
- readiness downgrades correctly when facts are missing or ambiguous
- LucidSpec does not invent controls, blockers, or approvals
- safe prework remains safe
- current Tier 1 workflows do not regress

## Test layers

LucidSpec should use five main deterministic test layers.

### 1. Readiness-engine tests

Purpose:

- verify canonical readiness states
- verify blocker behavior
- verify missing-fact handling
- verify safe-prework output

Current signal already exists in:

- `/Users/lavanya/lucidspec_backend/tests/test_ticket_v2_readiness_engine.py`

### 2. Execution-fact extraction tests

Purpose:

- verify workflow-specific required facts are extracted and normalized correctly
- verify shorthand, messy phrasing, and equivalent phrasing do not drop critical facts

Current signal already exists in:

- `/Users/lavanya/lucidspec_backend/tests/test_ticket_v2_execution_facts.py`

### 3. Real-world regression packs

Purpose:

- lock realistic workflow behavior across fixed scenario types
- ensure new changes preserve state, blockers, safe prework, and anti-invention behavior

Current signal already exists in:

- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/policy/real_world_regression_packs.py`

### 4. Gold-set contract tests

Purpose:

- lock canonical fixture structure
- lock anti-invention categories
- lock preservation assertions
- protect unsupported-boundary cases

Current signal already exists in:

- `/Users/lavanya/lucidspec_backend/tests/test_ticket_v2_gold_set_contract.py`

### 5. Shadow comparison tests

Purpose:

- compare the current path and the v2 deterministic path
- detect semantic drift before a new workflow becomes direct support
- validate that output differences are explainable and acceptable

Current signal already exists in:

- `/Users/lavanya/lucidspec_backend/tests/test_ticket_v2_shadow_runtime.py`

## Required test categories

Every deterministic workflow under promotion should have these test categories.

| Test category | Purpose | Minimum expectation |
|---|---|---|
| Positive coverage tests | prove a grounded request reaches the expected supported state | at least one fully ready path that reaches the expected readiness state |
| Missing-fact downgrade tests | prove omitted required facts reduce readiness safely | each critical required fact class must have at least one missing-fact downgrade assertion |
| False precision tests | prove ambiguous or broad requests do not over-route | ambiguous, mixed, or review-only requests must not be promoted to strong support |
| Trust violation tests | prove LucidSpec does not invent controls or facts | invented approval/blocker/system/dependency behavior must be flagged or remain unresolved |
| Safe prework tests | prove LucidSpec allows safe early work without overclaiming execution-readiness | review-only and prework-capable requests must remain conservative and usable |
| Unsupported-boundary tests | prove out-of-scope inputs stay out of scope | unsupported, training, planning, or narrative inputs must not route as direct execution workflows |

## Positive coverage tests

Positive coverage tests should prove:

- routing picks the intended workflow or family
- extracted facts include the workflow's required execution-ready controls
- readiness reaches the expected state
- no invented blockers appear

For each covered workflow, positive tests should include:

- one clean fully ready example
- one messy-but-valid example
- one equivalent-phrasing example when wording variation risk is meaningful

## Missing-fact downgrade tests

Missing-fact downgrade tests should prove:

- missing critical facts block or heavily downgrade the workflow
- missing near-term execution controls can produce `partially_ready` or `limited_prework_only` when policy allows
- ambiguous facts do not silently count as present

Each workflow should test at least:

- one missing shared fact
- one missing workflow-specific/domain fact
- one ambiguous required fact

## False precision tests

False precision tests are mandatory because they protect trust.

These tests should prove LucidSpec does not overstate support when a request is:

- ambiguous
- multi-workflow
- supported plus unsupported mixed-scope
- review-only
- planning/governance-only

Expected result:

- routing downgrades before readiness overclaims
- no unsupported request reaches Tier 1 semantics

## Trust violation tests

Trust tests should verify LucidSpec does not invent:

- approvals
- change windows
- targets
- systems
- dependencies
- rollback paths
- evidence of validation success

Trust tests should also verify:

- explicit controls are preserved
- forbidden anti-invention categories remain locked
- masking-sensitive inputs do not leak raw sensitive values into outputs

## Safe prework tests

Safe prework tests should prove:

- prework is offered only when policy allows it
- safe prework does not silently satisfy missing execution controls
- review-only requests stay conservative
- prework items remain relevant to the workflow family

## Regression-pack requirements

Every workflow that claims deterministic support should have a fixed real-world regression pack.

Required scenarios:

- `fully_ready`
- `near_ready`
- `blocked`
- `prework_only`
- `vague_but_valid`
- `unsupported_input`

These scenario names already match the current backend regression-pack model and should remain the default standard.

## Locked Tier 1 baseline controls

Current Tier 1 workflows are baseline controls and must remain green throughout expansion work:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

These workflows are the regression baseline for:

- routing truth
- readiness semantics
- safe-prework semantics
- anti-invention posture
- shadow comparison stability

No workflow-expansion pull request should be accepted if it regresses the locked Tier 1 baseline.

## Shadow comparison approach

Shadow comparison is especially useful when moving a workflow from partial support to direct routing.

Use shadow comparison when:

- the workflow is being promoted to Tier 1
- the workflow has meaningful existing partial logic
- the workflow touches shared family rules that might affect current pilots

Shadow comparison should answer:

- does the v2 path extract the same grounded facts?
- does the v2 path preserve or improve readiness behavior?
- are rendering differences acceptable and explainable?
- are trust findings unchanged or improved?

## Measurable coverage rules

Coverage should be measurable at three levels:

- workflow level
- family level
- scenario level

Useful scorecard dimensions already hinted at in backend regression structures:

- extraction pass rate
- readiness accuracy
- anti-invention pass rate
- regression pass rate

## Day 7 conclusion

LucidSpec's deterministic test strategy should treat trust as a first-class test target, not just an implementation detail.

That is what allows the deterministic layer to broaden without losing the credibility of the workflows that already work.
