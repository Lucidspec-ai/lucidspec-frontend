# Family Controls Matrix

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the reusable family-level readiness controls for LucidSpec's deterministic layer.

Its role is to make family policy explicit before workflow overlays are added or expanded.

## Design rule

Family-level controls should capture what is operationally shared across multiple workflows in the same family.

They should define:

- shared required facts
- shared approval rules
- shared validation expectations
- shared rollback or recovery expectations
- shared safe-prework patterns
- shared trust constraints

They should not define workflow-only exceptions that apply to one workflow and not the rest of the family.

## Family controls matrix

| Family | Shared required facts | Shared approval rules | Shared validation expectations | Shared rollback / recovery expectations | Shared safe-prework patterns | Shared trust constraints |
|---|---|---|---|---|---|---|
| `cloud_operations` | target resource, environment, account or region when relevant, owner, rollout window, validation method | production-impacting changes usually require approval or a defined change window; non-production may be lighter | verify target state, service health, monitoring signal, and environment-specific validation path | rollback or recovery path should exist for execution-impacting changes; cutover-risk changes need explicit fallback | gather maintenance window, confirm owner, verify target inventory, prepare validation checklist | do not invent instance targets, maintenance windows, approvals, or environment scope |
| `network_security` | source, destination, protocol or port, target environment, owner, business/security rationale | security-sensitive changes typically require explicit owner or security signoff; production scope raises approval expectations | validate connectivity effect, confirm intended scope, verify no wider-than-requested exposure, confirm post-change behavior | revert path is usually mandatory; rollback should restore previous access posture | collect rule scope, identify affected systems, confirm requester intent, prepare validation method before cutover | do not invent CIDRs, ports, sources, destinations, security approvals, or exposure assumptions |
| `platform_infrastructure` | target platform/system, environment, owner, dependency owner, rollout window, validation method | shared infra changes usually require owner coordination; production-impacting work often needs scheduling approval | verify target capacity/state, dependency impact, and post-change service or platform health | recovery or fallback path should exist when platform state changes are not trivially reversible | inventory dependencies, confirm ownership, prepare implementation sequence, schedule validation steps | do not invent dependency owners, platform topology, maintenance timing, or recovery capability |
| `backup_recovery` | target asset, schedule or execution window, retention, environment, owner, validation or restore method | policy-bound backup changes may require owner or change approval; production data protection changes should assume stronger control expectations | validate backup creation, retention behavior, and where relevant restore or recovery evidence | recovery path is central to this family; restore validation should be expected whenever meaningful | confirm asset scope, retention target, schedule details, and collect validation evidence plan before execution | do not invent retention periods, recovery guarantees, encryption state, restore success, or policy approvals |
| `software_delivery` | target service/app, environment, owner, dependency impact, deployment path, validation method | release-impacting changes often require team approval or release-window coordination; production changes need explicit rollout governance | validate tests, deployment outcome, service health, and user-visible behavior where applicable | rollback or rollback-equivalent mitigation should exist for production-facing delivery changes | clarify scope, capture deployment path, collect dependency owners, line up validation checklist before release | do not invent test coverage, deployment paths, release approvals, dependency readiness, or rollback safety |
| `identity_access` | identity target, access scope, environment/account scope if relevant, approver, least-privilege rationale, expiration or review path, validation method | approvals are central to this family; access changes should usually require named approver evidence | validate granted scope, intended principal, least-privilege alignment, and post-change access behavior | recovery means revoke, expire, or revert access; access-removal path should be known before execution | collect principal details, scope, justification, approver evidence, and expiry/review details before granting | do not invent approvers, principals, least-privilege rationale, access duration, or entitlement scope |
| `logging_monitoring` | source system, destination or alert target, environment, owner, retention if relevant, validation method | monitoring/logging changes may require owner approval; compliance-relevant logging often raises control expectations | validate signal flow, alert behavior, retention behavior, and observability outcome | recovery path should restore prior alert/log behavior or preserve auditability if change fails | confirm source and destination, capture alert/log intent, verify ownership, prepare validation signal check | do not invent metrics, log destinations, retention values, notification targets, or observed signal success |
| `compliance_remediation` | control or requirement, owner, severity/due-date context, target system/process, required evidence, validation standard | remediation actions usually require owner accountability and sometimes control-owner or audit-owner approval | validate that the control gap is actually addressed and evidence meets the stated audit/compliance bar | recovery may mean reverting unsafe enforcement or preserving evidence trail when rollback is not simple | gather control reference, owner, due-date/severity context, evidence needs, and implementation boundary before execution | do not invent control obligations, auditor expectations, remediation completion, or acceptable evidence |

## Family detail

### `cloud_operations`

Shared required facts:

- target resource or service
- environment
- region/account when relevant
- owner or operating team
- rollout window
- validation method

Shared approval rules:

- production-impacting operational changes should generally require approval or a valid change window
- non-production changes may downgrade approval strictness but should not invent permission

Shared validation expectations:

- confirm the targeted system reached the requested state
- confirm post-change health signal
- confirm the validation method is tied to the resource or workload

Shared rollback/recovery expectations:

- execution-impacting work should identify a fallback or recovery action
- if the workflow is hard to roll back, that must be explicit rather than assumed

Shared safe-prework patterns:

- gather asset identifiers
- confirm owner and environment
- prepare maintenance window and validation checklist

Shared trust constraints:

- never invent instance IDs, cluster names, regions, accounts, change windows, or health checks

### `network_security`

Shared required facts:

- source
- destination
- protocol/port or equivalent access scope
- target environment
- owner
- rationale
- validation method

Shared approval rules:

- security-sensitive access changes should assume explicit ownership/security approval matters
- production-exposure changes should treat missing approval as more serious

Shared validation expectations:

- verify intended traffic is allowed or denied as requested
- verify blast radius is limited to requested scope
- verify post-change behavior through grounded test path

Shared rollback/recovery expectations:

- prior access posture should be recoverable
- rollback should be treated as a hard expectation unless the workflow proves an alternative safety model

Shared safe-prework patterns:

- gather addressing/scope details
- identify impacted systems
- prepare connectivity validation

Shared trust constraints:

- never invent network ranges, ports, security signoff, business need, or exposure boundaries

### `platform_infrastructure`

Shared required facts:

- target platform/system
- environment
- owner
- dependency owner
- rollout window
- validation method

Shared approval rules:

- major infra changes generally require owner coordination
- production platform work often requires scheduled execution approval

Shared validation expectations:

- confirm platform state and dependency health after change
- validate that intended capacity or configuration target was reached

Shared rollback/recovery expectations:

- infrastructure changes need fallback path or recovery procedure when state changes are not trivial

Shared safe-prework patterns:

- dependency mapping
- owner coordination
- environment confirmation
- execution sequencing draft

Shared trust constraints:

- never invent topology details, dependency ownership, maintenance windows, or recoverability

### `backup_recovery`

Shared required facts:

- target asset
- retention
- schedule/window
- owner
- environment
- validation or restore method

Shared approval rules:

- data-protection changes often require explicit ownership or policy approval
- production backup posture changes should assume stronger control requirements

Shared validation expectations:

- verify backup configuration or execution outcome
- verify retention behavior
- verify recovery evidence where relevant

Shared rollback/recovery expectations:

- this family must emphasize recovery realism, not just configuration completion
- if restore validation is absent, readiness should remain conservative

Shared safe-prework patterns:

- confirm protected asset scope
- collect retention target
- gather schedule details
- prepare validation evidence plan

Shared trust constraints:

- never invent retention values, restore proof, recovery guarantees, encryption state, or success criteria

### `software_delivery`

Shared required facts:

- target service/application
- environment
- owner
- dependency impact
- deployment path
- validation method

Shared approval rules:

- production delivery changes usually require release coordination or owner approval
- riskier rollout types may need explicit change-window alignment

Shared validation expectations:

- verify tests or equivalent validation path
- verify deployment outcome
- verify user/service health after release

Shared rollback/recovery expectations:

- production delivery should have rollback or mitigation path
- non-reversible changes should be treated conservatively

Shared safe-prework patterns:

- clarify scope
- capture deployment path
- line up validation and dependency owners
- prepare rollout checklist

Shared trust constraints:

- never invent test evidence, release approval, dependency readiness, deployment steps, or rollback confidence

### `identity_access`

Shared required facts:

- principal or identity target
- requested scope of access
- approver
- least-privilege rationale
- expiry/review path
- validation method

Shared approval rules:

- named approval is typically central
- missing approver evidence should generally block execution-grade access changes

Shared validation expectations:

- confirm the right principal received the intended scope only
- confirm duration/expiry expectations
- confirm access behaves as intended

Shared rollback/recovery expectations:

- removal, expiry, or entitlement reversal should be known before grant/execution

Shared safe-prework patterns:

- gather principal identity
- confirm scope and environment
- collect approval and business rationale
- prepare expiry/review details

Shared trust constraints:

- never invent approvers, scopes, durations, business need, or entitlement mappings

### `logging_monitoring`

Shared required facts:

- source system
- destination or alert target
- environment
- owner
- retention if relevant
- validation method

Shared approval rules:

- ownership approval often matters
- audit-relevant logging changes should be treated with stronger control posture

Shared validation expectations:

- verify signal flow, alarm behavior, or log delivery
- confirm retention/notification behavior when relevant

Shared rollback/recovery expectations:

- previous alert or logging path should be restorable
- auditability should not be silently degraded

Shared safe-prework patterns:

- confirm source and destination
- identify ownership
- define validation signal
- collect retention or alert settings

Shared trust constraints:

- never invent metrics, thresholds, alert targets, destinations, retention values, or observed signal health

### `compliance_remediation`

Shared required facts:

- control/requirement identifier
- owner
- severity or due-date context
- target system/process
- required evidence
- validation standard

Shared approval rules:

- control-owner accountability matters
- some remediations may require audit or governance acknowledgement before closure claims

Shared validation expectations:

- verify the gap is actually remediated
- verify the evidence meets the stated compliance expectation

Shared rollback/recovery expectations:

- if enforcement changes are introduced, reversion needs thought
- if rollback is not appropriate, evidence preservation and controlled follow-up still matter

Shared safe-prework patterns:

- confirm control reference
- identify owner
- gather evidence expectations
- separate execution remediation from broad governance discussion

Shared trust constraints:

- never invent control obligations, evidence sufficiency, audit acceptance, or remediation completion

## Family-level implementation rule

Every future workflow in a family should start by inheriting these family controls.

Only the differences should be added in a workflow overlay.

## Day 5 conclusion

The family-controls matrix turns LucidSpec's workflow expansion into a reusable policy system.

It gives each family a stable control spine so new workflows can inherit trust-preserving readiness behavior instead of re-implementing it from scratch.
