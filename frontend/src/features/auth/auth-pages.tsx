import { useState, type FormEvent } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, ArrowRight, LogOut, ShieldCheck, UserPlus, CheckCircle2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { authApi, homeFor, identityKey, safeAuthError, useIdentity } from './auth'
import { api } from '@/lib/api'

export function AuthGuard({ role }: { role: 'ALUMNI' | 'ADMIN' }) {
  const identity = useIdentity()
  if (identity.isPending) return <Loading label="Oturum kontrol ediliyor…" />
  if (identity.isError) return <Card><h1>Oturum kontrol edilemedi</h1><p role="alert">Bağlantınızı kontrol edip tekrar deneyin.</p><Button onClick={() => void identity.refetch()}>Tekrar dene</Button></Card>
  if (!identity.data) return <Navigate to="/login" replace />
  if (identity.data.role !== role) return <Navigate to={homeFor(identity.data)} replace />
  return <Outlet />
}

export function LoginPage() {
  const identity = useIdentity()
  const cache = useQueryClient()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password.trim() || password.length > 128) {
      setError('Geçerli bir e-posta adresi ve parola girin.'); return
    }
    setBusy(true); setError('')
    try {
      const result = await authApi.login(email, password)
      await cache.cancelQueries(); cache.clear()
      form.reset()
      if (result.mfaRequired) { setError('Yönetici girişi ek doğrulama gerektiriyor. MFA kurulumu henüz kullanıma açılmadı.'); return }
      const user = await authApi.me()
      cache.setQueryData(identityKey, user)
      if (!user) throw new Error('Session unavailable')
      navigate(homeFor(user), { replace: true })
    } catch (failure) { setError(safeAuthError(failure)) }
    finally { setBusy(false) }
  }

  if (identity.isPending) return <Loading label="Oturum kontrol ediliyor…" />
  if (identity.data) return <Navigate to={homeFor(identity.data)} replace />

  return (
    <div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm md:grid-cols-2 max-w-4xl mx-auto my-8">
      <section className="relative hidden flex-col justify-between md:flex gap-10 bg-primary p-8 text-primary-foreground sm:p-12" aria-label="BTÜ Mezun360">
        <div>
          <p className="text-2xl font-bold tracking-tight">BTÜ Mezun360</p>
          <p className="mt-1 text-sm text-pastel-blue font-medium">Kariyer ve Mezun Platformu</p>
        </div>
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-pastel-turquoise tracking-wide uppercase">
            Aynı üniversite. Yeni yollar.
          </span>
          <h2 className="max-w-sm text-3xl font-bold leading-tight sm:text-4xl">BTÜ ile bağın mezuniyetle bitmez.</h2>
          <p className="max-w-sm text-base text-pastel-blue leading-relaxed">
            Mezun topluluğumuzla bağını sürdür, kariyer yolculuğuna birlikte yön verelim.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-pastel-blue">
          <ShieldCheck size={18} aria-hidden="true" className="text-pastel-turquoise" />
          Üniversitenle resmi ve güvenli bir bağ.
        </p>
      </section>

      <section className="p-8 sm:p-12 flex flex-col justify-between" aria-labelledby="login-title">
        <div>
          <div className="mb-8 space-y-2">
            <h1 id="login-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Tekrar hoş geldin</h1>
            <p className="text-sm text-muted-foreground">Mezun360 hesabınla kariyer yolculuğuna devam et.</p>
          </div>
          <form noValidate onSubmit={submit} className="space-y-4" aria-busy={busy}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">E-posta adresi</Label>
              <Input id="email" name="email" type="email" autoComplete="username" maxLength={254} required disabled={busy} placeholder="ornek@btu.edu.tr" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Parola</Label>
              <div className="relative">
                <Input className="pr-12 h-11 rounded-xl" id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" maxLength={128} required disabled={busy} />
                <Button type="button" variant="ghost" className="absolute right-0 top-0 h-11 px-3 text-slate-400 hover:text-slate-600" aria-label={visible ? 'Parolayı gizle' : 'Parolayı göster'} onClick={() => setVisible(!visible)}>
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <Link to="/register" className="font-semibold text-primary hover:underline flex items-center gap-1">
                Hesabın yok mu? Kayıt Ol
              </Link>
              <div className="flex items-center gap-1.5">
                <button type="button" disabled className="cursor-not-allowed text-muted-foreground">Şifremi Unuttum</button>
                <span className="rounded bg-pastel-lavender px-1.5 py-0.5 text-[10px] font-semibold text-primary">Yakında</span>
                <Link to="/forgot-password" className="text-primary hover:underline font-semibold text-[11px] ml-1">
                  (Destek)
                </Link>
              </div>
            </div>
            {(error || identity.isError) && (
              <p role="alert" className="rounded-xl bg-pastel-peach/60 border border-red-200 p-3 text-xs text-destructive font-medium">
                {error || 'Oturum bilgisi alınamadı. Bağlantınızı kontrol edip tekrar deneyin.'}
              </p>
            )}
            <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-sm mt-2" disabled={busy}>
              {busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              <ArrowRight size={16} className="ml-1.5" aria-hidden="true" />
            </Button>
          </form>
        </div>
        <p className="mt-8 text-xs text-center text-muted-foreground">
          Hesabın ve kişisel bilgilerin KVKK standartlarında güvenle korunmaktadır.
        </p>
      </section>
    </div>
  )
}

export function RegisterPage() {
  const identity = useIdentity()
  const cache = useQueryClient()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [visibleConfirm, setVisibleConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [kvkkAccepted, setKvkkAccepted] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const isLengthValid = password.length >= 15 && password.length <= 128
  const isMatchValid = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const firstName = String(data.get('firstName') ?? '').trim()
    const lastName = String(data.get('lastName') ?? '').trim()

    if (!firstName || !lastName) {
      setError('Lütfen ad ve soyadınızı belirtin.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi girin.')
      return
    }
    if (password.length < 15 || password.length > 128) {
      setError('Parola en az 15, en fazla 128 karakter uzunluğunda olmalıdır (NIST 800-63B standardı).')
      return
    }
    if (password !== passwordConfirm) {
      setError('Parolalar birbiriyle eşleşmiyor.')
      return
    }
    if (!kvkkAccepted) {
      setError('Lütfen KVKK Aydınlatma Metnini onaylayın.')
      return
    }

    setBusy(true)
    setError('')

    try {
      await authApi.register({ email, password, firstName, lastName })
      await cache.cancelQueries()
      cache.clear()

      try {
        let etag = ''
        await api.get('/me/profile', { onResponse: r => { etag = r.headers.get('ETag') ?? '"empty"' } })
        await api.put('/me/profile', {
          firstName,
          lastName,
          career: [],
          education: [],
          skills: [],
          certifications: [],
          contribution: {
            willingToMentor: false,
            willingToShareOpportunities: false,
            willingToSpeakAtEvents: false,
            willingToSupportUniversityProjects: false
          }
        }, { headers: { 'If-Match': etag || '"empty"' } })
      } catch {
        // Tolerated initial profile initialization fallback
      }

      const user = await authApi.me()
      cache.setQueryData(identityKey, user)
      if (!user) throw new Error('Session unavailable')
      
      form.reset()
      navigate(homeFor(user), { replace: true })
    } catch (failure) {
      setError(safeAuthError(failure))
    } finally {
      setBusy(false)
    }
  }

  if (identity.isPending) return <Loading label="Oturum kontrol ediliyor…" />
  if (identity.data) return <Navigate to={homeFor(identity.data)} replace />

  return (
    <div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm md:grid-cols-2 max-w-4xl mx-auto my-8">
      <section className="relative hidden flex-col justify-between md:flex gap-10 bg-primary p-8 text-primary-foreground sm:p-12" aria-label="BTÜ Mezun360 Ağı">
        <div>
          <p className="text-2xl font-bold tracking-tight">BTÜ Mezun360</p>
          <p className="mt-1 text-sm text-pastel-blue font-medium">Yeni Mezun & Kariyer Topluluğu</p>
        </div>
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-pastel-turquoise tracking-wide uppercase">
            Topluluğa Katılın
          </span>
          <h2 className="max-w-sm text-3xl font-bold leading-tight sm:text-4xl">Aramıza Hoş Geldiniz!</h2>
          <p className="max-w-sm text-base text-pastel-blue leading-relaxed">
            Kariyer fırsatları, mentörlük eşleşmeleri ve üniversite ağı artık tek bir noktada.
          </p>
          <ul className="space-y-2.5 text-sm text-pastel-turquoise pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Doğrulanmış Bursa Teknik mezun ağı
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Üniversite onaylı iş & staj fırsatları
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Birebir hızlı mentörlük imkanları
            </li>
          </ul>
        </div>
        <p className="flex items-center gap-2 text-sm text-pastel-blue">
          <ShieldCheck size={18} aria-hidden="true" className="text-pastel-turquoise" />
          BTÜ Kariyer Merkezi güvencesiyle.
        </p>
      </section>

      <section className="p-8 sm:p-12 flex flex-col justify-between" aria-labelledby="register-title">
        <div>
          <div className="mb-6 space-y-2">
            <h1 id="register-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Kayıt Ol</h1>
            <p className="text-sm text-muted-foreground">Mezun360 ağına katılmak için formu doldurun.</p>
          </div>

          <form noValidate onSubmit={submit} className="space-y-4" aria-busy={busy}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">Adınız</Label>
                <Input id="firstName" name="firstName" required disabled={busy} placeholder="Ad" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">Soyadınız</Label>
                <Input id="lastName" name="lastName" required disabled={busy} placeholder="Soyad" className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">E-posta adresi</Label>
              <Input id="reg-email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={busy} placeholder="ad.soyad@ornek.com" className="h-11 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-password" className="text-xs font-semibold text-slate-700">Parola</Label>
                <span className={`text-[11px] font-medium flex items-center gap-1 ${isLengthValid ? 'text-green-600' : 'text-slate-400'}`}>
                  {isLengthValid ? <Check size={12} /> : null}
                  {password.length}/15 min karakter
                </span>
              </div>
              <div className="relative">
                <Input 
                  className="pr-12 h-11 rounded-xl" 
                  id="reg-password" 
                  name="password" 
                  type={visible ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  maxLength={128} 
                  required 
                  disabled={busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 15 karakter"
                />
                <Button type="button" variant="ghost" className="absolute right-0 top-0 h-11 px-3 text-slate-400 hover:text-slate-600" aria-label={visible ? 'Parolayı gizle' : 'Parolayı göster'} onClick={() => setVisible(!visible)}>
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-password-confirm" className="text-xs font-semibold text-slate-700">Parola Tekrarı</Label>
                {passwordConfirm.length > 0 && (
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${isMatchValid ? 'text-green-600' : 'text-destructive'}`}>
                    {isMatchValid ? <><Check size={12} /> Eşleşti</> : <><AlertCircle size={12} /> Eşleşmiyor</>}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input 
                  className="pr-12 h-11 rounded-xl" 
                  id="reg-password-confirm" 
                  name="passwordConfirm" 
                  type={visibleConfirm ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  maxLength={128} 
                  required 
                  disabled={busy}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Parolanızı tekrar girin"
                />
                <Button type="button" variant="ghost" className="absolute right-0 top-0 h-11 px-3 text-slate-400 hover:text-slate-600" aria-label={visibleConfirm ? 'Parolayı gizle' : 'Parolayı göster'} onClick={() => setVisibleConfirm(!visibleConfirm)}>
                  {visibleConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input 
                type="checkbox" 
                id="kvkk" 
                checked={kvkkAccepted} 
                onChange={(e) => setKvkkAccepted(e.target.checked)} 
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="kvkk" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                BTÜ Mezun360 KVKK Aydınlatma Metnini okudum ve kişisel verilerimin güvenli biçimde işlenmesini kabul ediyorum.
              </Label>
            </div>

            {(error || identity.isError) && (
              <p role="alert" className="rounded-xl bg-pastel-peach/60 border border-red-200 p-3 text-xs text-destructive font-medium">
                {error || 'İşlem tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.'}
              </p>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-sm mt-3" disabled={busy}>
              {busy ? 'Kayıt Yapılıyor…' : 'Hesap Oluştur'}
              <UserPlus size={16} className="ml-1.5" aria-hidden="true" />
            </Button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
          Zaten bir hesabın var mı?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Giriş Yap
          </Link>
        </div>
      </section>
    </div>
  )
}

export function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-lg my-8 p-8 rounded-3xl border bg-card shadow-sm space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <span className="inline-flex rounded-full bg-pastel-lavender px-3 py-1 text-xs font-semibold text-primary">
          Kurumsal Parola & Hesap Desteği
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Parola Yardımı</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          BTÜ Mezun360 platformunda hesap ve veri güvenliğiniz önceliklidir. Otomatik parola sıfırlama akışı kurumsal güvenlik gereği mezuniyet doğrulamasıyla yönetilmektedir.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-[#FAFAF9] p-5 space-y-3 text-sm">
        <p className="font-semibold text-slate-900">Nasıl parola yenileyebilirim?</p>
        <p className="text-slate-600 text-xs leading-relaxed">
          Kayıtlı e-posta adresiniz, mezuniyet yılınız veya öğrenci numaranızla birlikte Bursa Teknik Üniversitesi Kariyer Gelişimi Uygulama ve Araştırma Merkezi (BUKAGEM) resmi birimine başvurarak parolanızı güvenle güncelleyebilirsiniz:
        </p>
        <div className="pt-2">
          <a
            href="mailto:kariyer@btu.edu.tr?subject=BTU%20Mezun360%20Parola%20Destek%20Talebi"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            kariyer@btu.edu.tr Adresine E-posta Gönder →
          </a>
        </div>
      </div>

      <div className="pt-2 text-center sm:text-left">
        <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
          ← Giriş Ekranına Dön
        </Link>
      </div>
    </div>
  )
}

export function AuthenticatedPlaceholder({ admin = false }: { admin?: boolean }) {
  const identity = useIdentity()
  const cache = useQueryClient()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function logout() {
    setBusy(true); setError('')
    try {
      await authApi.logout()
      await cache.cancelQueries(); cache.clear(); cache.setQueryData(identityKey, null)
      navigate('/login', { replace: true })
    } catch (failure) { setError(safeAuthError(failure)) }
    finally { setBusy(false) }
  }
  return <Card className="space-y-5 my-8"><span className="rounded-full bg-pastel-mint px-3 py-1 text-sm">Oturum açık</span><h1>{admin ? 'Mezun360 Yönetim Alanı' : 'Mezun360 Mezun Alanı'}</h1><p className="text-muted-foreground">Giriş başarılı. Bu alanın özellikleri sonraki aşamalarda eklenecek.</p>{admin && <Button asChild><Link to="/admin/verifications">Mezuniyet Doğrulamaları</Link></Button>}<p>{identity.data?.email}</p>{error && <p role="alert">{error}</p>}<Button variant="outline" onClick={() => void logout()} disabled={busy}><LogOut size={18} aria-hidden="true" />{busy ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}</Button></Card>
}
