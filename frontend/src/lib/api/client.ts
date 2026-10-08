import type { components } from './generated/schema'

export type ApiProblem = components['schemas']['ApiProblem']

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly problem?: ApiProblem,
  ) {
    super(problem?.detail ?? 'API request failed.')
    this.name = 'ApiError'
  }
}

type RequestOptions = { signal?: AbortSignal; headers?: HeadersInit; onResponse?: (response: Response) => void }

function isProblem(value: unknown): value is ApiProblem {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return ['type', 'title', 'detail', 'instance', 'code', 'traceId'].every(
    (key) => typeof candidate[key] === 'string',
  ) && typeof candidate.status === 'number'
}

export function createApiClient(baseUrl: string, fetcher: typeof fetch = (...args) => globalThis.fetch(...args), csrfProtected = false) {
  const base = baseUrl.replace(/\/+$/, '')
  if (!base || !(base.startsWith('/') && !base.startsWith('//') || /^https?:\/\//.test(base))) {
    throw new Error('VITE_API_BASE_URL must be an absolute HTTP(S) URL or a same-origin path.')
  }

  async function request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    // Paths are application constants; never accept a full destination from user input.
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('..') || path.includes('\\')) {
      throw new Error('API path must be a relative path beginning with one slash.')
    }
    const headers = new Headers(options.headers)
    if (csrfProtected && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const csrf = await request<{ token: string }>('GET', '/auth/csrf', undefined, { signal: options.signal })
      headers.set('X-CSRF-TOKEN', csrf.token)
    }
    headers.set('Accept', 'application/json, application/problem+json')
    if (body !== undefined) headers.set('Content-Type', 'application/json')
    const timeout = AbortSignal.timeout(10_000)
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
    let response: Response
    try {
      response = await fetcher(`${base}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      })
    } catch (error) {
      if (signal.aborted) throw signal.reason
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new ApiError(0, 'NETWORK_ERROR')
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => undefined)
      const problem = isProblem(payload) ? payload : undefined
      throw new ApiError(response.status, problem?.code ?? 'HTTP_ERROR', problem)
    }
    options.onResponse?.(response)
    if (response.status === 204) return undefined as T
    const text = await response.text()
    if (!text) return undefined as T
    try {
      return JSON.parse(text) as T
    } catch {
      if (signal.aborted) throw signal.reason
      throw new ApiError(response.status, 'INVALID_RESPONSE')
    }
  }

  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, options),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, options),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, body, options),
    delete: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options),
  }
}
