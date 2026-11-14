# Safe Implementation Order

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the safest backend implementation order for the deterministic-layer expansion.

It is optimized to preserve current working logic while making each new step testable and reversible.

## Implementation order

### Step 1: Lock the baseline before changing behavior

First, keep the current Tier 1 workflows locked as baseline controls:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

Required before moving on:

- baseline readiness tests green
- baseline regression packs green
- baseline shadow comparison tests green where applicable

### Step 2: Introduce routing scaffolding without support promotion

Next, add the richer routing structure:

- `workflow_family`
- `workflow_type`
- `support_tier`
- `routing_confidence_class`
- `routing_reason`

Required before moving on:

- current Tier 1 direct routes unchanged
- unsupported/ambiguous requests still downgrade safely
- routing contract tests added

### Step 3: Add family-policy framework

Next, introduce shared family policy so workflows can inherit reusable controls.

Required before moving on:

- family policy exists for Wave 1 families
- readiness engine consumes family policy without regressing Tier 1 workflows
- family-policy tests are green

### Step 4: Formalize Wave 1 overlays without changing public support tier yet

Next, implement workflow overlays for:

- `firewall_rule_change`
- `cloudtrail_logging_retention`
- `iam_access_request`
- `software_bug_fix`
- `vmware_cluster_change`

Required before moving on:

- workflow overlays align with the Day 6 policy sheets
- regression-pack scenarios are complete
- no direct Tier 1 routing claim is added yet

### Step 5: Align trust evaluation to the new family/overlay structure

Next, make sure trust and anti-invention behavior still hold under the new routing and policy model.

Required before moving on:

- trust tests green
- unsupported-boundary behavior preserved
- operator-facing trust surfaces unchanged in meaning

### Step 6: Expand workflow-specific tests and scorecards

Next, finish workflow-level promotion evidence.

Required before moving on:

- extraction coverage complete
- readiness downgrade coverage complete
- false-precision coverage complete
- safe-prework coverage complete
- regression scorecards acceptable

### Step 7: Run shadow comparison where promotion risk is meaningful

Before flipping stronger support claims, run shadow comparison for workflows with partial existing paths or family overlap risk.

Required before moving on:

- no unexplained critical fact drift
- no unexplained readiness-state drift
- trust findings not worse

### Step 8: Promote workflows by tier, one workflow at a time

Finally, promote workflow support in controlled increments:

1. Tier 3 to Tier 2 where family support is proven
2. Tier 2 to Tier 1 only after direct routing is proven

Promotion should happen one workflow at a time, not as one bulk flip.

## Safe order by Wave 1 workflow

Recommended workflow promotion order:

1. `cloudtrail_logging_retention`
2. `firewall_rule_change`
3. `iam_access_request`
4. `software_bug_fix`
5. `vmware_cluster_change`

## Why this order is safest

- `cloudtrail_logging_retention` is adjacent to an already-strong logging family
- `firewall_rule_change` has clear required facts and strong regression structure
- `iam_access_request` is high value but highly trust-sensitive
- `software_bug_fix` is strategically important but broader in wording
- `vmware_cluster_change` is valuable but has heavier dependency and platform-specific complexity

## PR order recommendation

Recommended PR order:

1. baseline lock/check-only PR if needed
2. routing-scaffold PR
3. family-policy framework PR
4. `cloudtrail_logging_retention` overlay + tests PR
5. `firewall_rule_change` overlay + tests PR
6. `iam_access_request` overlay + tests PR
7. `software_bug_fix` overlay + tests PR
8. `vmware_cluster_change` overlay + tests PR
9. trust-alignment PR if shared trust behavior changed
10. tier-promotion PRs, one workflow at a time

## Things that should happen last

These should be last, not first:

- direct routing promotion for new workflows
- frontend-visible support-claim changes
- broad refactors of legacy ticket generation logic
- changes to canonical output contract semantics

## Pause conditions

Implementation should pause if:

- a current Tier 1 workflow regresses
- unsupported-boundary cases weaken
- trust findings worsen
- a family-policy change causes sibling workflow drift
- shadow comparison reveals unexplained semantic mismatch

## Day 8 conclusion

The safest implementation order is to build structure first, prove behavior second, and promote support claims last.

That order gives LucidSpec the best chance of broadening deterministic coverage without losing reliability.
