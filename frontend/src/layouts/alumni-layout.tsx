import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { House, Users, BriefcaseBusiness, Handshake, CalendarDays, Newspaper, UserRound, Settings, LogOut, Menu } from 'lucide-react'
import { ProductIdentity } from '@/components/product-identity'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { authApi, identityKey, safeAuthError, useIdentity } from '@/features/auth/auth'
import './alumni.css'

const navigation = [
  ['/app', 'Ana Sayfa', House], ['/app/network', 'Mezunlar Ağı', Users], ['/app/jobs', 'İş & Staj', BriefcaseBusiness],
  ['/app/mentorship', 'Mentörlük', Handshake], ['/app/events', 'Etkinlikler', CalendarDays], ['/app/news', 'Haberler', Newspaper],
  ['/app/profile', 'Profilim', UserRound], ['/app/settings', 'Ayarlar', Settings],
] as const
function AlumniNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return <nav aria-label="Mezun menüsü" className="alumni-nav">{navigation.map(([path, label, Icon]) => <NavLink key={path} end to={path} onClick={onNavigate} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
}
export function AlumniLayout() {
  const identity = useIdentity()
  const cache = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const title = navigation.find(([path]) => path === location.pathname)?.[1] ?? 'Mezun360'
  async function logout() {
    setBusy(true); setError('')
    try {
      await authApi.logout(); await cache.cancelQueries(); cache.clear(); cache.setQueryData(identityKey, null)
      navigate('/login', { replace: true })
    } catch (failure) { setError(safeAuthError(failure)) }
    finally { setBusy(false) }
  }
  const userArea = <div className="alumni-user"><span className="alumni-initial" aria-hidden="true">{identity.data?.email?.slice(0, 1).toLocaleUpperCase('tr')}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{identity.data?.email}</p><p className="text-xs text-muted-foreground">Mezun hesabı</p></div></div>
  return <div className="alumni-shell">
    <a href="#alumni-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-4">İçeriğe geç</a>
    <aside className="alumni-sidebar"><ProductIdentity /><AlumniNavigation /><div className="mt-auto">{userArea}</div></aside>
    <div className="alumni-workspace">
      <header className="alumni-header"><div className="flex items-center gap-3"><Button variant="ghost" className="lg:hidden" aria-label="Mezun menüsünü aç" onClick={() => setOpen(true)}><Menu size={22} /></Button><div><p className="text-lg font-semibold text-primary">{title}</p><p className="text-xs text-muted-foreground">{title === 'Profilim' ? 'Kariyer profili' : 'BTÜ Mezun360'}</p></div></div><Button variant="ghost" disabled={busy} onClick={() => void logout()}><LogOut size={17} aria-hidden="true" />{busy ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}</Button></header>
      {error && <p role="alert" className="mx-6 mt-4 text-destructive">{error}</p>}
      <main id="alumni-main" className="alumni-main"><Outlet /></main>
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-sm"><DialogTitle>Mezun menüsü</DialogTitle><DialogDescription>BTÜ Mezun360 alanın</DialogDescription><AlumniNavigation onNavigate={() => setOpen(false)} />{userArea}</DialogContent></Dialog>
  </div>
}
export { DashboardHome as AlumniHome } from '@/features/home/home-page'

export function UpcomingAlumniPage() {
  const path = useLocation().pathname
  const label = navigation.find(([url]) => path === url)?.[1] ?? 'Bu alan'
  return <section className="profile-card"><span className="profile-chip">Yakında</span><h1 className="mt-4 text-3xl">{label}</h1><p className="my-4 text-muted-foreground">Bu alan henüz kullanıma açılmadı. Şimdilik kendi kariyer profilini oluşturabilir ve güncelleyebilirsin.</p><Link className="text-primary underline" to="/app/profile">Profilime dön</Link></section>
}
