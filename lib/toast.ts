'use client'

type ToastKind = 'success' | 'error' | 'info'

export type ToastMessage = {
  id?: string
  kind?: ToastKind
  title?: string
  message: string
  durationMs?: number
}

type Listener = (t: ToastMessage) => void

const listeners = new Set<Listener>()

export function onToast(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

function emit(t: ToastMessage) {
  for (const l of Array.from(listeners)) l(t)
}

export const toast = Object.assign(
  (message: string, opts: Omit<ToastMessage, 'message'> = {}) => emit({ message, ...opts }),
  {
    success: (message: string, opts: Omit<ToastMessage, 'message' | 'kind'> = {}) => emit({ message, kind: 'success', ...opts }),
    error: (message: string, opts: Omit<ToastMessage, 'message' | 'kind'> = {}) => emit({ message, kind: 'error', ...opts }),
    info: (message: string, opts: Omit<ToastMessage, 'message' | 'kind'> = {}) => emit({ message, kind: 'info', ...opts }),
  }
)
