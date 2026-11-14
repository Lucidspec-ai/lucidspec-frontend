# Workflow Tier Promotion Test Rules

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the required test evidence for promoting a workflow from one support tier to the next.

Its role is to make support-tier promotion evidence-based rather than subjective.

## Core promotion rule

A workflow must not move to a stronger support tier unless the target tier's test requirements are satisfied.

Routing confidence alone is not enough.

## Promotion model

| From | To | Meaning |
|---|---|---|
| Tier 4 | Tier 3 | move from generic engineering fallback to partial deterministic support |
| Tier 3 | Tier 2 | move from partial support to family-grounded deterministic support |
| Tier 2 | Tier 1 | move from family support to direct deterministic workflow support |

## Universal promotion requirements

Before any tier promotion:

- current Tier 1 baseline workflows must remain green
- the workflow must have a fixed regression pack
- unsupported-boundary cases must remain protected
- anti-invention coverage must pass
- the promotion must not introduce unexplained shadow drift where shadow comparison is applicable

## Tier 4 to Tier 3 promotion rules

To move a workflow from Tier 4 to Tier 3, the workflow must have:

- workflow-specific extraction tests for critical fields
- at least one `fully_ready` regression fixture
- at least one `blocked` regression fixture
- at least one `prework_only` or `unsupported_input` fixture
- at least one trust-protection test

Tier 3 means LucidSpec has real deterministic signal, so the workflow must already prove it can do more than generic fallback.

## Tier 3 to Tier 2 promotion rules

To move a workflow from Tier 3 to Tier 2, the workflow must have:

- family-level routing confidence that is explicit and testable
- required family controls covered in readiness tests
- missing-fact downgrade coverage for family-level required facts
- false-precision tests for ambiguity within that family
- regression-pack coverage for all six standard scenarios

Tier 2 means LucidSpec can safely say, "we know what family of work this is," even if exact workflow routing is not yet direct.

## Tier 2 to Tier 1 promotion rules

To move a workflow from Tier 2 to Tier 1, the workflow must have:

- direct routing tests from raw input
- execution-fact extraction tests for all critical workflow-specific facts
- positive fully ready and vague-but-valid tests
- missing-fact downgrade coverage for critical shared and domain facts
- trust violation tests
- safe prework tests
- unsupported-boundary tests
- shadow comparison evidence if the workflow already had a comparable partial path

Tier 1 is the strongest deterministic claim, so it requires the strongest evidence.

## Required coverage by workflow dimension

Every Tier 1 candidate should prove:

| Dimension | Required for Tier 1 promotion |
|---|---|
| Routing | direct route from raw input is stable and unambiguous |
| Extraction | critical shared facts and workflow-specific domain facts are preserved |
| Readiness | execution-ready, partially-ready, blocked, and prework-only behavior are all testable where relevant |
| Trust | approvals, blockers, dependencies, and rollback are never invented |
| Unsupported boundary | narrative, training, planning, or mixed-scope inputs do not over-route |
| Regression stability | all standard real-world regression scenarios pass |

## Minimum fixture standard for Tier 1 promotion

A Tier 1 candidate should have, at minimum:

- 1 `fully_ready` fixture
- 1 `near_ready` fixture
- 1 `blocked` fixture
- 1 `prework_only` fixture
- 1 `vague_but_valid` fixture
- 1 `unsupported_input` fixture

If the workflow has more than one critical ambiguity pattern, additional ambiguity fixtures should be added.

## Required downgrade coverage for Tier 1 promotion

For Tier 1 promotion, the workflow must show at least:

- one missing critical shared fact test
- one missing workflow-specific fact test
- one ambiguous required fact test
- one review-only or prework-only test
- one unsupported or mixed-scope test

## Family-level gate for promotion

A workflow should not be promoted in a way that silently weakens the family.

Before promotion:

- sibling workflows in the same family should still route and downgrade correctly
- family-level trust constraints should still pass
- family-level safe prework semantics should still hold

## Shadow comparison rule

Shadow comparison is required when:

- the workflow has an existing partial or parallel deterministic path
- the promotion changes output semantics that operators already rely on
- the shared family controls are reused by current Tier 1 pilots

Promotion should pause if shadow results show:

- fact drift on critical required fields
- readiness-state drift without an explicit policy rationale
- trust findings that worsen

## Promotion should be denied when

- baseline Tier 1 workflows regress
- unsupported-boundary cases weaken
- anti-invention tests fail
- critical missing-fact downgrades become more permissive without policy approval
- direct routing remains ambiguous
- the regression pack is incomplete

## Day 7 conclusion

Tier promotion is a product trust decision, not just a classifier change.

These rules make sure LucidSpec only strengthens its public support claims when the underlying deterministic behavior is actually proven.
