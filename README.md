# LucidSpec Frontend

Next.js App Router frontend for LucidSpec. It includes auth, ticket generation, knowledge briefings, billing, and a blog/admin surface, with proxy API routes that forward to the LucidSpec backend.

## Highlights
- Ticket generator with redaction, exports (CSV/JSON), and quota handling.
- Knowledge briefing (meeting transcripts) with file uploads and sanitized output.
- Supabase auth (client-side) with session storage and gated routes.
- Stripe checkout and billing portal via proxy routes.
- Blog + admin UI powered by Supabase storage.

## Tech Stack
- Next.js App Router (React + TypeScript)
- Tailwind CSS utility classes
- Supabase Auth + Storage
- Stripe (checkout/portal via backend)
- DOMPurify for HTML sanitization
- Vitest for tests

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `NEXT_PUBLIC_API_BASE_URL` (backend origin, no trailing slash)
   - Optional URL overrides: `NEXT_PUBLIC_SITE_URL`, `FRONTEND_BASE_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Lint and tests:
   ```bash
   npm run lint
   npm test
   ```

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint
- `npm test` - run Vitest

## Project Structure
- `app/` - Next.js App Router routes and layouts
  - `app/api/` - proxy API routes (rate limited)
  - `app/generator/`, `app/history/`, `app/blog/`, `app/admin/`, `app/pricing/`, `app/account/` - core product pages
- `components/` - shared UI components
- `lib/` - API helpers, Supabase clients, redaction, exports, analytics
- `docs/` - product and internal guide (`docs/LUCIDSPEC_GUIDE.md`)
- `public/` - static assets
- `types/` - shared TypeScript types

## Key Routes (User-Facing)
- `/generator` - ticket generator (auth required)
- `/generate` - legacy generator entry (if enabled in UI)
- `/history` - ticket history
- `/history/[id]` - ticket detail
- `/pricing` - plans and checkout entry
- `/account` - account + billing portal
- `/blog` - public blog
- `/admin/blog` - blog admin (auth required)

## Proxy API Routes (Selected)
- `POST /api/generate` → backend `/generate`
- `POST /api/generate-briefing` → backend `/generate-briefing`
- `GET /api/me` and `GET /api/me/quota` → backend `/me`, `/me/quota`
- `GET /api/tickets/{id}` and `POST /api/tickets/{id}/share`
- `POST /api/stripe/checkout` and `POST /api/stripe/portal`

## Security & Privacy Notes
- Redaction helpers in `lib/redaction.ts` mask obvious secrets/PII before storage or logging.
- HTML output is sanitized with DOMPurify before render.
- Sessions are stored in `sessionStorage` and cleared when the browser closes.

## Deployment
Build with `npm run build` and serve with `npm run start`. Ensure production env vars are set for Supabase, backend API base URL, and frontend base URL. See `docs/LUCIDSPEC_GUIDE.md` for deeper environment and operational notes.

## Support
For product or data requests, contact support@lucidspec.app.
