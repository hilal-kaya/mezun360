import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/app'
import { AppProviders } from '@/app/providers'

function Location() {
  return <output aria-label="Konum">{useLocation().pathname}</output>
}
function mount({
  role,
  path = '/',
  unavailable = false,
}: { role?: 'ALUMNI' | 'ADMIN'; path?: string; unavailable?: boolean } = {}) {
  const fetcher = vi.fn(async () => {
    if (unavailable) throw new TypeError('offline')
    return role
      ? new Response(
          JSON.stringify({
            userId: 'synthetic',
            email: 'owner@example.test',
            role,
            accountStatus: 'ACTIVE',
            mfaSatisfied: false,
            absoluteExpiresAt: '2026-09-24T18:00:00Z',
          }),
        )
      : new Response('{}', { status: 401 })
  })
  vi.stubGlobal('fetch', fetcher)
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <Location />
      </MemoryRouter>
    </AppProviders>,
  )
  return userEvent.setup()
}
afterEach(() => vi.unstubAllGlobals())
describe('public entry experience', () => {
  it('renders all public sections without exposing identities or live metrics', async () => {
    mount()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'BTÜ ile bağınmezuniyetle bitmez.',
    )
    for (const name of [
      'Birlikte daha ileri.',
      'Mezun360 nasıl çalışır?',
      /Bir mezun veri tabanından/,
      /Verilerin senin/,
      'BTÜ topluluğuyla bağını sürdür.',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeVisible()
    }
    expect(
      screen.getAllByText('Tasarım önizlemesi · Temsili içerik'),
    ).toHaveLength(2)
    expect(screen.queryByText('owner@example.test')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Gizlilik' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Kullanım Koşulları' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'İletişim' }),
    ).not.toBeInTheDocument()
  })
  it('keeps public content usable when the identity service is unavailable', () => {
    mount({ unavailable: true })
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
    expect(screen.getByLabelText('Konum')).toHaveTextContent('/')
  })
  it('takes the main CTA to the real login page', async () => {
    const user = mount()
    const hero = screen.getByRole('region', { name: /BTÜ ile bağın/ })
    await user.click(within(hero).getByRole('link', { name: 'Giriş Yap' }))
    expect(
      await screen.findByRole('heading', { name: 'Tekrar hoş geldin' }),
    ).toBeVisible()
    expect(screen.getByLabelText('Konum')).toHaveTextContent('/login')
  })
  it('links exploration to real page sections and join to existing login', () => {
    mount()
    for (const link of screen.getAllByRole('link', {
      name: 'Platformu Keşfet',
    }))
      expect(link).toHaveAttribute('href', '#platform')
    expect(document.getElementById('platform')).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', {
      name: 'Mezun Ağına Katıl',
    }))
      expect(link).toHaveAttribute('href', '/login')
  })
  it('opens the mobile disclosure, closes on navigation and restores focus on Escape', async () => {
    const user = mount()
    const toggle = screen.getByRole('button', { name: 'Menüyü aç' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('navigation', { name: 'Mobil gezinme' }),
    ).not.toBeInTheDocument()
    await user.click(toggle)
    const mobile = screen.getByRole('navigation', { name: 'Mobil gezinme' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(within(mobile).getByRole('link', { name: 'Mentörlük' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    within(screen.getByRole('navigation', { name: 'Mobil gezinme' }))
      .getByRole('link', { name: 'Platform' })
      .focus()
    await user.keyboard('{Escape}')
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
  it.each([
    ['ALUMNI', '/app'],
    ['ADMIN', '/admin'],
  ] as const)(
    'offers %s an account link while keeping landing public',
    async (role, destination) => {
      const user = mount({ role })
      const account = await screen.findByRole('link', { name: 'Alanıma dön' })
      expect(account).toHaveAttribute('href', destination)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'BTÜ ile bağın',
      )
      expect(screen.getByLabelText('Konum')).toHaveTextContent('/')
      await user.click(account)
      expect(
        await screen.findByRole('heading', {
          name:
            role === 'ADMIN'
              ? 'Mezun360 Yönetim Alanı'
              : 'Mezun360 Mezun Alanı',
        }),
      ).toBeVisible()
      expect(screen.getByLabelText('Konum')).toHaveTextContent(destination)
    },
  )
  it.each([
    ['ALUMNI', '/app'],
    ['ADMIN', '/admin'],
  ] as const)(
    'redirects an existing %s session from login without a loop',
    async (role, destination) => {
      mount({ role, path: '/login' })
      expect(
        await screen.findByRole('heading', {
          name:
            role === 'ADMIN'
              ? 'Mezun360 Yönetim Alanı'
              : 'Mezun360 Mezun Alanı',
        }),
      ).toBeVisible()
      expect(screen.getByLabelText('Konum')).toHaveTextContent(destination)
    },
  )
})
