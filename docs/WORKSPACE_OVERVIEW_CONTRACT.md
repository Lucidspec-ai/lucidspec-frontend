# Workspace Overview Contract
Updated: June 29, 2026

## Purpose
This document defines the backend contract for the new workspace overview endpoint used by the `/workspace` page. It is intentionally summary-oriented so the frontend can render the dashboard from a single authenticated request instead of fanning out across ticket list, ticket detail, and execution-view endpoints.

## Route
- Method: `GET`
- Path: `/workspace/overview`
- Query params:
  - `limit`
    - optional
    - integer
    - default: `6`
    - maximum: `20`

Example:
```http
GET /workspace/overview?limit=6
Authorization: Bearer <supabase-access-token>
```

## Auth Requirements
- Authentication is required.
- The endpoint must accept the same bearer token currently used by protected workspace and ticket endpoints.
- Auth behavior should match existing protected routes such as:
  - `GET /me`
  - `GET /tickets`
  - `GET /tickets/{id}`
- Unauthorized requests should return `401`.
- Authenticated users may only receive overview data derived from tickets they are already authorized to access.

## Response Schema
The response must remain minimal and summary-oriented.

```json
{
  "attention": {
    "blocking_now": [
      {
        "title": "Cross-account IAM role missing",
        "body": "Implementation cannot begin until the access path is confirmed. Ticket: Enable CloudTrail logging",
        "icon": "shield"
      }
    ],
    "needed_soon": [
      {
        "title": "Approval window required",
        "body": "A maintenance window is still missing. Ticket: Create CloudWatch CPU alarm",
        "icon": "chart"
      }
    ],
    "later": [
      {
        "title": "Capture delivery evidence",
        "body": "Record final audit evidence before closure. Ticket: Enable CloudTrail logging",
        "icon": "briefing"
      }
    ]
  },
  "readiness": {
    "total": 6,
    "ready": 2,
    "partial": 2,
    "blocked": 2,
    "open_decisions": 3,
    "open_blockers": 2,
    "blocking_ticket_count": 2
  },
  "recent_work": [
    {
      "id": "ticket_123",
      "title": "Create CloudWatch CPU alarm",
      "type": "Spec",
      "status": "Ready",
      "updated": "Updated 2h ago",
      "href": "/history/ticket_123"
    }
  ],
  "activity": [
    {
      "label": "Jun 29",
      "count": 3
    }
  ],
  "delivery_snapshot": {
    "items": [
      {
        "label": "Ready tickets",
        "value": 2,
        "detail": "6 recent tickets reviewed"
      },
      {
        "label": "Blocked tickets",
        "value": 2,
        "detail": "2 tickets have blocking items"
      },
      {
        "label": "Attention items",
        "value": 5,
        "detail": "3 tickets have open decisions"
      }
    ]
  }
}
```

## Field Notes
- `attention`
  - Three buckets only: `blocking_now`, `needed_soon`, `later`
  - Each item is display-ready summary text
- `readiness`
  - Aggregate counts only
  - No per-ticket payloads
- `recent_work`
  - Maximum `limit` items
  - Must be display-ready
- `activity`
  - Simple time-bucket counts for the chart
- `delivery_snapshot`
  - Small card-ready summary items only

## Partial Failure Policy
Decision: return partial data with safe defaults when per-ticket summarization fails.

Rules:
- If auth fails, return `401`.
- If the initial ticket list cannot be fetched, return a non-`200` error because the endpoint has no meaningful basis for the overview.
- If one or more ticket-level enrichments fail after the ticket list is available, the endpoint should still return `200` with best-effort summary data.
- Safe defaults should be:
  - empty attention buckets
  - zeroed readiness counts when no usable ticket summaries remain
  - empty `recent_work`
  - empty `activity`
  - empty `delivery_snapshot.items`

Rationale:
- The workspace dashboard is a summary surface and should degrade gracefully.
- A single failed ticket enrichment should not block the entire workspace page.

## Cache Policy
Decision: a short cache window is allowed.

Rules:
- Cache must be private or otherwise scoped safely to the authenticated user context.
- Recommended freshness window: 30 seconds.
- Do not public-cache across users.
- If an intermediate proxy is used, it must preserve auth boundaries.

Rationale:
- The workspace view is operationally useful even if it is slightly stale.
- A short cache window reduces repeated dashboard load cost and helps absorb backend cold starts.

## Non-Goals
- Returning full ticket bodies
- Replacing ticket detail endpoints
- Returning raw execution-view payloads
- Returning debugging metadata in the primary response contract

## Frontend Mapping
Frontend consumers should treat this contract as the source of truth for:
- workspace readiness cards
- attention buckets
- recent work list
- activity chart
- delivery snapshot cards
