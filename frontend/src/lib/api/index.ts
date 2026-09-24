import { createApiClient } from './client'

export const api = createApiClient(import.meta.env.VITE_API_BASE_URL || '/api/v1', undefined, true)
