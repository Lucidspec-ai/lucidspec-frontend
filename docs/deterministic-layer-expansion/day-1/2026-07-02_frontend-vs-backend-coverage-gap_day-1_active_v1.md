# Frontend vs Backend Coverage Gap

Status: Active
Owner: Lavanya
Last updated: 2026-07-02
Version: v1

## Purpose

This document captures the current gap between:

- what the frontend presents as supported engineering-domain breadth
- what the backend currently verifies as direct deterministic workflow support

## Frontend-presented breadth

The frontend generator currently presents broad engineering domain support through prompt-level guidance and domain labels.

Current frontend supported-domain labels:

- Cloud Infrastructure
- Virtualization
- Backup & Recovery
- DevOps & CI/CD
- Networking
- OS Tasks
- Storage
- Security
- Infrastructure Automation
- Software Development

Primary evidence:
- `/Users/lavanya/lucidspec-frontend/app/generator/page.tsx`
- `/Users/lavanya/lucidspec-frontend/docs/LUCIDSPEC_GUIDE.md`

## Backend direct deterministic coverage

Current direct raw-input deterministic routing is limited to:

- `rds_backup`
- `cloudwatch_alarm`
- `ec2_patching`

Current partial support only:

- `firewall_rule_change`
- `iam_access_request`
- `cloudtrail_logging_retention`
- `vmware_cluster_change`
- `software_bug_fix`

## Coverage-gap summary

| Area | Frontend implication today | Backend verified reality today | Gap level |
|---|---|---|---|
| Cloud Infrastructure | Broadly supported | Only a narrow subset is direct deterministic support | High |
| Virtualization | Broadly supported | Partial support through `vmware_cluster_change` only | High |
| Backup & Recovery | Broadly supported | Strongest verified area because `rds_backup` is direct support | Medium |
| DevOps & CI/CD | Broadly supported | Only partial signal around `software_bug_fix` / related hints | High |
| Networking | Broadly supported | Partial support through `firewall_rule_change` only | High |
| OS Tasks | Broadly supported | No verified direct workflow listed | High |
| Storage | Broadly supported | No explicit direct deterministic workflow listed | High |
| Security | Broadly supported | Partial support through firewall/IAM/cloudtrail-adjacent workflows | Medium-High |
| Infrastructure Automation | Broadly supported | No explicit direct deterministic workflow listed | High |
| Software Development | Broadly supported | Partial support through `software_bug_fix` only | High |

## Key Day 1 truth

The frontend is presenting engineering breadth at the prompt and marketing level.
The backend is enforcing a much narrower direct deterministic truth.

This does not mean the frontend is wrong to accept broad engineering input.
It does mean the current system risks implying broader verified deterministic support than the backend currently guarantees.

## Risks created by this gap

- customer expectations exceed verified support
- demos may sound broader than real direct deterministic depth
- trust can weaken if users assume prompt-level breadth equals deterministic workflow certainty
- frontend and backend may drift further unless support tiers become explicit

## Day 1 planning implication

The deterministic-layer expansion must solve two things in parallel:

1. broaden backend deterministic coverage safely
2. tighten the contract between frontend-presented support and backend-verified support

## Recommended Day 2 carry-forward

The next phase should define:

- explicit support tiers
- a canonical routing contract
- frontend display behavior by support tier
- family-level vs workflow-level coverage language

That will let LucidSpec broaden coverage without continuing to rely on implicit interpretation of “supported domains.”
