import { api } from '@/lib/api'
import type { components } from '@/lib/api/generated/schema'

export type HealthResponse = components['schemas']['HealthResponse']

export function getHealth(signal?: AbortSignal) {
  return api.get<HealthResponse>('/health', { signal })
}
