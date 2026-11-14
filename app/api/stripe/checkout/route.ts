import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/app/api/_lib/rateLimit'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lucidspec-backend.onrender.com'
)
  .toString()
  .replace(/\/+$/, '')

const DEFAULT_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.FRONTEND_BASE_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://lucidspec-frontend-qfnw.vercel.app'
).replace(/\/+$/, '')

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'stripe-checkout', 20, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Determine plan from JSON payload or query param
  let plan: string | undefined
  try {
    const body = await req.json().catch(() => ({} as any))
    plan = (body?.plan || body?.plan_slug) as string | undefined
  } catch {}
  if (!plan) plan = req.nextUrl.searchParams.get('plan') || undefined
  if (!plan || !['starter', 'pro'].includes(plan)) {
    return NextResponse.json(
      { error: 'Missing or invalid plan', details: "use POST /api/stripe/checkout with body { plan: 'starter' | 'pro' }" },
      { status: 400 }
    )
  }

  const originHeader = req.headers.get('origin') || ''
  const forwardedProto = req.headers.get('x-forwarded-proto') || ''
  const forwardedHost = req.headers.get('x-forwarded-host') || ''
  const hostHeader = req.headers.get('host') || ''

  const derivedOrigin = originHeader
    || (forwardedHost ? `${forwardedProto || 'https'}://${forwardedHost}` : '')
    || (hostHeader ? `${forwardedProto || 'https'}://${hostHeader}` : '')
    || DEFAULT_SITE_URL
    || ''

  const origin = (derivedOrigin || DEFAULT_SITE_URL).replace(/\/$/, '')
  const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/checkout/cancel`

  // Backend expects POST /stripe/checkout/{tier}
  const url = `${API_BASE}/stripe/checkout/${encodeURIComponent(plan)}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        'x-forwarded-origin': origin,
        'x-success-url': successUrl,
        'x-cancel-url': cancelUrl,
      },
      cache: 'no-store',
      body: JSON.stringify({ plan, success_url: successUrl, cancel_url: cancelUrl }),
    })
    const ct = res.headers.get('content-type') || ''
    const rid = res.headers.get('x-request-id') || undefined
    if (ct.includes('application/json')) {
      const body = await res.json().catch(() => ({}))
      const out = NextResponse.json(body, { status: res.status })
      if (rid) out.headers.set('x-upstream-request-id', rid)
      out.headers.set('x-rate-limit-remaining', String(rl.remaining))
      return out
    }
    const text = await res.text().catch(() => '')
    const out = NextResponse.json({ error: text || 'Bad request', upstream_path: `/stripe/checkout/${plan}` }, { status: res.status })
    if (rid) out.headers.set('x-upstream-request-id', rid)
    out.headers.set('x-rate-limit-remaining', String(rl.remaining))
    return out
  } catch {
    return NextResponse.json({ error: 'Unable to reach /stripe/checkout endpoint' }, { status: 502 })
  }
}
