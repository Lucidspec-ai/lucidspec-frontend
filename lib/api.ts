// lib/api.ts
'use client'

// Use a single Supabase client across the app to avoid multiple GoTrue instances
import { supabase } from './supabase'
import { safeGetSession } from './safeSession'

/**
 * Backend base URL
 * - Prefer NEXT_PUBLIC_API_BASE_URL; fall back to NEXT_PUBLIC_API_BASE or NEXT_PUBLIC_API_URL.
 * - No trailing slash; we strip it here just in case.
 */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lucidspec-backend.onrender.com'
).replace(/\/+$/, '')

/**
 * We override RequestInit's body type so callers can pass:
 *  - FormData (sent as-is)
 *  - string (sent as-is)
 *  - object (we JSON.stringify it here)
 *  - undefined/null (no body)
 */
type Opts = Omit<RequestInit, 'body'> & {
  token?: string
  timeoutMs?: number
  body?: FormData | string | Record<string, unknown> | null | undefined
}

export class ApiError extends Error {
  status: number
  code?: string
  requestId?: string
  payload?: unknown

  constructor(message: string, status: number, code?: string, requestId?: string, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.payload = payload
  }
}

const objectDetail = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

/** Get Authorization header from Supabase session unless an explicit token is provided. */
async function buildAuthHeader(explicitToken?: string) {
  if (explicitToken) return { Authorization: `Bearer ${explicitToken}` }
  const { data: { session } } = await safeGetSession()
  const token = session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Core fetch with:
 *  - 60s timeout (default) so the UI doesn’t give up before backend finishes
 *  - Proper JSON handling without double-stringify
 *  - Clear error messages (HTTP status + short body + x-request-id)
 *  - Helpful message for true network/CORS failures
 */
export async function apiFetch<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const fullPath = path.startsWith('/') ? path : `/${path}`
  // Allow calling internal Next.js API routes by passing paths starting with /api/
  const url = fullPath.startsWith('/api/') ? fullPath : `${API_BASE}${fullPath}`

  const {
    token,
    headers: userHeaders,
    body: userBody,
    timeoutMs = 60_000, // 60s default
    ...rest
  } = opts

  // Build request body safely
  let finalBody: BodyInit | undefined
  let willSendJson = false

  if (userBody instanceof FormData) {
    finalBody = userBody // FormData → send as-is (no content-type)
  } else if (userBody === null || typeof userBody === 'undefined') {
    finalBody = undefined
  } else if (typeof userBody === 'string') {
    finalBody = userBody // assume caller stringified if needed
    // Heuristic: if it looks like JSON, set JSON header below
    willSendJson = userBody.trim().startsWith('{') || userBody.trim().startsWith('[')
  } else if (typeof userBody === 'object') {
    // JSON object → stringify here
    finalBody = JSON.stringify(userBody)
    willSendJson = true
  } else {
    // Fallback: coerce to string
    finalBody = String(userBody)
  }

  // Timeout guard
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const authHeader = await buildAuthHeader(token)

    // Only set Content-Type for JSON (not for FormData)
    const contentTypeHeader = willSendJson ? { 'Content-Type': 'application/json' } : {}

    const res = await fetch(url, {
      method: rest.method ?? (finalBody ? 'POST' : 'GET'),
      mode: 'cors',
      cache: 'no-store',
      headers: {
        ...(userHeaders || {}),
        ...contentTypeHeader,
        ...authHeader,
      },
      body: finalBody,
      signal: controller.signal,
      ...rest,
    })

    if (!res.ok) {
      const rid =
        res.headers.get('x-request-id') ||
        res.headers.get('x-upstream-request-id') ||
        undefined
      const ct = res.headers.get('content-type') || ''
      let details = res.statusText || 'Request failed'
      let errorCode: string | undefined
      let errorPayload: unknown

      if (ct.includes('application/json')) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>))
        errorPayload = body
        const detail = body?.detail
        const detailObject = objectDetail(detail)
        if (typeof body?.code === 'string') {
          errorCode = body.code
        } else if (typeof detailObject?.code === 'string') {
          errorCode = detailObject.code
        }
        const candidates = [
          typeof body?.detail === 'string' ? body.detail : '',
          typeof detailObject?.message === 'string' ? detailObject.message : '',
          typeof body?.error === 'string' ? body.error : '',
          typeof body?.message === 'string' ? body.message : '',
        ].filter(Boolean)
        const joined = candidates.join(' | ').slice(0, 400)
        if (joined) details = joined
      } else {
        const text = (await res.text().catch(() => '')).slice(0, 400)
        if (text) details = text
      }

      const statusLine = `Backend responded ${res.status}`
      const idPart = rid ? ` [req ${rid}]` : ''
      if (res.status === 401) throw new ApiError(`${statusLine}: Unauthorized${idPart}`, res.status, errorCode, rid, errorPayload)
      throw new ApiError(`${statusLine}: ${details}${idPart}`, res.status, errorCode, rid, errorPayload)
    }

    const ct = res.headers.get('content-type') || ''
    if (!ct) return (undefined as unknown) as T
    if (ct.includes('application/json')) return (await res.json()) as T
    return (await res.text()) as T
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Timed out contacting backend at ${API_BASE} (${Math.round(timeoutMs / 1000)}s)`)
    }
    // If CORS or DNS blocked the request, fetch throws before we see a response
    if (err?.message?.includes('Failed to fetch')) {
      throw new Error(
        `Cannot reach backend at ${API_BASE}. Check NEXT_PUBLIC_API_BASE_URL on the frontend and CORS on the API.`
      )
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/** Convenience wrappers */
export const apiGet = <T = any>(path: string, opts: Omit<Opts, 'method' | 'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'GET' })

export const apiPost = <T = any>(path: string, body?: Opts['body'], opts: Omit<Opts, 'method' | 'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'POST', body })
