import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ApiError } from '@/lib/api/client'
import type { components } from '@/lib/api/generated/schema'

export type Identity = components['schemas']['CurrentAccountResponse']
export const identityKey = ['auth', 'me'] as const
export const authApi = {
  async me(signal?: AbortSignal): Promise<Identity | null> {
    try { return await api.get<Identity>('/auth/me', { signal }) }
    catch (error) { if (error instanceof ApiError && error.status === 401) return null; throw error }
  },
  login: (email: string, password: string) => api.post<components['schemas']['LoginResponse']>('/auth/login', { email, password }),
  logout: () => api.post<void>('/auth/logout'),
}
export function useIdentity() {
  return useQuery({ queryKey: identityKey, queryFn: ({ signal }) => authApi.me(signal), retry: false,
    staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 60_000 })
}
export function homeFor(user: Identity) { return user.role === 'ADMIN' ? '/admin' : '/app' }
export function safeAuthError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'E-posta veya parola hatalı. Lütfen tekrar deneyin.'
    if (error.status === 429) return 'Çok fazla giriş denemesi yapıldı. Birkaç dakika sonra tekrar deneyin.'
    if (error.code === 'CSRF_INVALID') return 'Oturum güvenlik bilgisi yenilendi. Lütfen tekrar deneyin.'
  }
  return 'Şu anda işlem tamamlanamıyor. Lütfen tekrar deneyin.'
}
