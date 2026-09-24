import type { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const variants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-primary bg-card text-primary hover:bg-pastel-blue',
        ghost: 'text-primary hover:bg-pastel-blue',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type Props = ComponentProps<'button'> & VariantProps<typeof variants> & { asChild?: boolean }

export function Button({ className, variant, asChild = false, type = 'button', ...props }: Props) {
  const Component = asChild ? Slot : 'button'
  return <Component {...(!asChild && { type })} className={cn(variants({ variant }), className)} {...props} />
}
