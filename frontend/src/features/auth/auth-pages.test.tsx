import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/app'
import { AppProviders } from '@/app/providers'

function Location() { return <output aria-label="Konum">{useLocation().pathname}</output> }
function setup(role: 'ALUMNI' | 'ADMIN' = 'ALUMNI', initial = '/login', active = false) {
  let loggedIn = active
  const request = vi.fn(async (url: string | URL | Request, options?: RequestInit) => {
    const path = String(url)
    if (path.endsWith('/auth/csrf')) return new Response(JSON.stringify({ token: 'masked-csrf', headerName: 'X-CSRF-TOKEN' }))
    if (path.endsWith('/auth/me')) return loggedIn
      ? new Response(JSON.stringify({ userId: 'synthetic', email: 'demo@example.test', role, accountStatus: 'ACTIVE', mfaSatisfied: false, absoluteExpiresAt: '2026-09-24T12:00:00Z' }))
      : new Response('{}', { status: 401 })
    if (path.endsWith('/auth/login')) {
      expect(new Headers(options?.headers).get('X-CSRF-TOKEN')).toBe('masked-csrf')
      const body = JSON.parse(String(options?.body))
      if (body.password === 'incorrect') return new Response('{}', { status: 401 })
      loggedIn = true
      return new Response(JSON.stringify({ authenticated: true, mfaRequired: false }))
    }
    if (path.endsWith('/auth/logout')) { loggedIn = false; return new Response(null, { status: 204 }) }
    throw new Error('Unexpected API request')
  })
  vi.stubGlobal('fetch', request)
  render(<AppProviders><MemoryRouter initialEntries={[initial]}><App /><Location /></MemoryRouter></AppProviders>)
  return { user: userEvent.setup(), request }
}
async function fill(user: ReturnType<typeof userEvent.setup>, password = 'synthetic-password') {
  await user.type(await screen.findByLabelText('E-posta adresi'), 'demo@example.test')
  await user.type(screen.getByLabelText('Parola', { exact: true }), password)
  await user.click(screen.getByRole('button', { name: 'Giriş Yap' }))
}
afterEach(() => vi.unstubAllGlobals())
describe('session authentication UX', () => {
  it('renders accessible login, validates inputs and can show the password', async () => {
    const { user, request } = setup()
    await screen.findByRole('heading', { name: 'Tekrar hoş geldin' })
    await user.click(screen.getByRole('button', { name: 'Giriş Yap' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Geçerli bir e-posta')
    expect(request.mock.calls.some(([url]) => String(url).endsWith('/auth/login'))).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Parolayı göster' }))
    expect(screen.getByLabelText('Parola', { exact: true })).toHaveAttribute('type', 'text')
    expect(screen.getByRole('link', { name: 'Şifremi Unuttum' })).toHaveAttribute('href', '/forgot-password')
  })
  it.each([['ALUMNI', '/app', 'Mezun360 Mezun Alanı'], ['ADMIN', '/admin', 'Mezun360 Yönetim Alanı']] as const)('redirects authenticated %s using backend identity', async (role, path, heading) => {
    const { user } = setup(role)
    await fill(user)
    expect(await screen.findByRole('heading', { name: heading })).toBeVisible()
    expect(screen.getByLabelText('Konum')).toHaveTextContent(path)
  })
  it('shows a safe invalid-credentials message', async () => {
    const { user } = setup()
    await fill(user, 'incorrect')
    expect(await screen.findByRole('alert')).toHaveTextContent('E-posta veya parola hatalı')
    expect(screen.getByLabelText('Konum')).toHaveTextContent('/login')
  })
  it.each(['/app', '/admin'])('redirects anonymous %s to login', async (path) => {
    setup('ALUMNI', path)
    await screen.findByRole('heading', { name: 'Tekrar hoş geldin' })
    expect(screen.getByLabelText('Konum')).toHaveTextContent('/login')
  })
  it('never renders admin UI to an alumni user', async () => {
    setup('ALUMNI', '/admin', true)
    await screen.findByRole('heading', { name: 'Mezun360 Mezun Alanı' })
    expect(screen.queryByRole('heading', { name: 'Mezun360 Yönetim Alanı' })).not.toBeInTheDocument()
  })
  it('logs out through the server and removes private UI', async () => {
    const { user, request } = setup('ALUMNI', '/app', true)
    await user.click(await screen.findByRole('button', { name: 'Çıkış Yap' }))
    await screen.findByRole('heading', { name: 'Tekrar hoş geldin' })
    await waitFor(() => expect(screen.getByLabelText('Konum')).toHaveTextContent('/login'))
    expect(request.mock.calls.some(([url]) => String(url).endsWith('/auth/logout'))).toBe(true)
    expect(screen.queryByText('demo@example.test')).not.toBeInTheDocument()
  })
})
