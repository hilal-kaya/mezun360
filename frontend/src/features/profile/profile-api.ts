import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ApiError } from '@/lib/api/client'
import type { components } from '@/lib/api/generated/schema'
import { identityKey, useIdentity, type Identity } from '@/features/auth/auth'

export type ProfileData = components['schemas']['ProfileWrite']
export type Career = components['schemas']['CareerInput']
export type Education = components['schemas']['EducationInput']
export type Certification = components['schemas']['CertificationInput']
export type Profile = components['schemas']['ProfileResponse']
export type ProfileSnapshot = { profile: Profile; etag: string }
export const emptyProfile = (): ProfileData => ({ firstName: '', lastName: '', career: [], education: [], skills: [], certifications: [], contribution: {} })
export const profileKey = (userId: string) => ['profile', userId] as const

async function read(signal?: AbortSignal): Promise<ProfileSnapshot> {
  let etag = ''
  const profile = await api.get<Profile>('/me/profile', { signal, onResponse: r => { etag = r.headers.get('ETag') ?? '' } })
  if (!etag) throw new ApiError(200, 'INVALID_RESPONSE')
  return { profile, etag }
}
export function useProfile() {
  const identity = useIdentity()
  const owner = identity.data?.userId ?? ''
  return useQuery({ queryKey: profileKey(owner), queryFn: ({ signal }) => read(signal), enabled: !!owner, retry: false })
}
export function useSaveProfile() {
  const cache = useQueryClient()
  const identity = useIdentity()
  const owner = identity.data?.userId ?? ''
  return useMutation({
    mutationFn: async ({ data, etag }: { data: ProfileData; etag: string }): Promise<ProfileSnapshot> => {
      let nextEtag = ''
      const profile = await api.put<Profile>('/me/profile', data, { headers: { 'If-Match': etag }, onResponse: r => { nextEtag = r.headers.get('ETag') ?? '' } })
      if (!nextEtag) throw new ApiError(200, 'INVALID_RESPONSE')
      return { profile, etag: nextEtag }
    },
    onSuccess: async result => {
      if (cache.getQueryData<Identity>(identityKey)?.userId !== owner) return
      await cache.cancelQueries({ queryKey: profileKey(owner) })
      cache.setQueryData(profileKey(owner), result)
      await cache.invalidateQueries({ queryKey: ['verification', owner] })
      await cache.invalidateQueries({ queryKey: ['privacy', owner] })
    },
    onError: error => {
      if (error instanceof ApiError && error.status === 401) {
        void cache.cancelQueries(); cache.clear(); cache.setQueryData(identityKey, null)
      }
    },
  })
}
