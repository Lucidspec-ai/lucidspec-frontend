# VMware Cluster Change Policy Sheet

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the proposed deterministic policy sheet for `vmware_cluster_change` as a Wave 1 workflow.

## Classification

- workflow: `vmware_cluster_change`
- family: `platform_infrastructure`
- current support tier: Tier 3
- target support tier: Tier 1

## Execution-ready required facts

The workflow should be considered execution-ready only when these facts are grounded:

- environment
- target cluster/location
- capacity or sizing
- network design
- storage policy
- dependencies
- approval
- change window
- validation
- rollback

## Prework-only required facts

The workflow may remain prework-only when LucidSpec has enough information to support capacity/dependency review without claiming cluster-build readiness.

Minimum prework-only grounding:

- identifiable platform or cluster-expansion context
- enough context to review current capacity/dependency inventory
- explicit non-execution or review intent, or missing execution controls that still allow platform review

## Optional helpful facts

- owner/team
- dependency owner
- build sequence detail
- host profile detail
- compute/storage ratios
- landing-zone readiness detail

## Approval policy

- production cluster build/change should require explicit approval
- production execution should require a scheduled change window
- ambiguous approval language should downgrade or block rather than be assumed satisfied

## Validation policy

Expected validation should prove the built/changed cluster is healthy and dependencies are satisfied.

Preferred validation examples:

- confirm HA is healthy
- confirm DRS is healthy
- confirm dependency signoffs remain satisfied after build

## Rollback policy

- rollback is a hard requirement for execution-ready posture
- acceptable rollback patterns include tearing down the new cluster definition or another explicit recovery path

## Safe prework policy

Allowed safe prework includes:

- review current cluster capacity
- review dependency inventory
- confirm landing-zone/network prerequisite status
- clarify storage policy
- prepare build sequencing

Safe prework should not imply the cluster build itself is ready.

## Trust constraints

LucidSpec must not invent:

- cluster target/location
- network design
- storage policy
- dependency signoff
- approval state
- change window
- rollback viability

## Common ambiguity cases

- "build a new cluster for prod" with no location
- sizing present but no network design
- networking dependency referenced but not grounded
- storage policy missing or loosely implied
- request mixes capacity brainstorming with immediate build execution

## Downgrade triggers

Downgrade from execution-ready posture when:

- target is missing
- network design is missing
- storage policy is missing
- dependencies are missing
- approval is missing or ambiguous
- change window is missing for production
- rollback is missing
- the request is a capacity review rather than a concrete build/change request

## Regression-aligned behavior notes

Current backend regression behavior already indicates:

- grounded production cluster build requests with sizing, network, storage, dependencies, approval, window, validation, and rollback can be execution-ready
- missing only approval/window can remain partially ready
- missing target, network design, storage policy, or dependencies can block execution support
- review-only requests should remain limited prework only

## Day 6 conclusion

`vmware_cluster_change` is a strong Wave 1 workflow because it opens the platform-infrastructure family through a workflow with clear dependency, validation, and rollback semantics.
