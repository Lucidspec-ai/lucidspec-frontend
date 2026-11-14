// Minimal in-memory rate limiter for Next.js route handlers.
// Note: This is per-instance only (not shared across serverless instances).

type Bucket = { hits: number[] }
const buckets = new Map<string, Bucket>()

function getClientId(req: Request): string {
  const xfwd = req.headers.get('x-forwarded-for') || req.headers.get('X-Forwarded-For') || ''
  const ip = xfwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
  return ip
}

export function rateLimit(req: Request, key: string, limit = 60, windowMs = 60_000) {
  const id = getClientId(req)
  const bucketKey = `${key}:${id}`
  const now = Date.now()
  const windowStart = now - windowMs

  let b = buckets.get(bucketKey)
  if (!b) {
    b = { hits: [] }
    buckets.set(bucketKey, b)
  }

  // prune old hits
  b.hits = b.hits.filter((t) => t > windowStart)

  if (b.hits.length >= limit) {
    return { ok: false, remaining: 0 }
  }

  b.hits.push(now)
  const remaining = Math.max(0, limit - b.hits.length)
  return { ok: true, remaining }
}

