# Frontend-Backend Rendering Boundary

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines what the frontend is allowed to display, project, and format from backend deterministic outputs, and what it is not allowed to infer.

The goal is to stop semantic drift between backend truth and frontend presentation.

## Core rule

The backend owns deterministic meaning.
The frontend owns deterministic presentation.

The frontend may display and format backend truth.
The frontend may not invent or reinterpret backend truth.

## Backend owns

The backend is the source of truth for:

- workflow family
- workflow type
- support posture / support tier
- readiness state
- proceed decision
- blockers
- missing required facts
- safe prework
- primary next action
- rationale
- trust findings
- masking notices
- unsupported-boundary posture

## Frontend owns

The frontend may own:

- badge styling
- card layout
- row/table/list selection
- section placement
- collapse/expand behavior
- visual grouping
- copy cleanup that does not alter meaning
- deterministic normalization of already-canonical display labels

## Frontend may display but not infer

The frontend may display:

- readiness badges
- proceed cards
- blocker cards
- missing fact rows
- trust review panels
- explanation trace panels
- supported/unsupported notices

The frontend may not infer:

- a stronger readiness state than the backend returned
- a stronger support posture than the backend returned
- new blockers from display text alone
- new missing facts from display text alone
- new next actions not explicitly grounded by backend output
- environment verification from request-grounded evidence

## Projection rules

### Allowed projections

Allowed frontend projections include:

- converting canonical readiness state to badge tone
- projecting blockers into cards or lists
- projecting safe prework into action lists
- projecting rationale into explanation sections
- projecting trust findings into trust review panels

### Disallowed projections

Disallowed frontend projections include:

- recomputing readiness from partial backend fields
- deciding support tier from prompt-domain labels
- synthesizing a new primary next action from generic text
- upgrading partial support into direct support because the UI domain looks similar
- converting request-grounded signals into environment-verified claims

## UI boundary for support tiers

When support tiers are implemented, the frontend must follow these rules:

| Support tier | Frontend may say | Frontend must not say |
|---|---|---|
| Tier 1 direct deterministic support | workflow directly supported | broad family support only |
| Tier 2 family deterministic support | family-supported, workflow-specific certainty may be limited | directly supported workflow unless backend says so |
| Tier 3 partial deterministic support | partial support, conservative readiness | confidently covered workflow |
| Tier 4 generic engineering fallback | engineering-related fallback | deterministic workflow support |
| Tier 5 unsupported | unsupported or outside current supported execution coverage | execution-ready domain support |

## Boundary for prompt-level domain breadth

The frontend currently presents broad engineering domains for input guidance.

That prompt-level breadth must be treated as:

- input guidance
- example generation breadth
- product positioning breadth

It must not be treated as:

- verified deterministic workflow depth
- backend workflow certainty
- direct support claim

## Boundary for operator surfaces

Operator surfaces should consume stable backend view models or contracts rather than ad hoc raw objects.

That means:

- readiness surfaces display backend state
- trace surfaces display backend explanation rows
- trust surfaces display backend trust findings
- the frontend should not become a second readiness engine

## “Display only” normalization allowance

The frontend may continue to perform display-only normalization such as:

- stable uppercase or badge-friendly readiness labels
- blocked-vs-normal layout selection based on canonical fields
- deterministic phrase cleanup that shortens wording without changing meaning

But these transformations must remain:

- semantic-preserving
- contract-preserving
- one-way display projections only

## Red-line rules

The frontend must never:

- infer new support from domain labels alone
- infer new blockers from natural-language summaries
- infer missing required facts independently of backend policy
- infer stronger readiness from polished output text
- repair backend semantic gaps by inventing better-seeming truth

## Day 2 conclusion

As deterministic coverage broadens, LucidSpec must keep the frontend tightly bound to backend canonical semantics.

The frontend can make the truth clearer.
It cannot make the truth stronger.
