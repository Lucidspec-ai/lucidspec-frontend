# Do-Not-Break Workflows

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document defines the workflows and behavior that must remain stable during deterministic-layer expansion.

These workflows are the control group for expansion work.

## Control workflows

The current direct deterministic workflows that must remain stable are:

1. `rds_backup`
2. `cloudwatch_alarm`
3. `ec2_patching`

## What must remain stable

For each control workflow, LucidSpec must preserve:

- deterministic routing from raw input
- correct workflow classification
- current readiness-state behavior
- correct proceed-decision behavior
- existing blocker semantics
- trust and anti-invention behavior
- stable frontend readiness rendering

## Stability criteria

These workflows must not regress in the following dimensions:

| Dimension | Must remain stable |
|---|---|
| Routing | Direct support should not be lost |
| Readiness state | Existing ready/blocked/partial semantics should not drift unintentionally |
| Blockers | No invented or missing critical blockers due to expansion work |
| Safe prework | Existing safe-prework behavior must not be loosened or broken |
| Trust | Anti-invention and trust repair behavior must remain intact |
| Frontend display | Readiness labels, proceed labels, and blocked view behavior must remain aligned |

## Why these workflows matter

These workflows are not only current support cases.
They are the safest regression controls because they already define the existing boundary of direct deterministic support.

If they drift while new workflows are added, LucidSpec will broaden coverage at the cost of trust.

## Day 1 implementation guardrails

When implementation begins later, expansion work should follow these rules:

1. do not rewrite control-workflow semantics while adding new workflows
2. do not remove control workflows as baseline regression cases
3. do not promote new workflows without comparing against current control stability
4. do not change frontend wording for these workflows unless backend semantics truly change

## Control-workflow ownership targets for later phases

When coding begins, each control workflow should have:

- explicit positive tests
- explicit downgrade tests
- explicit trust tests
- explicit regression-pack coverage

## Day 1 conclusion

The deterministic-layer expansion is only acceptable if LucidSpec keeps its current direct-support workflows stable while broader family and overlay coverage is added around them.
