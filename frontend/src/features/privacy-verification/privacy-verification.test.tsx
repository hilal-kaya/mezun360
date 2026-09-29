import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/app'
import { AppProviders } from '@/app/providers'
import { emptyProfile } from '@/features/profile/profile-api'
import type { Status } from './queries'

function setup(options: { route?: string; role?: 'ALUMNI' | 'ADMIN'; status?: Status; loading?: boolean; submitted?: boolean; privacyFailure?: number } = {}) {
  let privacy = { profileExists: true, directoryOptIn: false, profileVisibility: 'PRIVATE' }
  let verification = { status: options.status ?? 'PENDING', submitted: options.submitted ?? true, submittedAt: '2026-09-25T08:00:00Z', reviewedAt: null as string | null, rejectionReason: options.status === 'REJECTED' ? 'Mezuniyet yılını tekrar kontrol edin.' : null as string | null }
  let privacyVersion = 0
  let reviewVersion = 0
  const json = (data: unknown, etag?: string, status = 200) => new Response(JSON.stringify(data), { status, headers: etag ? { ETag: etag } : undefined })
  const evidence = { firstName: 'Deniz', lastName: 'Örnek', department: 'Bilgisayar', graduationYear: 2022, education: [{ institution: 'Örnek Üniversite', department: 'Bilgisayar', degree: 'Lisans', startYear: 2018, graduationYear: 2022 }] }
  const request = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url)
    if (path.endsWith('/auth/me')) return json({ userId: 'owner-1', role: options.role ?? 'ALUMNI', email: 'test@example.test', accountStatus: 'ACTIVE' })
    if (path.endsWith('/auth/csrf')) return json({ token: 'csrf-test' })
    if (path.endsWith('/me/profile')) return json({ exists: true, data: { ...emptyProfile(), ...evidence }, completionPercentage: 40 }, '"profile-1"')
    if (path.endsWith('/me/privacy-preferences')) {
      if (options.loading) return new Promise<Response>(() => {})
      if (init?.method === 'PUT') {
        expect(new Headers(init.headers).get('If-Match')).toBe(`"privacy-${privacyVersion}"`)
        expect(new Headers(init.headers).get('X-CSRF-TOKEN')).toBe('csrf-test')
        if (options.privacyFailure) return json({ type: 'urn:problem', title: 'Conflict', detail: 'Conflict', status: options.privacyFailure, instance: path, code: 'VERSION_CONFLICT', traceId: 'test' }, undefined, options.privacyFailure)
        privacy = { ...privacy, ...JSON.parse(String(init.body)) }; privacyVersion++
      }
      return json(privacy, `"privacy-${privacyVersion}"`)
    }
    if (path.endsWith('/me/verification-requests')) {
      if (init?.method === 'POST') {
        expect(JSON.parse(String(init.body))).toEqual({ confirmAccuracy: true })
        verification = { ...verification, status: 'PENDING', submitted: true, rejectionReason: null }
      }
      return json(verification, '"verification-1"', init?.method === 'POST' ? 201 : 200)
    }
    if (path.includes('/admin/verification-requests?')) {
      const status = new URL(path, 'http://localhost').searchParams.get('status')
      return json({ items: verification.status === status ? [{ id: 'request-1', ...evidence, status: verification.status, submittedAt: verification.submittedAt }] : [], page: 0, size: 20, totalElements: verification.status === status ? 1 : 0 })
    }
    if (path.endsWith('/admin/verification-requests/request-1/decisions')) {
      expect(new Headers(init?.headers).get('If-Match')).toBe(`"review-${reviewVersion}"`)
      expect(new Headers(init?.headers).get('X-CSRF-TOKEN')).toBe('csrf-test')
      verification = { ...verification, ...JSON.parse(String(init?.body)), reviewedAt: '2026-09-25T09:00:00Z' }; reviewVersion++
      return json({ id: 'request-1', evidence, ...verification, current: true }, `"review-${reviewVersion}"`)
    }
    if (path.endsWith('/admin/verification-requests/request-1')) return json({ id: 'request-1', evidence, ...verification, current: true }, `"review-${reviewVersion}"`)
    throw new Error(`Unexpected request ${path}`)
  })
  vi.stubGlobal('fetch', request)
  const mount = (route = options.route ?? '/app/settings') => render(<AppProviders><MemoryRouter initialEntries={[route]}><App /></MemoryRouter></AppProviders>)
  const view = mount()
  return { user: userEvent.setup(), request, view, mount, saved: () => privacy }
}
afterEach(() => vi.unstubAllGlobals())
describe('privacy and verification', () => {
  it('shows loading without inventing enabled preferences', async () => {
    setup({ loading: true })
    expect(await screen.findByText('Gizlilik tercihlerin yükleniyor…')).toBeVisible()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
  it('defaults to opt-out/private, saves with CSRF/ETag, updates cache and reloads persisted settings', async () => {
    const { user, saved, view, mount } = setup()
    const toggle = await screen.findByRole('switch', { name: "Mezunlar Ağı'nda görünmek istiyorum." })
    expect(toggle).not.toBeChecked(); expect(screen.getByRole('radio', { name: 'Yalnızca Ben' })).toBeChecked()
    await user.click(toggle); await user.click(screen.getByRole('radio', { name: 'BTÜ Mezunları' })); await user.click(screen.getByRole('button', { name: 'Tercihleri Kaydet' }))
    expect(await screen.findByText('Gizlilik tercihlerin güncellendi.')).toBeVisible()
    expect(saved()).toMatchObject({ directoryOptIn: true, profileVisibility: 'ALUMNI_MEMBERS' })
    // A second edit must use the fresh cache version, not the initial ETag.
    await user.click(screen.getByRole('radio', { name: 'Yalnızca Ben' })); await user.click(screen.getByRole('button', { name: 'Tercihleri Kaydet' }))
    await waitFor(() => expect(saved().profileVisibility).toBe('PRIVATE'))
    view.unmount(); mount()
    expect(await screen.findByRole('switch')).toBeChecked(); expect(screen.getByRole('radio', { name: 'Yalnızca Ben' })).toBeChecked()
    expect(screen.getByText(/Mezunlar Ağı henüz kullanıma açılmadı/)).toBeVisible()
  })
  it('preserves unsaved preferences after a stale write and offers refresh', async () => {
    const { user } = setup({ privacyFailure: 412 })
    await user.click(await screen.findByRole('switch')); await user.click(screen.getByRole('button', { name: 'Tercihleri Kaydet' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Bilgiler değişti')
    expect(screen.getByRole('switch')).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Güncel tercihleri yükle' }))
    await waitFor(() => expect(screen.getByRole('switch')).not.toBeChecked())
  })
  it.each([['PENDING', 'Doğrulama Bekliyor'], ['VERIFIED', 'Doğrulanmış Mezun'], ['REJECTED', 'Doğrulama Tamamlanamadı']] as const)('shows the real %s verification state', async (status, label) => {
    setup({ route: '/app/profile', status })
    expect(await screen.findByText(label)).toBeVisible()
    if (status === 'REJECTED') expect(screen.getByText('Mezuniyet yılını tekrar kontrol edin.')).toBeVisible()
    if (status === 'PENDING') expect(screen.getByText('Mezuniyet bilgilerin Kariyer Merkezi tarafından inceleniyor.')).toBeVisible()
    if (status === 'VERIFIED') expect(screen.queryByRole('button', { name: 'İncelemeye gönder' })).not.toBeInTheDocument()
  })
  it('distinguishes unsubmitted onboarding and confirms disclosure before submitting', async () => {
    const { user } = setup({ route: '/app/profile', submitted: false })
    expect(await screen.findByText(/Profil oluşturmak mezuniyet doğrulaması değildir/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'İncelemeye gönder' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/yetkili Kariyer Merkezi personelinin/)).toBeVisible()
    await user.click(within(dialog).getByRole('button', { name: 'Bilgilerim doğru, gönder' }))
    expect(await screen.findByText('Mezuniyet bilgilerin Kariyer Merkezi tarafından inceleniyor.')).toBeVisible()
  })
  it('lists pending requests, inspects evidence and confirms verification once', async () => {
    const { user, request } = setup({ route: '/admin/verifications', role: 'ADMIN' })
    await user.click(await screen.findByRole('button', { name: 'İncele: Deniz Örnek' }))
    await user.click(await screen.findByRole('button', { name: 'Doğrula' }))
    expect(screen.getByText('Mezuniyeti doğrulamayı onaylıyor musun?')).toBeVisible()
    expect(request.mock.calls.filter(([url]) => String(url).endsWith('/decisions'))).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Evet, doğrula' }))
    expect(await screen.findByText('Doğrulama kararı kaydedildi.')).toBeVisible()
    expect(await screen.findByText('Bu durumda başvuru bulunmuyor.')).toBeVisible()
    await user.selectOptions(screen.getByLabelText('Başvuru durumu'), 'VERIFIED')
    await user.click(await screen.findByRole('button', { name: 'İncele: Deniz Örnek' }))
    expect(await screen.findByText('Bu başvuru sonuçlandırılmıştır.')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Doğrula' })).not.toBeInTheDocument()
    expect(request.mock.calls.filter(([url]) => String(url).endsWith('/decisions'))).toHaveLength(1)
  })
  it('requires a rejection reason and confirms the user-facing decision', async () => {
    const { user, request } = setup({ route: '/admin/verifications', role: 'ADMIN' })
    await user.click(await screen.findByRole('button', { name: 'İncele: Deniz Örnek' })); await user.click(await screen.findByRole('button', { name: 'Reddet' }))
    await user.click(screen.getByRole('button', { name: 'Evet, reddet' }))
    expect(request.mock.calls.filter(([url]) => String(url).endsWith('/decisions'))).toHaveLength(0)
    await user.type(screen.getByRole('textbox', { name: /Mezuna gösterilecek açıklama/ }), 'Bölüm bilgisini yeniden kontrol edin.')
    await user.click(screen.getByRole('button', { name: 'Evet, reddet' }))
    expect(await screen.findByText('Doğrulama kararı kaydedildi.')).toBeVisible()
    const decision = request.mock.calls.find(([url]) => String(url).endsWith('/decisions'))
    expect(JSON.parse(String(decision?.[1]?.body))).toEqual({ status: 'REJECTED', rejectionReason: 'Bölüm bilgisini yeniden kontrol edin.' })
  })
  it('redirects alumni away from admin without requesting private review data', async () => {
    const { request } = setup({ route: '/admin/verifications' })
    expect(await screen.findByRole('heading', { name: 'Mezun360 Mezun Alanı' })).toBeVisible()
    expect(request.mock.calls.some(([url]) => String(url).includes('/admin/'))).toBe(false)
  })
})
