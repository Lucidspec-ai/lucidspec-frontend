# Frontend Overclaim Remediation List

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document identifies the main frontend areas where LucidSpec currently risks overstating deterministic support and defines the cleanup needed.

## Highest-priority overclaim areas

| Priority | File | Current overclaim risk | Why it is risky | Recommended cleanup |
|---|---|---|---|---|
| High | `/Users/lavanya/lucidspec-frontend/app/generator/page.tsx` | `SUPPORTED_DOMAINS` lists broad domains as if equally supported | backend deterministic support is much narrower than the domain chip list suggests | relabel as example engineering areas or reduce to verified families until support-tier UI exists |
| High | `/Users/lavanya/lucidspec-frontend/app/generator/page.tsx` | prompt starters include many not-yet-supported workflows like Azure landing zones, Hyper-V, Cohesity, Veeam, Jenkins, DNS failover, SAN, Terraform, SIEM onboarding, Salesforce integration | examples are read by users as implicit product capability claims | either tag as illustrative only or rotate prompts toward verified and near-term workflows |
| High | `/Users/lavanya/lucidspec-frontend/lib/apiTypes.ts` | no `support_tier` or `routing_confidence_class` in core frontend contract types | frontend cannot render truthful support depth if the contract does not carry it | add routing/support-depth fields once backend exposes them |
| High | `/Users/lavanya/lucidspec-frontend/components/features.tsx` | copy says LucidSpec ensures every task is clear, complete, and ready to execute | sounds universal rather than conservative and tier-aware | soften to "helps determine whether work is ready, partially ready, or still blocked" |
| High | `/Users/lavanya/lucidspec-frontend/components/HomeContent.tsx` | use cases and workflow claims span migration, infrastructure, security, and compliance without backend support boundary caveat | suggests broad operational parity across families that are not equally mature | add wording that support depth varies and execution-readiness results are conservative when coverage is partial |

## Medium-priority overclaim areas

| Priority | File | Current overclaim risk | Why it is risky | Recommended cleanup |
|---|---|---|---|---|
| Medium | `/Users/lavanya/lucidspec-frontend/lib/engineeringRelevance.ts` | broad keyword gate makes many requests look accepted and therefore "supported" | intake acceptance can be confused with verified deterministic workflow coverage | keep the gate broad if desired, but add clearer expectation-setting copy near submission |
| Medium | `/Users/lavanya/lucidspec-frontend/components/HomeContent.tsx` | example outputs show strong readiness mechanics without saying coverage depends on workflow support depth | users may assume all technical work gets the same depth of assessment | add a short support-boundary or conservative-evaluation sentence in readiness explainer areas |
| Medium | `/Users/lavanya/lucidspec-frontend/components/features.tsx` | "Engineer-Ready Outputs" can sound like universal direct output quality across all workflows | backend today is stronger for some workflows than others | qualify this feature with deterministic support depth or workflow-dependent confidence |
| Medium | `/Users/lavanya/lucidspec-frontend/app/generator/page.tsx` | "supported domains" naming itself is overconfident | product may be relevant to these domains without having equal deterministic support | rename to `Example engineering areas` or similar |

## Lower-priority or already-better-aligned areas

| Area | File(s) | Assessment |
|---|---|---|
| Operator unsupported-boundary rendering | `/Users/lavanya/lucidspec-frontend/components/tickets/OperatorReviewSurface.tsx`, `/Users/lavanya/lucidspec-frontend/components/tickets/TicketOutputLayout.tsx` | already relatively aligned because it renders backend boundary notices rather than inventing them |
| Readiness-state normalization | `/Users/lavanya/lucidspec-frontend/lib/ticketReadiness.ts` | mostly aligned because it maps backend readiness tokens instead of inferring new ones |
| Workspace readiness rollups | workspace readiness components | lower immediate risk, assuming counts are backend-driven and not workflow-claim-driven |

## Prompt-level overclaim inventory

These prompt examples most clearly imply workflow support beyond today's direct deterministic reality:

- blue/green ECS deployment workflow
- Azure landing zone with hub-spoke networking and policy enforcement
- Hyper-V VM creation automation
- Cohesity backup policy design
- Veeam backup job setup
- Jenkins pipeline creation
- DNS failover planning
- Linux hardening via Ansible
- SAN zoning and LUN mapping
- IAM least-privilege model for multi-account AWS
- SIEM onboarding runbook
- Terraform module for Cloud Run
- Ansible app deployment automation
- Salesforce integration plan
- coding standards and CI checks for a microservice

These may be valid future-facing examples, but they currently function as capability signals and should be handled carefully.

## Recommended remediation order

1. rename broad generator support labels first
2. reduce or qualify the most overconfident prompt starters
3. soften universal marketing claims about execution-readiness breadth
4. add backend-driven support-tier contract fields
5. introduce tier-aware UI behavior once the backend contract is ready

## Suggested replacement language patterns

Instead of:

- "Supported domains"

Use:

- "Example engineering areas"
- "Common request areas"

Instead of:

- "LucidSpec ensures every task is clear, complete, and ready to execute"

Use:

- "LucidSpec helps determine whether technical work is ready, partially ready, or still blocked before it moves downstream"

Instead of:

- examples that imply full deterministic support

Use:

- examples tied to verified workflows
- or a small label like "Illustrative example"

## Day 9 conclusion

The main frontend overclaim problem is not the operator review UI.

It is the combination of broad intake categories, broad prompt examples, and broad product copy that makes LucidSpec look more operationally verified than the backend currently is.
