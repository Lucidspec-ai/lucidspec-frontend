'use client'

type Props = Record<string, unknown>

type EventItem = { body: string; retries: number }

let q: EventItem[] = []
let sending = false
let debounceTimer: any = null
const MAX_RETRIES = 2
const BATCH_MS = 400

function enqueue(body: string) {
  q.push({ body, retries: 0 })
  scheduleSend()
}

function scheduleSend() {
  if (sending) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void flush(false), BATCH_MS)
}

function flushWithBeacon(items: EventItem[]) {
  // Fire one beacon per batch for reliability across browsers
  try {
    const payload = '[' + items.map((i) => i.body).join(',') + ']'
    const blob = new Blob([payload], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/track', blob)
      return true
    }
  } catch {}
  return false
}

async function flush(forceBeacon: boolean) {
  if (!q.length) return
  sending = true
  const batch = q.splice(0, q.length)

  // If page is hiding or forceBeacon, prefer beacon
  const isHidden = typeof document !== 'undefined' && (document.hidden || (document as any).visibilityState === 'hidden')
  if (forceBeacon || isHidden) {
    flushWithBeacon(batch)
    sending = false
    return
  }

  // Try fetch once; requeue failed ones with backoff
  try {
    const payload = '[' + batch.map((i) => i.body).join(',') + ']'
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
    // Requeue with retries
    for (const item of batch) {
      if (item.retries < MAX_RETRIES) {
        q.push({ body: item.body, retries: item.retries + 1 })
      }
    }
    // schedule retry with simple backoff
    setTimeout(() => void flush(false), 800)
  } finally {
    sending = false
  }
}

// Public API
export function track(event: string, props: Props = {}) {
  try {
    const body = JSON.stringify({ event, props, t: Date.now() })
    enqueue(body)
  } catch {
    // ignore
  }
}

// Flush on page hide/unload
if (typeof window !== 'undefined') {
  const flushNow = () => flush(true)
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) flushNow()
  })
  window.addEventListener('pagehide', flushNow)
  window.addEventListener('beforeunload', flushNow)
}

