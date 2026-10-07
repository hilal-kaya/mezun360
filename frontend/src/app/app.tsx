import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AuthGuard, LoginPage, ForgotPasswordPage, AuthenticatedPlaceholder } from '@/features/auth/auth-pages'
import { Loading } from '@/components/ui/loading'
import { LandingPage } from '@/features/public/landing-page'
import { AlumniLayout, AlumniHome } from '@/layouts/alumni-layout'
import { ProfilePage } from '@/features/profile/profile-page'
import { PrivacyPage } from '@/features/privacy-verification/privacy-page'
import { AlumniNetworkPage } from '@/features/network/network-page'
import { AdminVerificationsPage } from '@/features/privacy-verification/admin-verifications'
import { RootLayout } from '@/layouts/root-layout'
import { Jobs } from '@/features/jobs/routes/Jobs'
import { MentorshipPage } from '@/features/mentorship/mentorship-page'
import { EventsPage } from '@/features/events/events-page'
import { NewsPage } from '@/features/news/news-page'
import { NewsDetailPage } from '@/features/news/news-detail-page'

const DevelopmentFoundation = import.meta.env.DEV
  ? lazy(() => import('@/dev/foundation-page'))
  : null

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthGuard role="ALUMNI" />}>
          <Route path="/app" element={<AlumniLayout />}>
            <Route index element={<AlumniHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<PrivacyPage />} />
            <Route path="network" element={<AlumniNetworkPage />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="mentorship" element={<MentorshipPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetailPage />} />
          </Route>
        </Route>
        <Route element={<RootLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<AuthGuard role="ADMIN" />}><Route path="/admin" element={<AuthenticatedPlaceholder admin />} /><Route path="/admin/verifications" element={<AdminVerificationsPage />} /></Route>
          {DevelopmentFoundation && <Route path="/__dev/foundation" element={<DevelopmentFoundation />} />}
          <Route path="*" element={<div className="space-y-4"><h1>Sayfa bulunamadı</h1><Link to="/" className="text-primary underline">Başlangıca dön</Link></div>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
