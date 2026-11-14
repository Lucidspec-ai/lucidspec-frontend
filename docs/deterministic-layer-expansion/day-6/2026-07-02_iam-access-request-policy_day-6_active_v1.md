# IAM Access Request Policy Sheet

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the proposed deterministic policy sheet for `iam_access_request` as a Wave 1 workflow.

## Classification

- workflow: `iam_access_request`
- family: `identity_access`
- current support tier: Tier 3
- target support tier: Tier 1

## Execution-ready required facts

The workflow should be considered execution-ready only when these facts are grounded:

- environment or account scope
- principal
- access scope or target role/account
- duration or expiry
- approval
- validation
- rollback

## Prework-only required facts

The workflow may remain prework-only when LucidSpec has enough information to review the current access path without claiming that privileges are ready to grant.

Minimum prework-only grounding:

- identifiable principal or access path context
- enough context to review current permission boundary
- explicit non-execution or review intent, or missing execution controls that still allow access-path review

## Optional helpful facts

- business rationale
- least-privilege note
- owner/team
- ticket/change ID
- dataset/resource subset detail
- review deadline

## Approval policy

- named approval is a core requirement
- ambiguous approval language should block or downgrade
- this workflow should not assume approval from surrounding context if the approver is not explicit

## Validation policy

Expected validation should prove the intended principal can perform the intended action and nothing broader is implied.

Preferred validation examples:

- confirm assume-role succeeds
- confirm the approved read/list action succeeds

Validation should stay scope-aware and should not imply broader entitlement success than requested.

## Rollback policy

- rollback is effectively required for execution-ready posture
- acceptable rollback patterns include removing the temporary policy binding or otherwise reverting the granted access path
- expiry alone is helpful but should not replace explicit rollback/revoke intent when the request frames immediate validation and fallback

## Safe prework policy

Allowed safe prework includes:

- review current access model and policy boundary
- confirm principal identity
- confirm requested scope
- gather approver evidence
- prepare duration/expiry details

Safe prework should not imply the entitlement is ready to grant.

## Trust constraints

LucidSpec must not invent:

- principal identity
- target role/account
- duration or expiry
- approver
- least-privilege rationale
- entitlement scope
- validation success

## Common ambiguity cases

- "grant analytics prod access" with no exact target role/account
- temporary access request with no duration
- approval language like "should be approved" or "needs security to confirm"
- request mixes immediate access grant with broad IAM policy redesign
- request sounds like training or governance rather than a concrete privilege change

## Downgrade triggers

Downgrade from execution-ready posture when:

- duration/expiry is missing or ambiguous
- approval is missing or ambiguous
- principal is unclear
- target scope is unclear
- rollback is missing
- the request mixes direct access change with broader IAM governance work

## Regression-aligned behavior notes

Current backend regression behavior already indicates:

- access requests with scope, duration, approval, validation, and rollback can be execution-ready
- missing duration can remain partially ready
- ambiguous approval should block or downgrade
- review-only requests should remain limited prework only

## Day 6 conclusion

`iam_access_request` is a strong Wave 1 workflow because the access-control semantics are already visible in extraction and regression behavior, and the trust stakes are high enough to justify making them explicit early.
