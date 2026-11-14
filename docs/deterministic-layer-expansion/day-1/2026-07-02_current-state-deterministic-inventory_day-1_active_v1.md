# Current-State Deterministic Inventory

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document freezes the current deterministic logic that exists across LucidSpec frontend and backend before any deterministic-layer expansion work begins.

It is intended to protect working behavior while making the current architecture explicit.

## Scope

- Frontend repo: `/Users/lavanya/lucidspec-frontend`
- Backend repo: `/Users/lavanya/lucidspec_backend`

## High-level split

LucidSpec today is a hybrid system:

- probabilistic for rough request interpretation, generation, and summarization
- deterministic for routing, readiness normalization, trust constraints, redaction, output shaping, and support boundaries

The backend owns the stronger deterministic policy layer.
The frontend mostly owns deterministic gating, normalization, trust presentation, and UI control.

## Backend deterministic logic

### 1. Workflow routing and support boundaries

Purpose:
- deterministically decides when a raw request is directly supported, partially supported, ambiguous, or unsupported

Primary files:
- `/Users/lavanya/lucidspec_backend/app/domains/tickets/v2/extraction/workflow_classifier.py`
- `/Users/lavanya/lucidspec_backend/docs/WORKFLOW_SUPPORT_BOUNDARY_V1.md`

Current role:
- direct raw-input routing for a small set of workflows
- explicit downgrade to `unknown` for ambiguous or unsupported classes

### 2. Canonical readiness semantics

Purpose:
- defines the canonical readiness state model, blocker categories, unresolved-item categories, severities, proceed-decision labels, and summaries

Primary file:
- `/Users/lavanya/lucidspec_backend/app/readiness.py`

Current role:
- stable readiness vocabulary
- stable proceed semantics
- canonical readiness payloads used downstream

### 3. Deterministic ticket-readiness policy

Purpose:
- deterministically derives draft status, execution status, critical blocker, immediate next action, and request type from grounded engineering signal

Primary file:
- `/Users/lavanya/lucidspec_backend/app/ticket_readiness_policy.py`

Current role:
- request-type classification
- safe-to-start logic
- downgrade behavior when the action is not grounded enough

### 4. Governance and readiness orchestration

Purpose:
- ties readiness, execution-state reasoning, and operator review structure together

Primary file:
- `/Users/lavanya/lucidspec_backend/app/ticket_governance.py`

Current role:
- readiness evaluation orchestration
- partial-signal inference
- canonical operator/readiness bridge

### 5. Trust and anti-invention controls

Purpose:
- prevents invented blockers, invented approvals, domain drift, and unsafe trust overstatement

Primary file:
- `/Users/lavanya/lucidspec_backend/app/ticket_trust.py`

Current role:
- source-truth extraction
- trust-violation detection
- deterministic trust status and repair framing

### 6. Domain shaping and execution logic

Purpose:
- shapes dependencies, implementation sequence, operational split logic, and final output normalization

Primary files:
- `/Users/lavanya/lucidspec_backend/app/ticket_domain.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_execution.py`
- `/Users/lavanya/lucidspec_backend/app/ticket_finalize.py`

Current role:
- dependency-domain shaping
- mixed security/implementation split handling
- implementation sequencing and blocked/safe-prework shaping
- final cleanup and normalization

## Frontend deterministic logic

### 1. Engineering-input gating

Purpose:
- decides whether the prompt looks engineering-related using fixed keyword/action/resource checks

Primary file:
- `/Users/lavanya/lucidspec-frontend/lib/engineeringRelevance.ts`

### 2. Plan and feature gating

Purpose:
- normalizes plans and gates premium features such as meeting briefing access

Primary file:
- `/Users/lavanya/lucidspec-frontend/lib/plans.ts`

### 3. Frontend grounding and readiness helper logic

Purpose:
- provides deterministic grounding/readiness interpretation helpers on the frontend side

Primary file:
- `/Users/lavanya/lucidspec-frontend/lib/groundingEvidence.ts`

Important note:
- this is meaningful deterministic logic, but it is not the authoritative backend workflow support boundary

### 4. Readiness/proceed normalization

Purpose:
- converts backend readiness/proceed fields into stable frontend labels and badge tones

Primary file:
- `/Users/lavanya/lucidspec-frontend/lib/ticketReadiness.ts`

### 5. Output normalization and blocked-view selection

Purpose:
- decides blocked-vs-normal display and standardizes certain output-language patterns

Primary file:
- `/Users/lavanya/lucidspec-frontend/lib/normalizeTicketFormattedOutput.ts`

### 6. Redaction and trust presentation

Purpose:
- masks secrets and sensitive values with deterministic rules
- removes internal repair language
- normalizes trust-facing UI content

Primary files:
- `/Users/lavanya/lucidspec-frontend/lib/redaction.ts`
- `/Users/lavanya/lucidspec-frontend/lib/ticketTrustUi.ts`

### 7. Briefing and workspace guards

Purpose:
- applies deterministic guardrails to briefing display and workspace rollups

Primary files:
- `/Users/lavanya/lucidspec-frontend/app/generator/briefingGuards.ts`
- `/Users/lavanya/lucidspec-frontend/lib/workspaceReadiness.ts`

## Current deterministic architecture summary

| Layer | Current owner | Notes |
|---|---|---|
| Workflow routing | Backend | Narrow direct support, explicit fallback |
| Readiness state semantics | Backend | Canonical and structured |
| Request type / safe-to-start policy | Backend | Deterministic, stronger than current routing breadth |
| Trust and anti-invention | Backend | Strong deterministic layer |
| Domain shaping and finalization | Backend | Significant shaping and cleanup logic |
| Input gating | Frontend | Coarse engineering filter |
| Plan gating | Frontend | Deterministic and simple |
| Readiness label normalization | Frontend | Deterministic projection of backend state |
| Trust/redaction presentation | Frontend | Deterministic cleanup and display control |
| Marketing/prompt-level domain breadth | Frontend | Broader than backend direct support |

## Current-state conclusion

The current deterministic layer is real and meaningful.

However, the backend direct workflow-routing boundary is materially narrower than the frontend’s presented domain breadth.

That is the central Day 1 truth that the expansion effort must address without breaking the current stable workflows.
