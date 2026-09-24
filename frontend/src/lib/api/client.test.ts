import { describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './client'

describe('API transport', () => {
  it('uses the configured base, cookies and JSON response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ status: 'UP', service: 'mezun360-api' }))
    const client = createApiClient('/api/v1/', fetcher)
    expect(await client.get('/health')).toEqual({ status: 'UP', service: 'mezun360-api' })
    expect(fetcher).toHaveBeenCalledWith('/api/v1/health', expect.objectContaining({ method: 'GET', credentials: 'include' }))
  })

  it.each(['post', 'put', 'patch'] as const)('serializes %s and preserves request headers', async (method) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: 'synthetic' }))
    await createApiClient('/api/v1', fetcher)[method]('/test', { name: 'test' }, { headers: { 'If-Match': '1' } })
    const options = fetcher.mock.calls[0]?.[1]
    expect(options?.method).toBe(method.toUpperCase())
    expect(options?.body).toBe('{"name":"test"}')
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json')
    expect(new Headers(options?.headers).get('If-Match')).toBe('1')
  })

  it('handles an empty DELETE response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }))
    expect(await createApiClient('/api/v1', fetcher).delete('/test')).toBeUndefined()
    expect(fetcher).toHaveBeenCalledWith('/api/v1/test', expect.objectContaining({ method: 'DELETE' }))
  })

  it('retains structured problem details and a trace ID', async () => {
    const problem = { type: 'urn:mezun360:problem:validation-failed', title: 'Bad Request', status: 400, detail: 'Invalid fields.', instance: '/api/v1/test', code: 'VALIDATION_FAILED', traceId: 'synthetic-trace' }
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(problem, { status: 400 }))
    await expect(createApiClient('/api/v1', fetcher).post('/test', {})).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED', problem })
  })

  it('does not display an HTML proxy error body', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('<h1>Internal proxy details</h1>', { status: 502 }))
    await expect(createApiClient('/api/v1', fetcher).get('/health')).rejects.toEqual(new ApiError(502, 'HTTP_ERROR'))
  })

  it('separates network failures from HTTP errors', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Network failure'))
    await expect(createApiClient('/api/v1', fetcher).get('/health')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })

  it('preserves caller cancellation', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(controller.signal.reason)
    await expect(createApiClient('/api/v1', fetcher).get('/health', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('rejects a non-JSON success response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('not JSON'))
    await expect(createApiClient('/api/v1', fetcher).get('/health')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('rejects an absolute request path before sending cookies', async () => {
    const fetcher = vi.fn<typeof fetch>()
    await expect(createApiClient('/api/v1', fetcher).get('//untrusted.example/path')).rejects.toThrow('API path')
    expect(fetcher).not.toHaveBeenCalled()
  })
})
