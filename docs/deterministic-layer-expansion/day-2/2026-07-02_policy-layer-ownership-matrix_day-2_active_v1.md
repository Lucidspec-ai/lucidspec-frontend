# Policy Layer Ownership Matrix

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines which deterministic layer owns each class of logic in the expanded LucidSpec architecture.

The goal is to prevent new workflow support from being implemented in the wrong place.

## Ownership matrix

| Concern | Global rules | Workflow family | Workflow overlay | Readiness engine | Frontend rendering |
|---|---|---|---|---|---|
| Engineering/non-engineering gating semantics | Primary | No | No | No | Display only |
| Unsupported request posture | Primary | No | No | Uses result | Display only |
| Ambiguous request downgrade semantics | Primary | Family may contribute patterns | Workflow may contribute patterns | Uses result | Display only |
| Workflow-family definition | No | Primary | No | Uses result | Display only |
| Workflow-specific definition | No | Shared context only | Primary | Uses result | Display only |
| Raw fact extraction | No | No | No | No | No |
| Fact normalization | Global shared conventions only | Family shape conventions | Workflow-specific mapping only if needed | Uses facts | No |
| Required-fact policy | No | Primary for shared facts | Primary for exceptions | Evaluates | No |
| Approval policy | Global defaults only | Primary | Primary for workflow-specific conditions | Evaluates | No |
| Validation policy | Global wording only | Primary | Primary for workflow-specific details | Evaluates | No |
| Rollback/recovery policy | Global defaults only | Primary | Primary for workflow-specific conditions | Evaluates | No |
| Safe-prework policy | Global fallback semantics only | Primary | Primary for workflow-specific restrictions | Evaluates | No |
| Blocker severity semantics | Global vocabulary | Family mappings | Workflow-specific exceptions | Evaluates | No |
| Trust constraints | Global anti-invention baseline | Family trust constraints | Workflow-specific trust constraints | Evaluates / reports | Display only |
| Readiness-state vocabulary | Primary | No | No | Uses vocabulary | Projects only |
| Proceed-decision vocabulary | Primary | No | No | Uses vocabulary | Projects only |
| Canonical readiness decision | No | No | No | Primary | Projects only |
| Canonical routing decision | Global posture + family/workflow input | Family input | Workflow input | Primary consumer/output | Projects only |
| Output contract fields | Contract-level shared ownership | No | No | Produces canonical values | Consumes |
| Badge/card/layout styling | No | No | No | No | Primary |
| UI wording projection | Global allowed caveats only | No | No | No | Primary within contract limits |

## Practical ownership rules

### Global rules own

- the system-wide meaning of readiness states
- the meaning of supported vs unsupported vs ambiguous posture
- the system-wide trust baseline
- masking and anti-invention behavior that should never vary by workflow

### Workflow-family rules own

- the common operational controls for a family
- shared approval logic
- shared validation expectations
- shared rollback or recovery expectations
- shared safe-prework defaults
- shared family trust boundaries

### Workflow overlays own

- exact workflow-specific required facts
- workflow-specific conditions that change family defaults
- workflow-specific downgrade or blocker cases
- workflow-specific trust constraints

### Readiness owns

- evaluating facts, policy, and overlays together
- producing canonical:
  - readiness state
  - blockers
  - missing required facts
  - safe prework
  - rationale
  - basis and basis detail

### Frontend rendering owns

- labels, badges, and page layout
- projection into cards, tables, rows, sections
- collapse/expand behavior
- wording only where it does not change backend meaning

## Explicit “must not own” rules

| Layer | Must not own |
|---|---|
| Global rules | workflow-specific required facts or domain-specific exceptions |
| Workflow family | raw prompt extraction, UI semantics, or canonical output rewriting |
| Workflow overlay | broad family meaning or global trust/masking semantics |
| Readiness engine | authoring new family policy or extracting brand-new facts from raw input |
| Frontend rendering | reclassifying readiness state, inventing blockers, inferring new facts, or upgrading support posture |

## Decision rules for future implementation

When adding a new behavior, use this test:

### Put it in global rules if:

- it should apply to every workflow
- changing it should affect all workflows the same way

### Put it in family policy if:

- it is shared across several workflows in one family
- it expresses a reusable operational expectation

### Put it in workflow overlay if:

- it is unique to a single workflow
- it cannot be safely generalized upward

### Put it in readiness if:

- it is evaluation logic rather than policy definition
- it turns facts + policy into a canonical decision

### Put it in frontend rendering if:

- it changes only how truth is displayed
- it does not change semantic meaning

## Key Day 2 conclusion

LucidSpec should broaden deterministic support by adding reusable family policy and narrow workflow overlays, while keeping canonical evaluation and frontend display separate.

That separation is essential to avoid losing working logic while support expands.
