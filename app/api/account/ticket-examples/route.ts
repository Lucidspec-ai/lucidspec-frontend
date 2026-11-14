import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/app/api/_lib/rateLimit'
import { logRedactionTelemetry, redactWithStats } from '@/lib/redaction'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lucidspec-backend.onrender.com'
)
  .toString()
  .replace(/\/+$/, '')

async function proxyJsonResponse(res: Response, rl: { remaining: number }) {
  const ct = res.headers.get('content-type') || ''
  const rid = res.headers.get('x-request-id') || undefined
  if (ct.includes('application/json')) {
    const body = await res.json().catch(() => ({}))
    const { value: safeBody, stats } = redactWithStats(body, 'pm_assistant_response')
    logRedactionTelemetry('pm_assistant_response', stats)
    const out = NextResponse.json(safeBody, { status: res.status })
    if (rid) out.headers.set('x-upstream-request-id', rid)
    out.headers.set('x-rate-limit-remaining', String(rl.remaining))
    return out
  }
  const text = await res.text().catch(() => '')
  const out = new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': ct || 'text/plain; charset=utf-8' },
  })
  if (rid) out.headers.set('x-upstream-request-id', rid)
  out.headers.set('x-rate-limit-remaining', String(rl.remaining))
  return out
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, 'account-ticket-examples-get', 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch(`${API_BASE}/account/ticket-examples`, {
      method: 'GET',
      headers: { Authorization: auth },
      cache: 'no-store',
    })
    return await proxyJsonResponse(res, rl)
  } catch {
    return NextResponse.json({ error: 'Unable to reach /account/ticket-examples endpoint' }, { status: 502 })
  }
}
