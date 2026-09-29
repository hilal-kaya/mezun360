import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ApiError } from '@/lib/api/client'
import type { components } from '@/lib/api/generated/schema'
import { identityKey, useIdentity, type Identity } from '@/features/auth/auth'

type Schema = components['schemas']
export type Privacy = Schema['PrivacyResponse']
export type PrivacyWrite = Schema['PrivacyWrite']
export type Verification = Schema['VerificationSummary']
export type Review = Schema['AdminVerification']
export type Decision = Schema['VerificationDecision']
export type Queue = Schema['VerificationQueue']
export type Status = Verification['status']
export type Snapshot<T> = { data: T; etag: string }
const privacyPath = '/me/privacy-preferences'
const verificationPath = '/me/verification-requests'
const adminPath = '/admin/verification-requests'
export const verificationKey = (owner: string) => ['verification', owner] as const
const privacyKey = (owner: string) => ['privacy', owner] as const
async function snapshot<T>(path: string, method: 'get' | 'put' | 'post', body?: unknown, etag?: string, signal?: AbortSignal): Promise<Snapshot<T>> {
  let next = ''
  const options = { signal, headers: etag ? { 'If-Match': etag } : undefined, onResponse: (r: Response) => { next = r.headers.get('ETag') ?? '' } }
  const data = method === 'get' ? await api.get<T>(path, options) : await api[method]<T>(path, body, options)
  if (!next) throw new ApiError(200, 'INVALID_RESPONSE')
  return { data, etag: next }
}
function usePrivateMutation<TInput, TOutput>(key: readonly string[], execute: (input: TInput) => Promise<TOutput>, invalidate?: readonly string[]) {
  const cache = useQueryClient()
  const owner = useIdentity().data?.userId ?? ''
  return useMutation({ mutationFn: execute, onSuccess: async result => {
    if (cache.getQueryData<Identity>(identityKey)?.userId !== owner) return
    await cache.cancelQueries({ queryKey: key }); cache.setQueryData(key, result)
    if (invalidate) await cache.invalidateQueries({ queryKey: invalidate })
  }, onError: error => {
    if (error instanceof ApiError && error.status === 401) { void cache.cancelQueries(); cache.clear(); cache.setQueryData(identityKey, null) }
  } })
}
export function usePrivacy() {
  const owner = useIdentity().data?.userId ?? ''
  return useQuery({ queryKey: privacyKey(owner), queryFn: ({ signal }) => snapshot<Privacy>(privacyPath, 'get', undefined, undefined, signal), enabled: !!owner, retry: false })
}
export function useSavePrivacy() {
  const owner = useIdentity().data?.userId ?? ''
  return usePrivateMutation(privacyKey(owner), ({ body, etag }: { body: PrivacyWrite; etag: string }) => snapshot<Privacy>(privacyPath, 'put', body, etag))
}
export function useVerification() {
  const owner = useIdentity().data?.userId ?? ''
  return useQuery({ queryKey: verificationKey(owner), queryFn: ({ signal }) => snapshot<Verification>(verificationPath, 'get', undefined, undefined, signal), enabled: !!owner, retry: false })
}
export function useSubmitVerification() {
  const owner = useIdentity().data?.userId ?? ''
  return usePrivateMutation(verificationKey(owner), (etag: string) => snapshot<Verification>(verificationPath, 'post', { confirmAccuracy: true }, etag))
}
export function useVerificationQueue(status: Status, page: number) {
  const owner = useIdentity().data?.userId ?? ''
  return useQuery({ queryKey: ['verification-queue', owner, status, page], queryFn: ({ signal }) => api.get<Queue>(`${adminPath}?status=${status}&page=${page}&size=20`, { signal }), enabled: !!owner, retry: false })
}
export function useReview(id: string) {
  const owner = useIdentity().data?.userId ?? ''
  return useQuery({ queryKey: ['verification-review', owner, id], queryFn: ({ signal }) => snapshot<Review>(`${adminPath}/${id}`, 'get', undefined, undefined, signal), enabled: !!owner && !!id, retry: false })
}
export function useDecision(id: string) {
  const owner = useIdentity().data?.userId ?? ''
  return usePrivateMutation(['verification-review', owner, id], ({ body, etag }: { body: Decision; etag: string }) => snapshot<Review>(`${adminPath}/${id}/decisions`, 'post', body, etag), ['verification-queue', owner])
}
export function reviewError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 412 || error.code === 'EVIDENCE_CHANGED') return 'Bilgiler değişti. Güncel kaydı yükleyip yeniden incele.'
    if (error.code === 'EDUCATION_REQUIRED') return 'Bölümünü, mezuniyet yılını ve tamamladığın eğitim kaydını profilinde doldur.'
    if (error.code === 'PROFILE_REQUIRED') return 'Önce mezun profilini oluştur.'
    if (error.code === 'INVALID_TRANSITION') return 'Bu kayıt için işlem artık geçerli değil. Güncel durumu yükle.'
    if (error.code === 'ACCOUNT_INELIGIBLE') return 'Bu hesap şu anda doğrulama için uygun değil.'
    if (error.status === 400) return 'Alanları kontrol et. Ret açıklaması 10–500 karakter düz metin olmalı.'
  }
  return 'İşlem tamamlanamadı. Bağlantını kontrol edip tekrar dene.'
}
