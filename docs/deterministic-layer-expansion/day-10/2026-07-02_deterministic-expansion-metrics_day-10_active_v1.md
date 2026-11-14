# Deterministic Expansion Metrics

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the metrics LucidSpec should use to measure deterministic-layer rollout quality.

## Metric design rule

Every metric should answer one of these questions:

- are we expanding coverage?
- are we preserving trust?
- are we preserving correctness?
- are we creating regressions?

## Rollout metrics

| Metric | Why it matters | Measurement method | Desired direction | Review cadence |
|---|---|---|---|---|
| Tier 1 workflow count | shows real direct deterministic depth | count workflows currently verified as Tier 1 | up, but only with passing promotion gates | weekly |
| Tier 2 workflow/family count | shows reusable family-level coverage growth | count workflows/families with verified Tier 2 support | up | weekly |
| Wave 1 completion rate | shows whether current scope is actually finishing | completed Wave 1 workflows divided by total Wave 1 workflows | up | weekly |
| Extraction pass rate | shows whether critical facts are being preserved | regression/extraction test pass rate per workflow/family | stay high | weekly |
| Readiness accuracy | shows whether readiness states remain correct | readiness test and regression expected-state pass rate | stay high | weekly |
| Anti-invention pass rate | shows whether trust behavior is preserved | trust/gold-set/regression anti-invention pass rate | stay high | weekly |
| Unsupported-boundary correctness | shows whether LucidSpec still refuses unsupported claims correctly | gold-set unsupported-boundary correctness and related tests | stay high | weekly |
| False-ready rate | shows how often unsupported or under-specified work is treated too optimistically | count/read review failed downgrade cases, shadow drift, or regression failures that over-promote readiness | down | weekly |
| False-blocked rate | shows whether useful supported workflows are being blocked too aggressively | review regressions and shadow mismatches where supported cases degrade incorrectly | down | weekly |
| Shadow drift rate | shows how often the new path diverges from acceptable baseline behavior | shadow comparison records with unacceptable drift divided by total shadowed cases | down | weekly |
| Frontend/backend support mismatch count | shows whether product messaging outruns backend truth | count known frontend overclaim items not yet remediated plus new mismatch findings | down | weekly |
| Family reuse score | shows whether expansion is staying architectural instead of one-off | qualitative score: shared family controls used vs duplicated overlay logic | up | monthly |

## Measurement notes

### Tier counts

Source:

- workflow inventory
- current promotion status
- support-boundary documentation

Method:

- maintain a current workflow support tracker
- update the count only after promotion criteria are formally satisfied

### Pass-rate metrics

Source:

- extraction tests
- readiness tests
- regression packs
- gold-set tests

Method:

- use test suite results and scorecards
- treat a failing baseline workflow as a rollout governance alert, not just a unit test failure

### False-ready and false-blocked rate

Source:

- regression failures
- shadow comparison reviews
- manual review of post-implementation cases if available

Method:

- log each confirmed false-ready or false-blocked event
- divide by the reviewed case count for the period when enough volume exists
- before enough production volume exists, use internal reviewed cases and shadow audits

### Shadow drift rate

Source:

- shadow comparison records

Method:

- count records with unacceptable or unexplained semantic drift
- divide by total records reviewed in the period

### Frontend/backend support mismatch count

Source:

- frontend remediation list
- product review findings
- workflow-promotion review checklist

Method:

- count unresolved mismatch items
- add new mismatches found during review
- track closed items separately so trend is visible

### Family reuse score

Source:

- PR review
- family policy vs overlay review

Method:

- simple monthly qualitative score:
  - `low`: most logic is still overlay-specific
  - `medium`: family controls are reused, but duplication remains
  - `high`: overlays are thin and family policy clearly drives most shared logic

## Initial thresholds

| Metric | Healthy threshold | Warning sign |
|---|---|---|
| Baseline Tier 1 pass status | all green | any failure |
| Wave 1 completion rate | steadily increasing week over week | no movement for 2 reviews |
| Anti-invention pass rate | no regression from current baseline | any drop |
| Unsupported-boundary correctness | no regression from current baseline | any drop |
| Shadow drift rate | zero unexplained critical drift | any repeated critical drift |
| Frontend/backend mismatch count | decreasing trend | flat or increasing trend for 2 reviews |

## Day 10 conclusion

The rollout should be measured by truth preservation as much as by coverage growth.

If coverage goes up while trust or boundary correctness goes down, the rollout is not succeeding.
