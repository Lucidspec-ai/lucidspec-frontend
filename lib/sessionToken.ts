'use client'

import { supabase } from './supabase'
import { safeGetSession } from './safeSession'

type Options = {
  timeoutMs?: number
}

/**
 * Resolve to the current Supabase access token if one is available.
 * Falls back to waiting briefly for the auth state change callback so we
 * don't mistakenly treat a warm session as logged out before Supabase boots.
 */
export async function getSessionToken(opts: Options = {}): Promise<string | null> {
  const { timeoutMs = 2000 } = opts

  const { data, error } = await safeGetSession({ timeoutMs, preferCache: true })
  if (error) {
    console.warn('safeGetSession() error while retrieving token', error)
  }
  const initialToken = data.session?.access_token ?? null
  if (initialToken) return initialToken

  return await new Promise<string | null>((resolve) => {
    let settled = false
    let timeout: ReturnType<typeof setTimeout> | null = null
    let subscription: { unsubscribe: () => void } | null = null

    const finish = (token: string | null) => {
      if (settled) return
      settled = true
      if (timeout) clearTimeout(timeout)
      subscription?.unsubscribe()
      resolve(token)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const token = session?.access_token ?? null
      if (token) {
        finish(token)
        return
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        finish(null)
      }
    })

    subscription = listener?.subscription ?? null

    timeout = setTimeout(() => finish(null), timeoutMs)
  })
}
