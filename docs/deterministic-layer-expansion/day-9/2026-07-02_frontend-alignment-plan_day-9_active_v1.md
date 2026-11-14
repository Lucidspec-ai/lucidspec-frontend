# Frontend Alignment Plan

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines how the LucidSpec frontend should align with backend deterministic support truth.

The goal is not to make the frontend narrower than the product vision.

The goal is to make sure customer-visible execution-readiness behavior does not imply stronger verified support than the backend can actually provide.

## Current frontend truth

### What is already reasonably aligned

The frontend already has strong truth-preserving behavior in some operator-facing areas:

- readiness display is driven by backend `readiness_state` and `proceed_decision`
- unsupported-boundary notices are already renderable through operator review surfaces
- the output layout generally consumes backend review payloads instead of inventing blockers locally

Relevant files:

- `/Users/lavanya/lucidspec-frontend/lib/ticketReadiness.ts`
- `/Users/lavanya/lucidspec-frontend/components/tickets/TicketOutputLayout.tsx`
- `/Users/lavanya/lucidspec-frontend/components/tickets/OperatorReviewSurface.tsx`

### What is not yet aligned

The frontend currently overstates or risks overstating support in these ways:

- the generator page presents broad domain categories that exceed backend deterministic coverage
- prompt starters imply concrete workflow competence across many not-yet-supported workflows
- engineering-input gating accepts a very broad set of engineering requests
- core product copy often speaks in product-wide readiness terms without distinguishing verified deterministic depth
- the frontend does not currently carry `support_tier` or `routing_confidence_class` in API types or rendering logic

Relevant files:

- `/Users/lavanya/lucidspec-frontend/app/generator/page.tsx`
- `/Users/lavanya/lucidspec-frontend/lib/engineeringRelevance.ts`
- `/Users/lavanya/lucidspec-frontend/components/HomeContent.tsx`
- `/Users/lavanya/lucidspec-frontend/components/features.tsx`
- `/Users/lavanya/lucidspec-frontend/lib/apiTypes.ts`

## Frontend alignment objective

The frontend should distinguish between:

- broad product relevance
- verified deterministic workflow support
- partial or family-level support
- unsupported or ambiguous execution-readiness cases

That distinction should be visible in:

- intake messaging
- example prompts
- operator review surfaces
- readiness language
- workflow promotion messaging

## Recommended frontend alignment model

### Layer 1: Product positioning

This layer may stay broad.

Examples:

- "LucidSpec helps teams assess technical work before it reaches execution."
- "LucidSpec supports readiness review across infrastructure, security, delivery, and compliance-oriented work."

This layer should not claim:

- direct deterministic workflow support everywhere
- equal workflow depth across all listed categories

### Layer 2: Intake and prompt guidance

This layer should be broad but careful.

It should:

- invite engineering-related work
- avoid implying that every prompt starter is already deeply supported
- gradually reflect verified workflow families more honestly

This layer should distinguish:

- example problem spaces
- verified execution-readiness coverage

### Layer 3: Execution-readiness UI

This layer must be backend-truth-bound.

It should only render:

- support tier from backend
- routing confidence from backend
- workflow family from backend
- workflow type from backend
- unsupported/ambiguous notices from backend

It must not infer any of those from prompt text, example domains, or frontend heuristics.

## Required frontend changes by area

| Area | Current state | Needed alignment change |
|---|---|---|
| Generator domain chips | broad categories imply broad support | relabel as example domains or narrow to verified families until support-tier UI exists |
| Prompt starters | many examples imply strong coverage for unsupported workflows | tag examples as illustrative or preferentially feature verified/near-term workflows |
| Engineering gate | broad keyword gate accepts much more than deterministic backend can route | keep broad gate if desired, but add clearer expectation-setting copy before generation |
| Product marketing copy | often speaks in universal readiness language | add wording that LucidSpec evaluates support conservatively and may return partial or boundary-limited readiness |
| API types | missing `support_tier` and `routing_confidence_class` | add fields once backend exposes them |
| Output views | no support-tier-aware rendering yet | introduce tier-aware copy and layout rules after contract fields exist |

## Implementation phases

### Phase 1: Messaging cleanup before UI semantics change

Do first:

- soften broad generator domain claims
- reduce overconfident prompt starter implications
- adjust marketing copy where it sounds like all categories are equally execution-ready today

This phase is low risk because it does not require backend contract changes.

### Phase 2: Add backend truth fields to frontend contracts

Do next:

- add `support_tier`
- add `routing_confidence_class`
- add `workflow_family` if missing in relevant surfaces
- add `routing_reason` if exposed for operator-facing views

This phase should be contract-tested in `lib/apiTypes.ts` and consuming components.

### Phase 3: Add support-tier-aware UI behavior

Do after contracts land:

- show partial-support posture cleanly
- show unsupported/ambiguous posture clearly
- avoid workflow-specific certainty when backend only provides family-level support

### Phase 4: Per-workflow alignment during promotion

When a workflow is promoted, update:

- generator examples if that workflow is featured
- workflow-specific marketing references
- support-tier UI behavior
- boundary copy for sibling workflows in the same family

## Frontend alignment checklist per workflow

Use this checklist whenever a workflow is promoted or newly featured in the frontend.

### Contract checklist

- backend exposes the workflow's `support_tier`
- backend exposes the workflow's `workflow_family`
- backend exposes the workflow's `workflow_type` when appropriate
- backend exposes unsupported/ambiguous boundary details where relevant

### Rendering checklist

- Tier 1 workflows use workflow-specific copy only when backend confirms direct support
- Tier 2 workflows use family-level copy, not workflow-specific certainty
- Tier 3 workflows clearly say support is partial
- Tier 4 workflows do not render as deeply supported
- Tier 5 workflows show clear support-boundary messaging

### Messaging checklist

- the workflow is not featured in prompt starters prematurely
- generator category labels do not imply stronger support than backend truth
- workflow marketing copy is updated only after promotion tests are satisfied

### Regression checklist

- frontend still renders unsupported-boundary notices correctly
- frontend still avoids inventing blockers or missing facts
- readiness badges still reflect backend state only
- analytics or instrumentation still capture boundary reviews correctly if applicable

## Day 9 conclusion

Frontend alignment is not mainly a styling problem.

It is a truth-boundary problem: broad product positioning can stay broad, but execution-readiness UI must become support-tier-aware and contract-driven as backend coverage expands.
