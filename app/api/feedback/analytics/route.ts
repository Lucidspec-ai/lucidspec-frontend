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

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, 'feedback-analytics', 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const qs = url.searchParams.toString()
  const apiUrl = `${API_BASE}/feedback/analytics${qs ? `?${qs}` : ''}`

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { Authorization: auth },
      cache: 'no-store',
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
    const out = new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': ct || 'text/plain; charset=utf-8' },
    })
    if (rid) out.headers.set('x-upstream-request-id', rid)
    out.headers.set('x-rate-limit-remaining', String(rl.remaining))
    return out
  } catch {
    return NextResponse.json({ error: 'Unable to reach /feedback/analytics endpoint' }, { status: 502 })
  }
}
