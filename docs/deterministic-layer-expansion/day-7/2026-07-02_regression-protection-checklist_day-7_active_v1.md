# Regression Protection Checklist

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This checklist defines the required regression review before LucidSpec expands deterministic workflow support.

It is intended to be used during implementation review, test review, and pre-merge verification.

## Baseline-protection checklist

Before approving deterministic-layer changes, confirm:

- `rds_backup` still passes its readiness-engine tests
- `cloudwatch_alarm` still passes its readiness-engine tests
- `ec2_patching` still passes its readiness-engine tests
- current Tier 1 workflows still preserve anti-invention behavior
- current Tier 1 workflows still preserve safe-prework behavior
- current Tier 1 workflows still preserve rendering/trust contract stability where shadow coverage exists

## Workflow-expansion checklist

For every workflow being added or promoted, confirm:

- the workflow family is explicitly assigned
- current and target support tiers are documented
- required facts are documented
- downgrade triggers are documented
- trust constraints are documented
- regression fixtures exist for standard scenarios
- positive coverage tests exist
- missing-fact downgrade tests exist
- false-precision tests exist
- trust tests exist
- safe-prework tests exist

## Regression-pack checklist

Confirm the workflow has all required scenarios:

- `fully_ready`
- `near_ready`
- `blocked`
- `prework_only`
- `vague_but_valid`
- `unsupported_input`

Also confirm:

- each fixture has a clear title
- each fixture has an explicit expected state
- expected missing facts are locked where relevant
- expected blockers are locked where relevant
- expected safe prework is locked where relevant

## False-precision checklist

Before promotion, confirm there is explicit coverage for:

- ambiguous request wording
- missing critical workflow facts
- planning/review-only requests
- unsupported/narrative inputs
- supported-plus-unsupported mixed scope if relevant
- multi-workflow input if relevant

## Trust checklist

Before promotion, confirm LucidSpec does not invent:

- approvals
- change windows
- targets
- dependencies
- rollback paths
- validation success
- systems or scope not present in the input

Also confirm:

- explicit user controls are preserved
- forbidden anti-invention categories remain locked
- masking-sensitive cases still pass if the family handles sensitive values

## Safe-prework checklist

Before promotion, confirm:

- safe prework is still offered where policy allows
- safe prework is not used to hide missing execution controls
- review-only requests stay conservative
- prework guidance is family-relevant and not invented

## Shadow review checklist

Use this section when the workflow has a current path that can be compared to the new deterministic path.

Confirm:

- shadow comparison was run where applicable
- critical fact extraction did not drift unexpectedly
- readiness-state differences are documented if they exist
- trust findings did not worsen
- rendering/output differences are acceptable and explainable
- overall shadow verdict is acceptable before promotion

## Frontend/backed alignment checklist

Before changing customer-visible support claims, confirm:

- backend routing and readiness support actually exists
- frontend does not imply stronger workflow certainty than backend assigned
- unsupported-boundary messaging is still accurate
- support-tier display rules still match backend truth

## Merge-readiness checklist

Do not merge deterministic expansion work until:

- baseline Tier 1 workflows are green
- the promoted workflow's regression pack is complete
- promotion-tier test rules are satisfied
- unsupported-boundary coverage still passes
- trust and anti-invention coverage still passes
- any required shadow review is complete

## Review cadence recommendation

Use this checklist:

- before merging workflow-family rule changes
- before merging workflow-overlay changes
- before promoting a workflow tier
- before changing frontend support messaging tied to deterministic coverage

## Day 7 conclusion

The regression checklist is how LucidSpec protects itself from accidental credibility loss.

If a workflow cannot pass this checklist, it is not ready for stronger deterministic support claims yet.
