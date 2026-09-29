import { useState, type FormEvent } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, ArrowRight, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { authApi, homeFor, identityKey, safeAuthError, useIdentity } from './auth'

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
    <div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm md:grid-cols-2">
      <section className="relative hidden flex-col justify-between md:flex gap-10 bg-primary p-8 text-primary-foreground sm:p-12" aria-label="BTÜ Mezun360">
        <div><p className="text-2xl font-semibold">BTÜ Mezun360</p><p className="mt-1 text-sm text-pastel-blue">Kariyer ve Mezun Platformu</p></div>
        <div className="space-y-5"><span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm text-pastel-turquoise">Aynı üniversite. Yeni yollar.</span><h2 className="max-w-sm text-3xl leading-tight sm:text-4xl">BTÜ ile bağın mezuniyetle bitmez.</h2><p className="max-w-sm text-lg text-pastel-blue">Mezun topluluğumuzla bağını sürdür, kariyer yolculuğuna birlikte devam edelim.</p></div>
        <p className="flex items-center gap-2 text-sm text-pastel-blue"><ShieldCheck size={18} aria-hidden="true" />Üniversitenle güvenli bir bağ.</p>
      </section>
      <section className="p-8 sm:p-12" aria-labelledby="login-title">
        <div className="mb-8 space-y-2"><h1 id="login-title" className="text-3xl">Tekrar hoş geldin</h1><p className="text-muted-foreground">Mezun360 hesabınla yolculuğuna devam et.</p></div>
        <form noValidate onSubmit={submit} className="space-y-5" aria-busy={busy}>
          <div className="space-y-2"><Label htmlFor="email">E-posta adresi</Label><Input id="email" name="email" type="email" autoComplete="username" maxLength={254} required disabled={busy} placeholder="ornek@eposta.com" /></div>
          <div className="space-y-2"><Label htmlFor="password">Parola</Label><div className="relative"><Input className="pr-14" id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" maxLength={128} required disabled={busy} /><Button variant="ghost" className="absolute right-0 top-0 px-3" aria-label={visible ? 'Parolayı gizle' : 'Parolayı göster'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</Button></div></div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-sm"><button type="button" disabled className="cursor-not-allowed text-muted-foreground" aria-describedby="reset-availability">Şifremi Unuttum</button><span id="reset-availability" className="rounded bg-pastel-lavender px-2 py-1 text-xs font-medium text-primary">Yakında</span></div>
          {(error || identity.isError) && <p role="alert" className="rounded-md bg-pastel-peach p-3 text-sm text-destructive">{error || 'Oturum bilgisi alınamadı. Bağlantınızı kontrol edip tekrar deneyin.'}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}<ArrowRight size={18} aria-hidden="true" /></Button>
        </form>
        <p className="mt-8 text-sm text-muted-foreground">Hesabın ve kişisel bilgilerin yalnızca yetkin dahilinde erişilebilir.</p>
      </section>
    </div>
  )
}
export function ForgotPasswordPage() {
  return <Card className="mx-auto max-w-lg space-y-4"><h1>Parola yardımı</h1><p>Parola sıfırlama henüz kullanıma açılmadı. Bu ekranda e-posta veya sıfırlama bağlantısı gönderilmez.</p><Link to="/login" className="font-semibold text-primary underline">Girişe dön</Link></Card>
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
  return <Card className="space-y-5"><span className="rounded-full bg-pastel-mint px-3 py-1 text-sm">Oturum açık</span><h1>{admin ? 'Mezun360 Yönetim Alanı' : 'Mezun360 Mezun Alanı'}</h1><p className="text-muted-foreground">Giriş başarılı. Bu alanın özellikleri sonraki aşamalarda eklenecek.</p>{admin && <Button asChild><Link to="/admin/verifications">Mezuniyet Doğrulamaları</Link></Button>}<p>{identity.data?.email}</p>{error && <p role="alert">{error}</p>}<Button variant="outline" onClick={() => void logout()} disabled={busy}><LogOut size={18} aria-hidden="true" />{busy ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}</Button></Card>
}
