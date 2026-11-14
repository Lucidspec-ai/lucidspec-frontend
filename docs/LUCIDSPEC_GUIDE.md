# LucidSpec Frontend Guide
Updated: May 20, 2026  
Audience: internal developers, product/support, and anyone maintaining the frontend.

## 1) What This Repo Is
LucidSpec is a Next.js App Router frontend for:
- AI-assisted ticket generation
- Meeting transcript summarization and PM briefings
- Ticket and briefing history
- Stripe billing flows
- Supabase-backed auth and blog/admin tooling

The frontend is mostly a thin UI plus a small set of proxy routes that forward authenticated requests to the LucidSpec backend, then redact/sanitize responses before rendering them.

## 2) Stack Overview
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS utilities in JSX
- Supabase Auth and Storage
- Stripe checkout and billing portal via backend proxy routes
- DOMPurify for sanitizing rendered HTML
- Vitest for unit tests

## 3) Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example`.
3. Set the required env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Or `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a fallback
   - `NEXT_PUBLIC_API_BASE_URL`
4. Optional frontend URL overrides used by billing/redirect flows:
   - `NEXT_PUBLIC_SITE_URL`
   - `FRONTEND_BASE_URL`
   - `NEXT_PUBLIC_FRONTEND_URL`
   - `NEXT_PUBLIC_APP_URL`
5. Optional cost-display env vars used by the generator UI:
   - `NEXT_PUBLIC_LLM_INPUT_COST_PER_1K`
   - `NEXT_PUBLIC_LLM_OUTPUT_COST_PER_1K`
6. Start the app:
   ```bash
   npm run dev
   ```
7. Useful checks:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

## 4) Environment Behavior
- Backend base URL comes from `NEXT_PUBLIC_API_BASE_URL`, then falls back to `NEXT_PUBLIC_API_BASE`, then `NEXT_PUBLIC_API_URL`.
- If none are set, the frontend defaults to `https://lucidspec-backend.onrender.com`.
- Stripe success/cancel URLs are derived from request headers first, then from the frontend URL env vars.
- The sample `.env.example` points local frontend traffic at `http://127.0.0.1:8001`.

## 5) Auth Model
- Supabase auth is initialized in `lib/supabase.ts`.
- Sessions are intentionally stored in `sessionStorage`, not `localStorage`.
- Auth uses PKCE, `persistSession: true`, and `autoRefreshToken: true`.
- Protected user flows fetch a Supabase access token and pass it to the backend through Next.js API routes or `lib/api.ts`.
- Common auth pages:
  - `/signin`
  - `/signup`
  - `/forgot-password`
  - `/reset-password`
  - `/account`

## 6) Plan Model
Current frontend plan normalization:
- `free`
- `starter`
- `pro`

Plan-related behavior in code:
- Free users can sign up and access the basic workspace/ticket flow.
- Paid billing flows exist only for `starter` and `pro`.
- Meeting briefings are gated to `pro` in `lib/plans.ts`.
- Pricing UI also markets future `team` and `enterprise` options, but those are currently contact/early-access paths, not normalized runtime plans.

## 7) Main User-Facing Pages
- `/` marketing homepage
- `/pricing` pricing and checkout entry
- `/workspace` workspace entry page
- `/generator` main product surface for tickets and knowledge workflows
- `/history` paginated ticket history
- `/history/[id]` ticket detail
- `/briefings` generated briefing dashboard with filtering and outcome analytics
- `/briefings/[id]` briefing detail
- `/account` billing portal entry
- `/blog` public blog
- `/docs` lightweight public docs placeholder page
- `/contact`, `/terms`, `/privacy`, `/founder`, `/features`, `/agents`

Workspace-specific contract reference:
- `docs/WORKSPACE_OVERVIEW_CONTRACT.md` defines the planned summary contract for the backend workspace overview endpoint.

## 8) Ticket Generation Flow
Primary page: `/generator`

What the UI does:
- Requires a valid auth session
- Accepts freeform task input
- Shows guided prompt starters across several domains
- Calls `POST /api/generate`
- Normalizes and sanitizes formatted HTML output before rendering
- Supports copy/export flows for generated tickets
- Shows backend validation metadata when present:
  - validation status
  - readiness status/reason
  - risk flags
  - dependency flags
  - assumption flags
- Optionally displays token/cost estimates if pricing env vars are configured

Related utility modules:
- `lib/ticketExport.ts`
- `lib/htmlToPlainText.ts`
- `lib/normalizeTicketFormattedOutput.ts`
- `lib/copy.ts`

## 9) Meeting Summary And Briefing Flow
LucidSpec now has two related transcript-oriented backend surfaces:
- `POST /api/meeting-summary`
- `POST /api/generate-briefing`
- `POST /api/meeting-summary/preview`
- `POST /api/generate-briefing/preview`

Current UI behavior:
- The main `/generator` page exposes a knowledge workflow alongside tickets.
- Briefing access is restricted to Pro plans.
- The frontend can process pasted transcript text and uploaded files.
- The codebase includes normalization helpers for meeting summaries and layered briefings.
- Generated briefings can later be reviewed in `/briefings` and `/briefings/[id]`.
- Long transcript inputs are previewed before generation. The preview response shows estimated token range, cost range, API-call range, chunk count, and warnings.
- If preview reports the transcript is too large, the UI blocks full generation and asks the user to split the transcript.
- When the user confirms preview estimates, the frontend calls `/api/meeting-summary`, then calls `/api/generate-briefing` with the generated `meeting_summary`.
- The frontend omits the full transcript from `/api/generate-briefing` when `meeting_summary` is available.
- Briefing responses surface backend usage data when present, including `usage.tokens_in`, `usage.tokens_out`, estimated cost, and cache/fallback savings signals.
- Graceful-degradation responses such as `summary_too_large`, `generation_limited`, and `rate_limit_exceeded` are shown with backend fallback guidance when available.

The briefing dashboard includes:
- search
- has-risk filter
- has-dependency filter
- outcome analytics cards
- trend data for accepted/edited/rejected outcomes

## 10) History And Retrieval
### Ticket history
- `/history` fetches paginated results from `GET /api/tickets?limit=&page=`
- Pagination size in the current UI is 10 items per page
- `/history/[id]` loads a single ticket with copy/download actions

### Briefing history
- `/briefings` fetches from backend endpoints directly through `lib/api.ts`, not through Next.js proxy routes
- `/briefings/[id]` loads a detailed layered briefing view

This means ticket history is proxied through `app/api`, while briefing and analytics history currently calls the backend origin directly from the client with the bearer token.

## 11) Billing And Checkout
Billing entry points:
- `components/PricingTable.tsx`
- `app/account/page.tsx`
- `app/signup/plan/page.tsx`
- `app/checkout/success/page.tsx`
- `app/checkout/cancel/page.tsx`

Supported paid checkout plans:
- `starter`
- `pro`

Billing behavior:
- Unauthenticated users are pushed through signup/signin before checkout
- Authenticated users call `POST /api/stripe/checkout`
- Billing management uses `POST /api/stripe/portal`
- Billing portal only appears in pricing UI for paid plans

## 12) Blog And Admin
Public blog:
- `/blog`
- `/blog/[slug]`

Admin blog tooling:
- `/admin/blog`
- `/admin/blog/new`

Admin behavior:
- Requires a signed-in user
- Checks `profiles.role === 'admin'` in Supabase
- Reads/writes `blog_posts`
- Uses `/api/admin/blog/upload` for cover/content uploads to Supabase Storage
- Large markdown bodies can be stored as storage pointers instead of inline DB text

## 13) Next.js API Routes In This Repo
These routes mainly proxy to the backend and apply light rate limiting.

### Generation and summaries
- `POST /api/generate`
- `POST /api/generate-briefing`
- `POST /api/generate-briefing/preview`
- `POST /api/meeting-summary`
- `POST /api/meeting-summary/preview`

### Account and usage
- `GET /api/me`
- `GET /api/me/quota`

### Tickets
- `GET /api/tickets`
- `GET /api/tickets/[id]`
- `POST /api/tickets/[id]/share`
- `GET /api/public/tickets/[id]?share=...`

### Billing
- `POST /api/stripe/checkout`
- `POST /api/stripe/portal`

### Feedback and analytics
- `POST /api/feedback`
- `GET /api/feedback/comments`
- `GET /api/feedback/analytics`
- `POST /api/track`

### Admin
- `POST /api/admin/blog/upload`

## 14) Rate Limits In Frontend Proxies
Current per-instance in-memory limits from `app/api/_lib/rateLimit.ts`:
- `generate`: 20/min
- `generate-briefing`: 4/min
- `meeting-summary`: 8/min
- `generate-briefing-preview`: 60/min
- `meeting-summary-preview`: 60/min
- `tickets-list`: 60/min
- `ticket-detail`: 60/min
- `ticket-share`: 30/min
- `public-ticket`: 30/min
- `stripe-checkout`: 20/min
- `stripe-portal`: 20/min
- `feedback`: 60/min
- `feedback-comments`: 30/min
- `feedback-analytics`: 30/min

Important constraint:
- This limiter is in-memory and per instance only. It is not shared across multiple serverless instances.
- Preview routes are intentionally less strict because they estimate token/cost ranges and do not call OpenAI.
- Expensive generation routes are stricter to match backend cost controls and avoid frontend calls the backend would reject anyway.

## 15) Security, Privacy, And Sanitization
- Redaction logic lives in `lib/redaction.ts`.
- Proxy routes redact backend responses before returning them to the client for ticket, summary, briefing, and ticket-history payloads.
- DOMPurify sanitizes rendered HTML before display.
- The frontend avoids storing auth sessions permanently by using `sessionStorage`.
- Copy/export utilities convert rendered HTML to safer plain text or file output where needed.

Important caveat:
- Redaction is best effort. Users still should not paste secrets or regulated data unless the broader system is approved for it.

## 16) Analytics And Feedback
The repo contains explicit user feedback plumbing:
- thumbs/quality feedback submission through `POST /api/feedback`
- comment retrieval through `GET /api/feedback/comments`
- analytics retrieval through `GET /api/feedback/analytics`

The briefings dashboard also surfaces outcome analytics and trend reporting from backend analytics endpoints.

## 17) Known Product/Repo Realities
- Share-link support exists in the API and component layer, but the UI is disabled because `shouldShowShare` is hardcoded to `false` in `components/ShareButton.tsx`.
- The public `/docs` page is still just a placeholder shell, not a complete documentation center.
- Pricing UI advertises Team and Enterprise packages, but runtime plan handling only recognizes `free`, `starter`, and `pro`.
- Briefings and outcome analytics are fetched client-to-backend through `lib/api.ts`, not through local Next.js proxy routes.

## 18) Quick Support Guide
### For end users
1. Sign up or sign in.
2. Use `/generator` for ticket generation.
3. If on Pro, use the knowledge workflow for transcript summaries and briefings.
4. Open `/history` for prior tickets.
5. Open `/briefings` for briefing history and analytics.
6. Use `/pricing` or `/account` to start checkout or manage billing.

### For internal support
- Auth issue in dev: clear site storage and sign in again.
- Backend unreachable errors usually mean `NEXT_PUBLIC_API_BASE_URL` is wrong or backend CORS/origin config is incomplete.
- Missing billing portal usually means backend Stripe portal configuration is incomplete.
- If blog admin fails, verify Supabase auth, `profiles.role`, storage bucket access, and upload route behavior.
