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

// The request body here carries credentials -- forwarded straight through
// to the backend, never logged. The response ({ok, message}) never
// contains secrets, see app/models.py TicketingConnectionTestResponse.
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'account-ticketing-test', 10, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: string
  try {
    body = JSON.stringify(await req.json())
  } catch {
    body = '{}'
  }

  try {
    const res = await fetch(`${API_BASE}/integrations/ticketing/test`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    })
    const responseBody = await res.json().catch(() => ({}))
    return NextResponse.json(responseBody, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Unable to reach /integrations/ticketing/test endpoint' }, { status: 502 })
  }
}
