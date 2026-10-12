import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useIdentity } from '@/features/auth/auth'
import { useProfile } from '@/features/profile/profile-api'
import { searchJobs } from '@/features/jobs/api/jobs'
import { useEvents } from '@/features/events/api/eventsApi'
import { useNews } from '@/features/news/api/newsApi'
import { useAlumniNetwork } from '@/features/network/network-api'
import { BriefcaseBusiness, CalendarDays, Newspaper, Users, ArrowRight, MapPin, Building2, UserPlus, ShieldAlert } from 'lucide-react'

export function DashboardHome() {
  const identity = useIdentity()
  const profileQuery = useProfile()
  const p = profileQuery.data?.profile?.data
  const userName = p?.firstName ? `${p.firstName} ${p.lastName}` : (identity.data?.email?.split('@')[0] || 'Mezun')
  
  // Fetch latest 3 jobs
  const { data: jobsData, isLoading: jobsLoading, error: jobsErr } = useQuery({ 
    queryKey: ['jobs', 'dashboard'], 
    queryFn: () => searchJobs({ size: 3 }),
    retry: false
  })
  
  // Fetch next 2 events
  const { data: eventsData, isLoading: eventsLoading } = useEvents('upcoming', 0)
  
  // Fetch latest 2 news
  const { data: newsData, isLoading: newsLoading } = useNews(0)

  // Fetch 3 alumni
  const { data: alumniData, isLoading: alumniLoading } = useAlumniNetwork({ page: 0 })

  const jobs = jobsData?.content?.slice(0, 3) || []
  const events = eventsData?.content?.slice(0, 2) || []
  const news = newsData?.content?.slice(0, 2) || []
  const alumni = alumniData?.content?.slice(0, 3) || []
  const isJobsForbidden = (jobsErr as any)?.status === 403

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Hero Welcome Widget */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pastel-blue/60 via-white to-pastel-mint/40 p-6 sm:p-10 border border-pastel-blue/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            Oturum Açık · {identity.data?.role === 'ADMIN' ? 'Yönetici' : 'Mezun'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-barlow tracking-tight">
            Merhaba, {userName}!
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
            Bursa Teknik Üniversitesi mezun ağına hoş geldin. Kariyer profilini güncel tut, üniversite onaylı iş fırsatlarını incele ve mezunlar ağıyla bağını sürdür.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/profile" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors">
              Profilimi Güncelle
            </Link>
            <Link to="/app/network" className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-xs font-semibold text-primary shadow-sm hover:bg-gray-50 transition-colors">
              Ağı Keşfet
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center size-32 rounded-3xl bg-white/80 border border-pastel-blue p-4 shadow-sm text-center flex-col shrink-0">
          <span className="text-3xl font-bold text-primary font-barlow">360°</span>
          <span className="text-[11px] text-muted-foreground font-medium mt-1">BTÜ Mezun Ağı</span>
        </div>
      </section>

      {/* Grid Layout for Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Jobs Widget (2 columns wide on large screens) */}
        <section className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary font-barlow flex items-center gap-2">
              <BriefcaseBusiness className="text-emerald-600" size={20} />
              Öne Çıkan İş & Staj İlanları
            </h2>
            <Link to="/app/jobs" className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1">
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3 flex-1">
            {jobsLoading ? (
              <div className="space-y-3">
                <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            ) : isJobsForbidden ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-pastel-blue/20 border border-pastel-blue/40">
                <ShieldAlert size={24} className="text-primary mb-2" />
                <p className="text-sm font-semibold text-primary">Mezuniyet Doğrulaması Gereklidir</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Kariyer ve staj fırsatlarını görüntülemek için mezuniyet durumunuzun Kariyer Merkezi tarafından doğrulanmış olması gerekmektedir.
                </p>
                <Link to="/app/profile" className="mt-3 text-xs font-semibold text-primary underline">
                  Profil ve Doğrulamaya Git →
                </Link>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map(job => (
                <Link to="/app/jobs" key={job.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 hover:bg-pastel-blue/30 transition-colors border border-slate-100 hover:border-pastel-blue">
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors text-sm">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 size={13}/> {job.company}</span>
                      {job.location && <span className="flex items-center gap-1"><MapPin size={13}/> {job.location}</span>}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary border border-slate-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    İncele
                  </span>
                </Link>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-slate-50 rounded-xl p-6 text-xs">
                Şu anda yayında aktif iş veya staj ilanı bulunmuyor.
              </div>
            )}
          </div>
        </section>

        {/* Network Suggested Widget */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary font-barlow flex items-center gap-2">
              <Users className="text-blue-500" size={20} />
              Ağınız İçin Öneriler
            </h2>
          </div>
          
          <div className="flex flex-col gap-3 flex-1">
            {alumniLoading ? (
              <div className="space-y-3">
                <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              </div>
            ) : alumni.length > 0 ? (
              alumni.map(person => (
                <div key={person.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pastel-blue text-xs font-bold text-primary">
                    {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate text-xs">{person.firstName} {person.lastName}</h3>
                    <p className="text-[11px] text-muted-foreground truncate">{person.currentPosition || person.department || 'Mezun'}</p>
                  </div>
                  <Link to="/app/network" className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-colors" title="Ağa Git">
                    <UserPlus size={14} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-slate-50 rounded-xl p-6 text-xs">
                Ağınız için henüz yeni öneri bulunmuyor.
              </div>
            )}
          </div>
          <Link to="/app/network" className="mt-4 block text-center text-xs font-semibold text-primary hover:underline transition-colors">
            Ağı Genişlet →
          </Link>
        </section>

        {/* Events Widget */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary font-barlow flex items-center gap-2">
              <CalendarDays className="text-amber-500" size={20} />
              Yaklaşan Etkinlikler
            </h2>
          </div>
          
          <div className="flex flex-col gap-3 flex-1">
            {eventsLoading ? (
              <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
            ) : events.length > 0 ? (
              events.map(event => (
                <Link to="/app/events" key={event.id} className="group p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-pastel-blue/20 hover:border-pastel-blue transition-colors">
                  <div className="text-[11px] font-semibold text-primary mb-1">
                    {new Date(event.eventDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 text-xs">{event.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                </Link>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-slate-50 rounded-xl p-6 text-xs">
                Yaklaşan etkinlik bulunmuyor.
              </div>
            )}
          </div>
          <Link to="/app/events" className="mt-4 block text-center text-xs font-semibold text-primary hover:underline transition-colors">
            Tüm Etkinlikler →
          </Link>
        </section>

        {/* News Widget */}
        <section className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary font-barlow flex items-center gap-2">
              <Newspaper className="text-purple-500" size={20} />
              Üniversite Haberleri & Duyurular
            </h2>
            <Link to="/app/news" className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1">
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 flex-1">
            {newsLoading ? (
              <>
                <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
              </>
            ) : news.length > 0 ? (
              news.map(article => (
                <Link to={`/app/news/${article.id}`} key={article.id} className="group flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-pastel-blue/20 hover:border-pastel-blue transition-colors">
                  {article.imageUrl ? (
                    <div className="h-20 w-full rounded-lg overflow-hidden bg-gray-100">
                      <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 text-xs">{article.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="sm:col-span-2 flex-1 flex items-center justify-center text-muted-foreground bg-slate-50 rounded-xl p-6 text-xs">
                Yeni haber veya duyuru bulunmuyor.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
