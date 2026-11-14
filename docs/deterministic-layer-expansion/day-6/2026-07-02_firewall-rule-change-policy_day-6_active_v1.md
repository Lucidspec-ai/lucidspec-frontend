# Firewall Rule Change Policy Sheet

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the proposed deterministic policy sheet for `firewall_rule_change` as a Wave 1 workflow.

## Classification

- workflow: `firewall_rule_change`
- family: `network_security`
- current support tier: Tier 3
- target support tier: Tier 1

## Execution-ready required facts

The workflow should be considered execution-ready only when these facts are grounded:

- environment
- target rule identity or equivalent concrete target
- source scope
- destination scope
- protocol
- port or service
- approval
- change window
- validation
- rollback

## Prework-only required facts

The workflow may remain prework-only when LucidSpec has enough information to safely support planning/review work but not execution.

Minimum prework-only grounding:

- identifiable firewall policy area, rule family, or target context
- enough context to review current policy posture
- explicit non-execution or review intent, or missing execution controls that still allow policy review

## Optional helpful facts

- business rationale
- owner/team
- system dependency notes
- change ticket identifier
- related migration wave or application segment

## Approval policy

- production firewall changes should require explicit approval
- production firewall changes should require an explicit change window
- ambiguous approval language should downgrade or block rather than be assumed approved

## Validation policy

Expected validation should prove the requested access change works as intended without widening scope.

Preferred validation examples:

- connectivity test
- firewall logs
- both together when available

If validation is present but ambiguous, the workflow should downgrade rather than invent a validation path.

## Rollback policy

- rollback is a hard requirement for execution-ready posture
- the rollback should restore the prior access posture
- "remove the rule" is an acceptable grounded rollback pattern when explicitly stated

## Safe prework policy

Allowed safe prework includes:

- review current firewall policy
- gather exact source/destination scope
- confirm protocol and port/service details
- identify affected systems
- prepare validation method

Safe prework should not imply the rule itself is ready to implement.

## Trust constraints

LucidSpec must not invent:

- CIDRs
- host/IP targets
- source/destination boundaries
- protocol
- port/service
- approval state
- change window
- rollback action

## Common ambiguity cases

- request names the destination but not the source scope
- request says "open the usual port" without naming port/service
- request references branch-office or app traffic without concrete network ranges
- validation says "validate later" or "details still need to be clarified"
- request combines firewall change with load balancer or DNS routing changes

## Downgrade triggers

Downgrade from execution-ready posture when:

- source scope is missing
- protocol is missing
- port/service is missing
- approval is missing or ambiguous
- change window is missing for production
- validation is ambiguous
- rollback is missing
- the request spans multiple network-security workflows

## Regression-aligned behavior notes

Current backend regression behavior already indicates:

- fully specified production requests with rollback and validation can be execution-ready
- missing only rollback can remain partially ready
- ambiguous validation should remain partially ready, not falsely blocked as unsupported
- review-only requests should remain limited prework only

## Day 6 conclusion

`firewall_rule_change` is a strong Wave 1 candidate because its required facts, controls, and downgrade patterns are already clear and highly reusable within the network-security family.
