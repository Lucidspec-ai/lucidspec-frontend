# Support Tier UI Rules

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines what the frontend may display for each support tier without overstating deterministic coverage.

It extends the existing frontend-backend rendering boundary by making tier-specific display limits explicit.

## Core UI principle

The frontend may render support depth.

The frontend may not infer support depth.

That means:

- backend owns `support_tier`
- backend owns routing confidence
- backend owns boundary notices
- frontend owns presentation only

## Frontend display fields by tier

| UI concern | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|---|---|---|---|---|---|
| workflow family label | show | show | show only if backend provides it | show only if backend provides it | do not infer |
| workflow type label | show | usually hide because it should be null | hide unless backend explicitly sets it | hide | hide |
| readiness badge | show | show with conservative posture | show with caution | show generic posture only | do not imply execution-readiness coverage |
| missing facts | workflow-specific allowed | family-level preferred | high-level only | generic only | do not imply covered workflow requirements |
| safe prework | show when backend provides it | show conservative family-safe actions only | show limited actions only | minimal generic guidance only | none unless backend explicitly provides boundary-safe next step |
| support boundary notice | optional | recommended | recommended | recommended | required |
| confidence explanation | concise | concise | important | important | important |

## Tier-specific UI rules

### Tier 1 UI behavior

Frontend may show:

- workflow family
- workflow type
- workflow-specific readiness language
- workflow-specific missing facts
- workflow-specific next-step framing

Frontend must still not:

- invent new missing facts
- override backend blockers
- imply runtime verification when only policy-derived support exists

### Tier 2 UI behavior

Frontend may show:

- clear family label
- family-level readiness framing
- family-level missing facts
- family-level safe prework

Frontend must not:

- imply that LucidSpec identified the exact workflow type if `workflow_type` is `null`
- render workflow-specific certainty language
- present family support as direct execution support

Recommended language pattern:

- "LucidSpec recognizes this type of work at the family level."
- "Exact workflow routing is not yet fully direct."

### Tier 3 UI behavior

Frontend may show:

- partial support posture
- conservative missing-information framing
- limited prework only when backend provides it

Frontend must not:

- present the request as strongly covered
- collapse partial signals into workflow certainty
- hide the downgrade reason

Recommended language pattern:

- "LucidSpec found some relevant operational signals, but support for this exact request is still partial."

### Tier 4 UI behavior

Frontend may show:

- generic engineering fallback posture
- broad next-step guidance only if backend provides it
- explicit note that workflow-specific deterministic support is not established

Frontend must not:

- display a specific workflow label that the backend did not provide
- display workflow-specific gap tables
- make the generic fallback look like a covered workflow path

Recommended language pattern:

- "This request is engineering-related, but LucidSpec does not yet have strong workflow-specific deterministic coverage for it."

### Tier 5 UI behavior

Frontend may show:

- unsupported boundary notice
- short explanation of why the request is outside scope
- redirect or reframing guidance if backend provides it

Frontend must not:

- display execution-ready posture
- display workflow-specific readiness requirements
- imply that the request was evaluated as a supported execution workflow

Recommended language pattern:

- "This request falls outside LucidSpec's current execution-readiness support boundary."

## Frontend display expectations for downgraded cases

### Ambiguous request

Frontend should:

- show that the request could not be safely routed to one workflow
- avoid showing exact workflow certainty
- encourage decomposition into one execution target at a time

### Multi-workflow request

Frontend should:

- explain that the request combines multiple changes
- avoid a single overconfident readiness result
- encourage splitting the work into separate execution requests

### Supported + unsupported mixed request

Frontend should:

- explain that part of the request is inside current coverage and part is not
- avoid presenting the whole request as fully supported

### Planning or governance-only request

Frontend should:

- explain that LucidSpec needs a concrete execution target for stronger deterministic treatment
- avoid execution-ready framing

## Things the frontend may display but must not infer

The frontend may display these only when they come from backend contracts:

- support tier
- routing confidence explanation
- boundary notice
- workflow family
- workflow type
- workflow-specific missing facts
- safe prework

The frontend must never infer them from its own copy, prompt text, or display heuristics.

## Alignment with current frontend marketing breadth

LucidSpec may describe broad domain relevance in product positioning, but operational UI surfaces must reflect backend-verified deterministic coverage.

This means:

- broad category labels are acceptable in top-level positioning
- execution-readiness UI must remain tier-accurate
- workflow-specific claims must stay tied to backend routing results

## Day 3 conclusion

The UI should make support depth visible without manufacturing certainty.

That is how LucidSpec can look broad at the product level while staying trustworthy at the execution-readiness level.
