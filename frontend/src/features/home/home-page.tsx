import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useIdentity } from '@/features/auth/auth'
import { searchJobs } from '@/features/jobs/api/jobs'
import { useEvents } from '@/features/events/api/eventsApi'
import { useNews } from '@/features/news/api/newsApi'
import { useAlumniNetwork } from '@/features/network/network-api'
import { BriefcaseBusiness, CalendarDays, Newspaper, Users, ArrowRight, MapPin, Building2, UserPlus } from 'lucide-react'

export function DashboardHome() {
  const identity = useIdentity()
  const userName = identity.data?.email?.split('@')[0] || 'Mezun'
  
  // Fetch latest 3 jobs
  const { data: jobsData } = useQuery({ queryKey: ['jobs', 'dashboard'], queryFn: () => searchJobs({ size: 3 }) })
  
  // Fetch next 2 events
  const { data: eventsData } = useEvents('upcoming', 0)
  
  // Fetch latest 2 news
  const { data: newsData } = useNews(0)

  // Fetch 3 alumni
  const { data: alumniData } = useAlumniNetwork({ page: 0 })

  const jobs = jobsData?.content?.slice(0, 3) || []
  const events = eventsData?.content?.slice(0, 2) || []
  const news = newsData?.content?.slice(0, 2) || []
  const alumni = alumniData?.content?.slice(0, 3) || []

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-2">
      {/* Hero Welcome Widget */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pastel-pink to-pastel-peach p-8 sm:p-12 shadow-sm border border-pastel-pink">
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-white/60 px-4 py-1.5 text-sm font-semibold text-primary mb-4 backdrop-blur-md">
            Oturum Açık
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-barlow tracking-tight">
            Merhaba, {userName}!
          </h1>
          <p className="mt-4 max-w-xl text-primary/80 font-medium">
            Kariyer yolculuğunu profilinde bir araya getir, etkinliklere katıl ve güçlü mezun ağına dahil ol.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/app/profile" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors">
              Profilimi Güncelle
            </Link>
            <Link to="/app/network" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-medium text-primary shadow-sm hover:bg-white/80 transition-colors">
              Ağı Keşfet
            </Link>
          </div>
        </div>
        {/* Background decorative element */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
        <div className="absolute right-20 -bottom-20 h-48 w-48 rounded-full bg-white/30 blur-2xl"></div>
      </section>

      {/* Grid Layout for Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Jobs Widget (2 columns wide on large screens) */}
        <section className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-pastel-blue flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary font-barlow flex items-center gap-2">
              <BriefcaseBusiness className="text-pastel-green" size={24} />
              Öne Çıkan İş & Staj İlanları
            </h2>
            <Link to="/app/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
              Tümünü Gör <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {jobs.length > 0 ? jobs.map(job => (
              <Link to="/app/jobs" key={job.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-pastel-blue-light hover:bg-pastel-mint/30 transition-colors border border-transparent hover:border-pastel-mint">
                <div>
                  <h3 className="font-semibold text-primary group-hover:text-emerald-700 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 size={14}/> {job.company}</span>
                    {job.location && <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>}
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  İncele
                </span>
              </Link>
            )) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-gray-50 rounded-2xl p-6">Henüz ilan bulunmuyor.</div>
            )}
          </div>
        </section>

        {/* Network Suggested Widget */}
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-pastel-blue flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary font-barlow flex items-center gap-2">
              <Users className="text-pastel-blue" size={24} />
              Ağınız İçin Öneriler
            </h2>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {alumni.length > 0 ? alumni.map(person => (
              <div key={person.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-pastel-blue-light transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pastel-blue text-sm font-bold text-primary">
                  {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary truncate">{person.firstName} {person.lastName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{person.currentPosition || person.department || 'Mezun'}</p>
                </div>
                <Link to="/app/network" className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-pastel-blue text-primary hover:bg-primary hover:text-white transition-colors" title="Ağa Git">
                  <UserPlus size={16} />
                </Link>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-gray-50 rounded-2xl p-6">Kişi bulunamadı.</div>
            )}
          </div>
          <Link to="/app/network" className="mt-4 block text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Ağı Genişlet
          </Link>
        </section>

        {/* Events Widget */}
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-pastel-blue flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary font-barlow flex items-center gap-2">
              <CalendarDays className="text-pastel-brown" size={24} />
              Yaklaşan Etkinlikler
            </h2>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {events.length > 0 ? events.map(event => (
              <Link to="/app/events" key={event.id} className="group p-4 rounded-2xl border border-pastel-brown/50 hover:bg-pastel-brown/20 transition-colors">
                <div className="text-xs font-semibold text-amber-700 mb-1">
                  {new Date(event.eventDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </div>
                <h3 className="font-semibold text-primary group-hover:text-amber-800 transition-colors line-clamp-2">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{event.location}</p>
              </Link>
            )) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-gray-50 rounded-2xl p-6">Yaklaşan etkinlik yok.</div>
            )}
          </div>
          <Link to="/app/events" className="mt-4 block text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Tüm Etkinlikler
          </Link>
        </section>

        {/* News Widget */}
        <section className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-pastel-blue flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary font-barlow flex items-center gap-2">
              <Newspaper className="text-pastel-lavender" size={24} />
              Yeni Haberler
            </h2>
            <Link to="/app/news" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
              Haberlere Git <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 flex-1">
            {news.length > 0 ? news.map(article => (
              <Link to={`/app/news/${article.id}`} key={article.id} className="group flex flex-col gap-3 p-4 rounded-2xl border border-pastel-lavender/50 hover:bg-pastel-lavender/30 transition-colors">
                {article.imageUrl ? (
                  <div className="h-24 w-full rounded-xl overflow-hidden bg-gray-100">
                    <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ) : null}
                <div>
                  <h3 className="font-semibold text-primary group-hover:text-purple-800 transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                </div>
              </Link>
            )) : (
              <div className="sm:col-span-2 flex-1 flex items-center justify-center text-muted-foreground bg-gray-50 rounded-2xl p-6">Yeni haber bulunmuyor.</div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
