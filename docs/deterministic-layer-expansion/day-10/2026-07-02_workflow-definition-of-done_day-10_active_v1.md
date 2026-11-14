# Workflow Definition Of Done

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines when a deterministic workflow should be considered done for a rollout wave.

The goal is to make workflow completion evidence-based instead of subjective.

## Core rule

A workflow is not done because code merged.

A workflow is done only when:

- the policy is explicit
- the routing behavior is correct
- the trust behavior is preserved
- the tests are complete
- the support claim matches the verified tier

## Workflow-level definition of done

Every workflow is done only when all of the following are true:

### 1. Policy is fully specified

- workflow family is explicit
- current support tier is explicit
- target support tier is explicit
- execution-ready required facts are documented
- prework-only required facts are documented
- optional helpful facts are documented
- approval policy is documented
- validation policy is documented
- rollback policy is documented
- safe prework policy is documented
- trust constraints are documented
- ambiguity cases are documented
- downgrade triggers are documented

### 2. Backend implementation exists in the correct layer

- routing behavior is implemented in the routing layer
- shared logic is inherited from family policy where appropriate
- workflow-specific differences live in the overlay layer
- readiness consumes policy instead of inventing policy

### 3. Routing behavior is verified

- routing matches the target workflow or family correctly
- ambiguous inputs downgrade safely
- unsupported or mixed-scope inputs do not over-route
- workflow promotion does not weaken current Tier 1 workflows

### 4. Test coverage is complete

- positive coverage tests exist
- missing-fact downgrade tests exist
- false-precision tests exist
- trust violation tests exist
- safe-prework tests exist
- unsupported-boundary tests exist
- regression-pack scenarios are complete

### 5. Regression evidence is green

- workflow regression pack passes
- sibling-family regressions still pass
- locked Tier 1 baseline workflows still pass
- shadow comparison passes when required

### 6. Contract and UI alignment is ready

- backend contract fields needed by the frontend are available
- frontend does not imply stronger support than the backend assigned
- unsupported/ambiguous behavior is renderable honestly

### 7. Support claim is truthful

- the workflow is only promoted to the tier it has actually earned
- marketing or prompt-level references are not upgraded prematurely

## Minimum done criteria by tier target

| Target tier | Workflow done requires |
|---|---|
| Tier 3 | deterministic signal exists, partial tests exist, regression scenarios exist, support claim remains partial |
| Tier 2 | family-level routing and family controls are proven, ambiguity behavior is safe, regression pack is complete |
| Tier 1 | direct routing is proven, workflow-specific tests are complete, trust protections are complete, support claim can be made explicitly |

## Wave 1 done standard

For Wave 1 workflows:

- `firewall_rule_change`
- `cloudtrail_logging_retention`
- `iam_access_request`
- `software_bug_fix`
- `vmware_cluster_change`

done means:

- they satisfy the full workflow-level checklist above
- they can be promoted one by one without baseline regression
- each has its own promotion evidence, not just family-level optimism

## Not done yet if

A workflow is not done if any of these are true:

- support tier is still aspirational rather than verified
- regression scenarios are incomplete
- direct routing remains ambiguous
- trust tests fail
- unsupported boundary weakens
- frontend copy implies stronger support than backend truth

## Day 10 conclusion

A deterministic workflow is done only when the policy, implementation, tests, and support claim all agree.

That is the standard that keeps LucidSpec trustworthy while support expands.
