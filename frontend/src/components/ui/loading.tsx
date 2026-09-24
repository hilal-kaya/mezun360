import type { ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Loading({ label = 'Yükleniyor…' }: { label?: string }) {
  return <div role="status" className="flex items-center gap-2 text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-5 animate-spin" />{label}</div>
}

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-pastel-blue', className)} {...props} />
}
