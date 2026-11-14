# Software Bug Fix Policy Sheet

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the proposed deterministic policy sheet for `software_bug_fix` as a Wave 1 workflow.

## Classification

- workflow: `software_bug_fix`
- family: `software_delivery`
- current support tier: Tier 3
- target support tier: Tier 1

## Execution-ready required facts

The workflow should be considered execution-ready only when these facts are grounded:

- target service/application
- environment
- change scope
- deployment path
- dependencies
- approval
- change window
- validation
- rollback

## Prework-only required facts

The workflow may remain prework-only when LucidSpec has enough information to support code-path and dependency review without claiming deployment readiness.

Minimum prework-only grounding:

- identifiable bug/change scope or target service context
- enough context to review current code path or dependency chain
- explicit non-execution or review intent, or missing execution controls that still allow technical review

## Optional helpful facts

- incident/ticket reference
- owner/team
- test evidence
- rollout strategy
- migration/schema detail
- customer-impact note

## Approval policy

- production bug-fix delivery should require explicit approval
- production shipment should require an approved execution lane/change window
- ambiguous approval language should downgrade or block rather than be assumed satisfied

## Validation policy

Expected validation should prove both:

- the specific bug condition no longer occurs
- service behavior remains healthy after deployment

Preferred validation examples:

- confirm duplicate retries stop
- confirm service health checks or key user path remains healthy

## Rollback policy

- rollback is a hard requirement for execution-ready production delivery
- acceptable rollback patterns include redeploying the previous image or an equivalent grounded mitigation path

## Safe prework policy

Allowed safe prework includes:

- review current code path
- review current deployment dependencies
- confirm target service ownership
- clarify deployment path
- line up validation method

Safe prework should not imply the deployment itself is ready.

## Trust constraints

LucidSpec must not invent:

- owning service
- deployment path
- dependency readiness
- approval state
- change window
- rollback plan
- test or validation success

## Common ambiguity cases

- "fix this in prod" with no target service
- "deploy the usual way" with no explicit deployment path
- dependency signoff implied but not named
- bug-fix request mixed with team process coaching or standup guidance
- request identifies a symptom but not the service that owns the change

## Downgrade triggers

Downgrade from execution-ready posture when:

- target service is missing
- deployment path is missing
- dependencies are missing
- approval is missing or ambiguous
- change window is missing for production
- rollback is missing
- the request is process guidance rather than a concrete bug fix

## Regression-aligned behavior notes

Current backend regression behavior already indicates:

- grounded production bug fixes with deployment path, dependency, approval, window, validation, and rollback can be execution-ready
- missing only approval/window can remain partially ready
- missing target, deployment path, or dependencies can block execution support
- review-only requests should remain limited prework only

## Day 6 conclusion

`software_bug_fix` is a strong Wave 1 workflow because it gives LucidSpec a credible software-delivery entry point while still enforcing concrete deployment and rollback discipline.
