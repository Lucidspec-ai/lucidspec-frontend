# Support Tier Policy

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines LucidSpec's deterministic support tiers.

The support-tier model exists to answer one question clearly:

How much deterministic execution-readiness support does LucidSpec truly provide for this request right now?

## Why support tiers matter

LucidSpec should not collapse all engineering-related requests into "supported" or "unsupported."

That would create two problems:

- it would overstate weak or partial support
- it would hide useful family-level or partial deterministic value

Support tiers let LucidSpec be useful without overstating certainty.

## Canonical support tiers

| Tier | Name | Meaning |
|---|---|---|
| Tier 1 | `tier_1_direct` | LucidSpec can directly route and deterministically evaluate the workflow from raw input with workflow-specific policy |
| Tier 2 | `tier_2_family` | LucidSpec can confidently identify the workflow family and apply family-level deterministic controls, but exact workflow routing is not yet strong enough for full direct support |
| Tier 3 | `tier_3_partial` | LucidSpec has some deterministic signals, extraction support, or policy coverage, but readiness must stay conservative |
| Tier 4 | `tier_4_generic_engineering` | The request is engineering-related, but LucidSpec has no strong family or workflow-specific deterministic support |
| Tier 5 | `tier_5_unsupported` | The request should not be presented as a covered execution-readiness workflow |

## Tier semantics

### Tier 1: `tier_1_direct`

Use Tier 1 when:

- raw input can be routed to a single workflow safely
- workflow-specific policy exists
- the system can deterministically evaluate readiness against that policy

Tier 1 is the highest-trust deterministic path.

Current examples:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

Expected behavior:

- workflow type should be populated
- workflow-specific missing facts may be computed
- readiness can be evaluated with strong deterministic authority

### Tier 2: `tier_2_family`

Use Tier 2 when:

- the family is clear
- direct workflow identification is not strong enough
- family-level controls still add real deterministic value

Expected behavior:

- `workflow_family` should usually be populated
- `workflow_type` should usually remain `null`
- family-level missing facts and controls may be shown
- workflow-specific certainty must not be implied

Tier 2 is appropriate when LucidSpec knows the operational class of work, but not yet the exact workflow path.

### Tier 3: `tier_3_partial`

Use Tier 3 when:

- LucidSpec detects partial workflow signals
- some extraction, policy, or regression coverage exists
- deterministic support is not strong enough to claim robust routing

Expected behavior:

- outputs should remain conservative
- missing facts may be high-level rather than workflow-specific
- readiness should favor downgrade over overclaim

Tier 3 is useful, but it is not a claim of strong execution-readiness coverage.

### Tier 4: `tier_4_generic_engineering`

Use Tier 4 when:

- the request is engineering-related
- no direct workflow or family-level support can be assigned safely
- the system can still provide generic structure or fallback handling

Expected behavior:

- do not imply verified deterministic coverage
- use broad engineering-safe fallback language
- keep workflow-specific readiness semantics minimal

### Tier 5: `tier_5_unsupported`

Use Tier 5 when:

- the request is not a covered execution workflow
- the request is planning-only, governance-only, or non-technical in a way that falls outside the supported deterministic scope
- any stronger claim would be misleading

Expected behavior:

- clear boundary notice
- no claim of execution-readiness evaluation
- no workflow-specific certainty

## Tier assignment rules

### Rule 1: Tier 1 requires direct workflow confidence

A request must not be marked Tier 1 unless LucidSpec can directly and confidently route it to a single supported workflow.

### Rule 2: Tier 2 requires family certainty, not workflow certainty

Tier 2 is the correct posture when LucidSpec recognizes the operating domain but cannot yet safely commit to one exact workflow route.

### Rule 3: Tier 3 is for conservative partial support

Tier 3 should be used when the system sees meaningful support signals but cannot honestly present robust deterministic readiness coverage.

### Rule 4: Tier 4 is not a hidden Tier 2

Generic engineering fallback must remain visibly generic.

Tier 4 must not contain implied family or workflow certainty unless those fields are explicitly set.

### Rule 5: Tier 5 protects trust

Tier 5 is not a failure.

It is the trust-preserving response when the request falls outside the execution-readiness support boundary.

## Relationship between tier and readiness

Support tier answers coverage depth.

Readiness state answers whether the work is ready to proceed.

They must remain separate.

Examples:

- a Tier 1 workflow may still be blocked
- a Tier 2 workflow may allow limited prework
- a Tier 5 request should not be shown as execution-ready just because it contains technical terms

## Relationship between tier and rollout

As deterministic support expands:

- workflows should move from Tier 4 to Tier 3
- then from Tier 3 to Tier 2
- then from Tier 2 to Tier 1 only after direct routing and policy depth are verified

This progression should be deliberate and test-backed.

## Current policy implication

Given the current backend boundary:

- direct pilot workflows are Tier 1 candidates
- partial support workflows are Tier 3 today unless routing and family handling are upgraded
- unsupported request classes remain Tier 5

Tier 2 should be introduced intentionally as family-level routing becomes explicit and stable.

## Day 3 conclusion

Support tiers are the trust language of deterministic expansion.

They let LucidSpec broaden usefulness in stages without pretending that every recognized request already has full workflow-grade support.
