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

function backendUrl(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/^\/api\/tickets\/saved\//, '/tickets/saved/')
  return `${API_BASE}${path}`
}

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
  const { value: safeText, stats } = redactWithStats(text, 'pm_assistant_response')
  logRedactionTelemetry('pm_assistant_response', stats)
  const out = new NextResponse(safeText, {
    status: res.status,
    headers: { 'content-type': ct || 'text/plain; charset=utf-8' },
  })
  if (rid) out.headers.set('x-upstream-request-id', rid)
  out.headers.set('x-rate-limit-remaining', String(rl.remaining))
  return out
}

async function proxy(req: NextRequest, method: 'GET' | 'PATCH' | 'DELETE') {
  const rl = rateLimit(req, `tickets-saved-${method.toLowerCase()}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: string | undefined
  if (method === 'PATCH') {
    try {
      body = JSON.stringify(await req.json())
    } catch {
      body = '{}'
    }
  }

  try {
    const res = await fetch(backendUrl(req), {
      method,
      headers: {
        Authorization: auth,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      cache: 'no-store',
    })
    return await proxyJsonResponse(res, rl)
  } catch {
    return NextResponse.json({ error: 'Unable to reach /tickets/saved endpoint' }, { status: 502 })
  }
}

export async function GET(req: NextRequest) {
  return proxy(req, 'GET')
}

export async function PATCH(req: NextRequest) {
  return proxy(req, 'PATCH')
}

export async function DELETE(req: NextRequest) {
  return proxy(req, 'DELETE')
}
