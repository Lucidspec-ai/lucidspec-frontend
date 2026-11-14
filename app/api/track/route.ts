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

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'track', 120, 60_000)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  let payload: any = null
  try {
    payload = await req.json().catch(() => null)
  } catch {
    payload = null
  }

  const enriched = {
    ...(payload || {}),
    meta: {
      path: req.nextUrl.pathname,
      search: req.nextUrl.search,
      referrer: req.headers.get('referer') || req.headers.get('referrer') || undefined,
      ua: req.headers.get('user-agent') || undefined,
      ts: Date.now(),
    },
  }

  const auth = req.headers.get('authorization') || req.headers.get('Authorization') || undefined
  const xff = req.headers.get('x-forwarded-for') || req.headers.get('X-Forwarded-For') || undefined
  const xri = req.headers.get('x-real-ip') || req.headers.get('X-Real-IP') || undefined

  try {
    await fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
        ...(xff ? { 'x-forwarded-for': xff } : {}),
        ...(xri ? { 'x-real-ip': xri } : {}),
      },
      body: JSON.stringify(enriched),
      cache: 'no-store',
    }).catch(() => {})
  } catch {}

  const out = new NextResponse(null, { status: 204 })
  out.headers.set('x-rate-limit-remaining', String(rl.remaining))
  return out
}
