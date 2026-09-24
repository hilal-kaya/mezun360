import { useState, type PropsWithChildren } from 'react'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/client'
import { identityKey, type Identity } from '@/features/auth/auth'

export function AppProviders({ children }: PropsWithChildren) {
  const [client] = useState(() => {
    let currentIdentity: string | null = null
    const cache = new QueryCache({
      onSuccess(data, query) {
        if (query.queryKey[0] !== 'auth') return
        const user = data as Identity | null
        const next = user ? `${user.userId}:${user.role}` : null
        if (next !== currentIdentity) {
          currentIdentity = next
          void instance.cancelQueries({ predicate: (item) => item.queryKey[0] !== 'auth' })
          instance.removeQueries({ predicate: (item) => item.queryKey[0] !== 'auth' })
        }
      },
      onError(error) {
        if (error instanceof ApiError && error.status === 401) {
          void instance.cancelQueries()
          instance.clear()
          instance.setQueryData(identityKey, null)
          currentIdentity = null
        }
      },
    })
    const instance = new QueryClient({ queryCache: cache,
      defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
    })
    return instance
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
