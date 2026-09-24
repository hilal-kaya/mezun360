import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AuthGuard, LoginPage, ForgotPasswordPage, AuthenticatedPlaceholder } from '@/features/auth/auth-pages'
import { Loading } from '@/components/ui/loading'
import { RootLayout } from '@/layouts/root-layout'

const DevelopmentFoundation = import.meta.env.DEV
  ? lazy(() => import('@/dev/foundation-page'))
  : null

function FoundationPlaceholder() {
  return (
    <div className="max-w-2xl space-y-5">
      <h1>BTÜ Mezun360</h1>
      <p className="text-lg text-muted-foreground">Mezun topluluğuna güvenli giriş. Ürün ekranları sonraki aşamalarda eklenecek.</p>
      <Link to="/login" className="mr-6 font-semibold text-primary underline">Giriş Yap</Link>
      {import.meta.env.DEV && <Link className="font-semibold text-primary underline" to="/__dev/foundation">Geliştirme kontrollerini aç</Link>}
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<FoundationPlaceholder />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<AuthGuard role="ALUMNI" />}><Route path="/app" element={<AuthenticatedPlaceholder />} /></Route>
          <Route element={<AuthGuard role="ADMIN" />}><Route path="/admin" element={<AuthenticatedPlaceholder admin />} /></Route>
          {DevelopmentFoundation && <Route path="/__dev/foundation" element={<DevelopmentFoundation />} />}
          <Route path="*" element={<div className="space-y-4"><h1>Sayfa bulunamadı</h1><Link to="/" className="text-primary underline">Başlangıca dön</Link></div>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
