# Family Definition Of Done

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines when a workflow family should be considered done enough to support deeper deterministic expansion.

## Core rule

A family is not done when one workflow works.

A family is done when shared controls are real, reusable, tested, and stable across more than one workflow-relevant case.

## Family-level definition of done

Every family is done only when all of the following are true:

### 1. Family boundaries are explicit

- the family is named and documented
- included workflows are documented
- excluded or not-yet-supported workflow shapes are understood
- typical ambiguity patterns are documented

### 2. Shared controls are explicit

- shared required facts are documented
- shared approval rules are documented
- shared validation expectations are documented
- shared rollback/recovery expectations are documented
- shared safe-prework patterns are documented
- shared trust constraints are documented

### 3. Family policy exists in the backend

- shared controls are implemented in reusable family policy
- overlays inherit family logic instead of duplicating it
- family policy does not break current Tier 1 workflows

### 4. Family downgrade behavior is safe

- ambiguous requests in the family downgrade correctly
- mixed-scope requests in the family downgrade correctly
- planning-only requests in the family do not overclaim workflow support

### 5. Family test coverage exists

- family-level required facts are covered in readiness tests
- family-level ambiguity behavior is covered
- family-level trust constraints are covered
- more than one workflow or workflow-shape in the family is exercised where possible

### 6. Family supports truthful promotion

- the family can support Tier 2 family-grounded claims without overclaiming exact workflow coverage
- sibling workflows in the family do not regress when one workflow is promoted

## Family done standard by maturity

| Family maturity | Meaning |
|---|---|
| Early | documented family only, not ready for promotion claims |
| Emerging | family controls exist, but support still depends mostly on individual overlays |
| Promotion-ready | family policy is reusable, ambiguity behavior is safe, Tier 2 claims are supportable |
| Stable | family supports multiple workflows with reusable controls and low regression risk |

## Wave 1 family completion goal

Before Wave 2 begins, these families should be considered at least promotion-ready:

- `logging_monitoring`
- `network_security`
- `identity_access`
- `software_delivery`
- `platform_infrastructure`

That does not mean every workflow inside them is Tier 1.

It means the family itself can safely support structured deterministic expansion.

## Family is not done yet if

- overlays still duplicate most shared logic
- family ambiguity behavior is not tested
- sibling workflows regress when one workflow is promoted
- the family can only work through one-off workflow branches

## Day 10 conclusion

Family done means reusable deterministic policy exists in practice, not just on paper.

That is what turns LucidSpec from a set of examples into a scalable readiness system.
