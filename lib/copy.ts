'use client'

import { toast } from './toast'

type CopyOpts = {
  successMessage?: string
  errorMessage?: string
  silent?: boolean // if true, do not show toasts
}

export async function copyToClipboard(text: string, opts: CopyOpts = {}) {
  const { successMessage = 'Copied to clipboard', errorMessage = 'Copy failed — select text manually', silent = false } = opts
  try {
    await navigator.clipboard.writeText(text)
    if (!silent) toast.success(successMessage)
    return true
  } catch {
    if (!silent) toast.info(errorMessage)
    return false
  }
}
