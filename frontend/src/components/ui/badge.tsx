import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('inline-flex items-center rounded-full bg-pastel-blue px-3 py-1 text-sm font-medium text-primary', className)} {...props} />
}
