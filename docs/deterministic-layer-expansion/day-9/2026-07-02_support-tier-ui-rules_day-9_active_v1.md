# Support Tier UI Rules

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the frontend-specific support-tier UI behavior that should be used once backend support-tier fields are available in frontend contracts.

This is a Day 9 refinement of the earlier support-tier rules, focused on actual frontend surfaces and cleanup needs.

## Core frontend rule

The frontend may show:

- backend support depth
- backend routing confidence
- backend support-boundary posture

The frontend may not:

- infer those from domain chips
- infer those from prompt examples
- infer those from engineering-keyword matches

## Support-tier-aware UI behavior by surface

| Surface | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|---|---|---|---|---|---|
| Generator confirmation/copy | may say workflow-specific support if backend confirms it | say family-level coverage only | say partial support only | say broad engineering relevance without strong deterministic claim | say request may fall outside supported execution-readiness scope |
| Ticket/readiness header | workflow-specific label allowed | family label preferred | caution label | generic engineering posture only | boundary-first posture |
| Missing-facts presentation | workflow-specific gaps allowed | family-level gaps preferred | high-level gaps only | generic follow-up only | no covered-workflow gap framing |
| Safe-prework presentation | workflow-safe actions allowed | family-safe actions allowed | limited prework only | generic low-regret next steps only | none unless backend explicitly provides boundary-safe guidance |
| Unsupported/ambiguous panel | optional if no issue | recommended | recommended | recommended | required |
| Prompt/example selection | verified workflows can be featured confidently | family-relevant examples only if clearly labeled | examples must not imply strong support | examples should be broad and caveated | do not frame as supported workflow examples |

## Tier-specific messaging rules

### Tier 1

Allowed:

- exact workflow name
- workflow-specific readiness language
- workflow-specific missing-fact framing

Not allowed:

- implying runtime verification from UI alone
- hiding trust caveats when backend includes them

### Tier 2

Allowed:

- family name
- family-level readiness framing
- conservative wording about exact route not being fully direct yet

Not allowed:

- exact workflow certainty if backend did not provide it
- workflow-specific success language

Recommended copy:

- "LucidSpec recognizes this request at the workflow-family level."
- "Exact workflow routing is still being handled conservatively."

### Tier 3

Allowed:

- partial-support language
- clear downgrade explanation
- limited prework framing if provided by backend

Not allowed:

- presenting the request as deeply covered
- hiding ambiguity or missing-signal reasons

Recommended copy:

- "LucidSpec found relevant operational signals, but support for this exact request is still partial."

### Tier 4

Allowed:

- engineering-related fallback posture
- broad next-step framing only when backend provides it

Not allowed:

- detailed workflow-specific readiness framing
- workflow-specific missing-fact tables

Recommended copy:

- "This request is engineering-related, but LucidSpec does not yet have strong workflow-specific deterministic coverage for it."

### Tier 5

Allowed:

- boundary notice
- short explanation
- reframing guidance if backend provides it

Not allowed:

- readiness badge language that sounds like a covered workflow evaluation
- workflow-specific action framing

Recommended copy:

- "This request falls outside LucidSpec's current execution-readiness support boundary."

## Ambiguous and partial-support behavior

### Ambiguous request

Frontend should:

- explain that one safe workflow route was not identified
- avoid exact workflow naming unless backend explicitly provides it
- encourage breaking the request into one concrete execution target

### Multi-workflow request

Frontend should:

- explain that the request combines multiple changes
- avoid a single overconfident readiness story
- encourage splitting work into separate execution requests

### Supported plus unsupported mixed request

Frontend should:

- explain that only part of the request fits current deterministic coverage
- avoid presenting the whole request as fully supported

### Planning or governance-only request

Frontend should:

- explain that LucidSpec needs a concrete execution target
- avoid execution-ready visual language

## Frontend implementation rules

### Generator page

The generator page should:

- stop using broad domain chips as implicit support claims
- use backend tier/routing data when available for post-generation messaging
- keep prompt examples from implying support-tier promotion on their own

### Marketing/product pages

Marketing pages should:

- stay broad at the product category level
- avoid phrases that imply universal deterministic workflow depth
- use wording that matches conservative evaluation behavior

### Operator/ticket surfaces

Operator/ticket surfaces should:

- remain backend-driven
- show unsupported-boundary notices prominently when present
- keep workflow/family labels tied to backend contract fields only

## Frontend prerequisites

Before these UI rules can be fully implemented, the frontend contract should carry:

- `support_tier`
- `routing_confidence_class`
- `routing_reason` or equivalent explanation field
- `workflow_family` where relevant
- `workflow_type` where relevant

Today, the frontend already carries some related truth surfaces like:

- `readiness_state`
- `proceed_decision`
- `unsupportedBoundaryNotice`

But it does not yet appear to carry the full support-tier routing contract.

## Day 9 conclusion

The frontend should become support-tier-aware in the same way it is already readiness-aware.

That is the missing alignment step that will let LucidSpec look broad as a product while staying precise as an execution-readiness system.
