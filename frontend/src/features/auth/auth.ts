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
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => 
    api.post<components['schemas']['LoginResponse']>('/auth/register', data),
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
    if (error.status === 429) return 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.'
    if (error.code === 'CSRF_INVALID') return 'Oturum güvenlik bilgisi yenilendi. Lütfen tekrar deneyin.'
    if (error.status === 0) return 'Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.'
    if (error.message) return `İşlem Başarısız: ${error.message}`
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Şu anda işlem tamamlanamıyor. Lütfen tekrar deneyin.'
}
