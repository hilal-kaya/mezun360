import { useEffect } from 'react'
import type { Status } from './queries'
import { statusLabels } from './display'

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-primary ${status === 'VERIFIED' ? 'bg-pastel-mint' : status === 'REJECTED' ? 'bg-pastel-peach' : 'bg-pastel-blue'}`}>{statusLabels[status]}</span>
}
export function Toast({ message, clear }: { message: string; clear: () => void }) {
  useEffect(() => { const timer = setTimeout(clear, 4000); return () => clearTimeout(timer) }, [clear])
  return <div role="status" className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-md rounded-xl border bg-pastel-mint p-4 text-sm text-primary shadow-lg">{message}</div>
}

