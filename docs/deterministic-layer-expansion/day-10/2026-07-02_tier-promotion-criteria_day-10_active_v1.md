# Tier Promotion Criteria

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document finalizes the operational criteria for promoting workflows and families across support tiers during rollout.

It translates the earlier test rules into go/no-go promotion decisions.

## Promotion decision rule

Tier promotion is allowed only when:

- the target tier definition is satisfied
- the required tests are green
- baseline workflows remain stable
- no stop condition is active

## Tier 4 to Tier 3 criteria

Promote from Tier 4 to Tier 3 only when:

- workflow-specific extraction exists for critical fields
- at least partial deterministic policy exists
- regression-pack coverage exists for core scenarios
- the workflow can add useful deterministic value without pretending full support
- unsupported-boundary behavior remains intact

Decision meaning:

- LucidSpec may now say the workflow has partial deterministic support
- LucidSpec may not yet claim strong family or direct workflow routing

## Tier 3 to Tier 2 criteria

Promote from Tier 3 to Tier 2 only when:

- family-level routing is explicit and testable
- family-level shared controls are implemented
- family-level downgrade behavior is safe
- the workflow can be recognized at the family level without overclaiming exact route
- all standard regression scenarios pass

Decision meaning:

- LucidSpec may now say it understands this class of work at the family level
- LucidSpec may not yet claim direct workflow-specific deterministic support

## Tier 2 to Tier 1 criteria

Promote from Tier 2 to Tier 1 only when:

- direct raw-input routing is proven
- workflow-specific required facts are fully test-covered
- downgrade behavior is safe across ambiguity and unsupported cases
- trust protections are complete
- regression pack is complete
- shadow comparison is acceptable when required
- frontend support messaging is ready to stay truthful

Decision meaning:

- LucidSpec may now claim direct deterministic workflow support for that workflow

## Promotion criteria by dimension

| Dimension | Required for promotion |
|---|---|
| Policy completeness | required facts, approvals, validation, rollback, safe prework, trust constraints documented and implemented |
| Routing correctness | tier-appropriate routing behavior tested and stable |
| Readiness correctness | canonical readiness states behave as documented |
| Trust correctness | anti-invention and unsupported-boundary behavior remain intact |
| Regression stability | baseline workflows and sibling-family workflows remain green |
| Frontend truth alignment | frontend copy and UI do not overstate the promoted support depth |

## Promotion sign-off model

Every promotion should have explicit sign-off from:

- product/policy owner for support claim truthfulness
- implementation owner for backend correctness
- test/review owner for regression evidence

These may be the same person early on, but the sign-off responsibilities should still be mentally separate.

## Promotion should stop if

- a baseline Tier 1 workflow regresses
- unsupported-boundary accuracy weakens
- trust findings worsen
- direct routing still fails ambiguity tests
- shadow comparison shows unexplained drift
- frontend messaging is still stronger than backend support truth

## Wave 2 gate

Wave 2 should not begin until:

- all Wave 1 workflows are at least correctly stabilized at their current promoted tier
- the relevant families are promotion-ready
- regression scorecards are stable for at least two consecutive weekly reviews
- no active stop condition is open

## Day 10 conclusion

Tier promotion should be treated like a governed product release decision.

That is what keeps deterministic depth honest as LucidSpec grows.
