'use client'

import { useEffect, useMemo, useState } from 'react'
import { onToast, ToastMessage } from '@/lib/toast'

type LiveToast = ToastMessage & { id: string, createdAt: number }

export function Toaster() {
  const [toasts, setToasts] = useState<LiveToast[]>([])

  useEffect(() => {
    return onToast((t) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const toast: LiveToast = { id, createdAt: Date.now(), durationMs: 2000, ...t }
      setToasts((prev) => [...prev, toast])
      const ttl = toast.durationMs ?? 2000
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, ttl)
    })
  }, [])

  const items = useMemo(() => toasts.slice(-4), [toasts])

  return (
    <div className="pointer-events-none fixed top-3 right-3 z-[1000] space-y-2">
      {items.map((t) => {
        const color = t.kind === 'success' ? 'bg-green-600 border-green-700' : t.kind === 'error' ? 'bg-red-600 border-red-700' : 'bg-gray-800 border-gray-700'
        return (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-sm rounded border text-white shadow-md ${color}`}
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          >
            <div className="px-3 py-2">
              {t.title && <div className="text-xs opacity-90">{t.title}</div>}
              <div className="text-sm">{t.message}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

