import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/app'
import { AppProviders } from '@/app/providers'
import { emptyProfile, type ProfileData } from './profile-api'

const complete = (): ProfileData => ({ ...emptyProfile(), firstName: 'Deniz', lastName: 'Örnek', city: 'Bursa', department: 'Bilgisayar Mühendisliği', graduationYear: 2022, about: 'Yazılım geliştiriyorum.', currentPosition: 'Geliştirici', currentCompany: 'Örnek Yazılım', skills: ['Java'], career: [{ id: 'career-1', company: 'Örnek Yazılım', position: 'Geliştirici', startDate: '2022-01-01', currentlyWorking: true }], education: [{ id: 'education-1', institution: 'Örnek Üniversite', degree: 'Lisans', department: 'Bilgisayar', startYear: 2018, graduationYear: 2022 }] })
function setup(options: { data?: ProfileData; loading?: boolean; failure?: boolean; saveFailure?: number } = {}) {
  let data = options.data
  let version = 0
  const request = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url)
    if (path.endsWith('/auth/me')) return new Response(JSON.stringify({ userId: 'owner-1', role: 'ALUMNI', email: 'alumni@example.test', accountStatus: 'ACTIVE' }))
    if (path.endsWith('/auth/csrf')) return new Response(JSON.stringify({ token: 'csrf-test' }))
    if (path.endsWith('/me/profile')) {
      if (options.loading) return new Promise<Response>(() => {})
      if (options.failure) return new Response('{}', { status: 503 })
      if (init?.method === 'PUT') {
        expect(new Headers(init.headers).get('If-Match')).toBe(`"v${version}"`)
        expect(new Headers(init.headers).get('X-CSRF-TOKEN')).toBe('csrf-test')
        if (options.saveFailure) return new Response(JSON.stringify({ type: 'urn:problem', title: 'Failed', status: options.saveFailure, detail: 'Invalid', instance: '/api/v1/me/profile', code: 'VALIDATION_FAILED', traceId: 'test', errors: options.saveFailure === 400 ? [{ field: 'firstName', code: 'INVALID_VALUE', message: 'Invalid' }] : [] }), { status: options.saveFailure })
        data = JSON.parse(String(init.body)); version++
        data?.career.forEach((c, i) => { c.id ??= `career-${i + 1}` })
        data?.certifications.forEach((c, i) => { c.id ??= `cert-${i + 1}` })
      }
      return new Response(JSON.stringify({ exists: !!data, data: data ?? null, completionPercentage: data ? 80 : 0 }), { headers: { ETag: `"v${version}"` } })
    }
    throw new Error('Unexpected request')
  })
  vi.stubGlobal('fetch', request)
  render(<AppProviders><MemoryRouter initialEntries={['/app/profile']}><App /></MemoryRouter></AppProviders>)
  return { user: userEvent.setup(), request, saved: () => data }
}
afterEach(() => vi.unstubAllGlobals())
async function openEditor(user: ReturnType<typeof userEvent.setup>, name = 'Profili Düzenle') {
  await user.click(await screen.findByRole('button', { name }))
  return screen.findByRole('dialog')
}
async function save(user: ReturnType<typeof userEvent.setup>) { await user.click(screen.getByRole('button', { name: 'Değişiklikleri Kaydet' })) }
describe('owner profile', () => {
  it('shows a loading skeleton and never invents profile data', async () => {
    setup({ loading: true })
    expect(await screen.findByRole('status', { name: 'Profil yükleniyor' })).toBeVisible()
    expect(screen.queryByText('Deniz Örnek')).not.toBeInTheDocument()
  })
  it('models onboarding, validates names and creates a persisted profile through CSRF/version transport', async () => {
    const { user, saved } = setup()
    expect(await screen.findByRole('heading', { name: 'Profilini tamamla' })).toBeVisible()
    await openEditor(user); await save(user)
    expect(screen.getAllByText('Bu alanı doldurun.')).toHaveLength(2)
    await user.type(screen.getByLabelText('Ad *'), 'Deniz')
    await user.type(screen.getByLabelText('Soyad *'), 'Örnek')
    await save(user)
    expect(await screen.findByText('Profilin başarıyla güncellendi.')).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Deniz Örnek' })).toBeVisible()
    expect(saved()?.firstName).toBe('Deniz')
  })
  it('renders server data and completion and updates the cache on edit', async () => {
    const { user, saved } = setup({ data: complete() })
    expect(await screen.findByRole('heading', { name: 'Deniz Örnek' })).toBeVisible()
    expect(screen.getByRole('progressbar', { name: 'Profil tamamlanma' })).toHaveAttribute('value', '80')
    await openEditor(user)
    await user.clear(screen.getByLabelText('Şehir')); await user.type(screen.getByLabelText('Şehir'), 'Ankara')
    await save(user)
    expect(await screen.findByText('Ankara')).toBeVisible(); expect(saved()?.city).toBe('Ankara')
  })
  it('supports keyboard skill chips, rejects duplicates and removes a chip', async () => {
    const { user, saved } = setup({ data: complete() })
    const dialog = await openEditor(user, 'Yetenekleri düzenle')
    await user.type(within(dialog).getByLabelText('Yetenek ekle'), 'java{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('zaten eklendi')
    await user.clear(within(dialog).getByLabelText('Yetenek ekle'))
    await user.type(within(dialog).getByLabelText('Yetenek ekle'), 'React{Enter}')
    await user.click(within(dialog).getByRole('button', { name: 'Java yeteneğini kaldır' }))
    await save(user)
    expect(await screen.findByText('Profilin başarıyla güncellendi.')).toBeVisible()
    expect(saved()?.skills).toEqual(['React'])
  })
  it('adds, edits and removes career records without page reload', async () => {
    const data = complete(); data.career = []
    const { user, saved } = setup({ data })
    await openEditor(user, 'Deneyim Ekle')
    await user.type(screen.getByLabelText('Şirket *'), 'Sentetik Şirket')
    await user.type(screen.getByLabelText('Pozisyon *'), 'Mühendis')
    await user.type(screen.getByLabelText('Başlangıç tarihi *'), '2023-01-01')
    await save(user)
    await user.click(await screen.findByRole('button', { name: 'Mühendis deneyimini düzenle' }))
    await user.clear(screen.getByLabelText('Pozisyon *')); await user.type(screen.getByLabelText('Pozisyon *'), 'Kıdemli Mühendis')
    await save(user)
    await user.click(await screen.findByRole('button', { name: 'Kıdemli Mühendis deneyimini düzenle' }))
    await user.click(screen.getByRole('button', { name: 'Kaydı sil' }))
    await user.click(screen.getByRole('button', { name: 'Kaydı kaldır' }))
    await waitFor(() => expect(saved()?.career).toEqual([]))
    expect(await screen.findByText('İlk iş veya staj deneyimini ekleyerek yolculuğunu başlat.')).toBeVisible()
  })
  it('adds, edits and removes a structured certification', async () => {
    const { user, saved } = setup({ data: complete() })
    await openEditor(user, 'Sertifika Ekle')
    await user.type(screen.getByLabelText('Sertifika adı *'), 'Örnek Belge')
    await user.type(screen.getByLabelText('Veren kurum *'), 'Örnek Kurum')
    await save(user)
    await user.click(await screen.findByRole('button', { name: 'Örnek Belge sertifikasını düzenle' }))
    await user.clear(screen.getByLabelText('Sertifika adı *')); await user.type(screen.getByLabelText('Sertifika adı *'), 'Yeni Belge')
    await save(user)
    await user.click(await screen.findByRole('button', { name: 'Yeni Belge sertifikasını düzenle' }))
    await user.click(screen.getByRole('button', { name: 'Kaydı sil' })); await user.click(screen.getByRole('button', { name: 'Kaydı kaldır' }))
    await waitFor(() => expect(saved()?.certifications).toEqual([]))
  })
  it('shows field-local server validation without losing draft', async () => {
    const { user } = setup({ data: complete(), saveFailure: 400 })
    await openEditor(user); await save(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('İşaretli alanları')
    expect(screen.getByLabelText('Ad *')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Ad *')).toHaveValue('Deniz')
  })
  it('keeps stale edits visible and asks for explicit reload instead of overwriting', async () => {
    const { user } = setup({ data: complete(), saveFailure: 412 })
    await openEditor(user); await save(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('başka bir sekmede')
    expect(screen.getByRole('button', { name: 'Güncel profili yükle' })).toBeVisible()
  })
  it('renders retryable server errors', async () => {
    setup({ failure: true })
    expect(await screen.findByRole('heading', { name: 'Profil yüklenemedi' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Tekrar dene' })).toBeVisible()
  })
  it('closes via Escape and restores focus to the editing control', async () => {
    const { user } = setup({ data: complete() })
    await openEditor(user); await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Profili Düzenle' })).toHaveFocus())
  })
})
