# Deterministic Architecture Boundary

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the architecture boundary for LucidSpec's deterministic layer so the system can broaden support without turning into a new set of one-off workflow branches.

It is intended to answer:

- what the deterministic layers are
- what each layer is allowed to own
- what each layer must not own
- how new workflow support should be added without mixing concerns

## Architectural principle

LucidSpec should broaden deterministic support through reusable layers, not through isolated workflow patches.

The deterministic system should have four layers:

1. global rules
2. workflow-family rules
3. workflow overlays
4. output contracts

## Layer 1: Global rules

### Purpose

Global rules define the deterministic behavior that applies across all workflows and should remain stable regardless of domain.

### Owns

- unsupported-request handling
- ambiguous-request downgrade behavior
- request-vs-environment trust basis defaults
- core readiness state vocabulary
- proceed-decision vocabulary
- blocker category vocabulary
- severity vocabulary
- global masking and redaction rules
- anti-invention rules that are not workflow-specific
- global trust caveats

### Must not own

- workflow-specific required facts
- workflow-specific approval policy
- workflow-specific validation policy
- workflow-specific rollback policy
- workflow-specific safe-prework semantics

### Design rule

If a rule should mean the same thing for every workflow, it belongs here.

## Layer 2: Workflow-family rules

### Purpose

Workflow-family rules provide reusable deterministic logic for groups of related execution workflows.

### Owns

- family-level required fact policy
- family-level approval expectations
- family-level validation expectations
- family-level rollback/recovery expectations
- family-level safe-prework defaults
- family-level trust constraints
- family-level downgrade patterns

### Must not own

- raw fact extraction from arbitrary text
- presentation or UI formatting
- highly specific workflow-only facts when they are not shared by the family

### Design rule

If multiple workflows in the same family need the same operational control pattern, it belongs here.

## Layer 3: Workflow overlays

### Purpose

Workflow overlays define the rules that are specific to an individual workflow and cannot safely be generalized at the family level.

### Owns

- workflow-specific required facts
- workflow-specific conditional approvals
- workflow-specific validation details
- workflow-specific rollback triggers
- workflow-specific trust constraints
- workflow-specific downgrade triggers

### Must not own

- broad family semantics
- raw extraction logic
- rendering behavior
- global trust wording

### Design rule

If a rule applies only to one workflow, and cannot be shared cleanly by the family, it belongs here.

## Layer 4: Output contracts

### Purpose

Output contracts define the stable canonical shape that downstream consumers are allowed to read.

### Owns

- canonical readiness output fields
- canonical routing output fields
- operator/frontend-facing projection contracts
- allowed projection rules from canonical state to UI surface

### Must not own

- new policy meaning
- new extraction meaning
- workflow-specific readiness inference

### Design rule

Output contracts project meaning. They do not invent meaning.

## Recommended family set

The deterministic expansion should use these families:

- `cloud_operations`
- `network_security`
- `platform_infrastructure`
- `backup_recovery`
- `software_delivery`
- `identity_access`
- `logging_monitoring`
- `compliance_remediation`

## Boundary between extraction, policy, readiness, and rendering

The backend already suggests a strong boundary model:

- extraction owns captured facts and routing signals
- policy/overlay owns required-fact and workflow policy meaning
- readiness owns evaluation of facts + policy
- frontend/rendering owns layout and display only

This expansion should preserve and strengthen that split.

## Mandatory expansion rule

New deterministic support must be added in this sequence:

1. identify workflow family
2. define family-level controls
3. add workflow overlay only for the differences
4. project through stable contracts

Never start with step 3 unless there is a documented reason.

## Anti-sprawl rules

To prevent one-off branching:

- no workflow should define its own readiness state vocabulary
- no frontend component may reinterpret backend readiness meaning
- no workflow-specific trust copy should bypass canonical trust constraints
- no workflow overlay should duplicate family logic without documentation
- no routing expansion should imply support-tier promotion without policy and tests

## Boundary summary

| Layer | Owns | Must not own |
|---|---|---|
| Global rules | universal readiness/trust/masking semantics | workflow-specific policy |
| Workflow-family rules | reusable family controls | raw extraction and UI semantics |
| Workflow overlays | workflow-specific exceptions and requirements | broad family/global meaning |
| Output contracts | stable projection shapes | policy authorship |

## Day 2 conclusion

LucidSpec should broaden deterministic support by growing horizontally through reusable families and vertically through overlays only where needed.

That is the architecture boundary that protects the system from becoming a pile of new isolated branches.
