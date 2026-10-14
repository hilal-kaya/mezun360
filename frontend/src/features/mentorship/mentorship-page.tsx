import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIncomingRequests, useOutgoingRequests, useMentors } from './api/mentorshipApi'
import type { MentorResponse } from './api/mentorshipApi'
import { MentorCard } from './components/MentorCard'
import { RequestModal } from './components/RequestModal'
import { MentorshipRequestsList } from './components/MentorshipRequestsList'

export function MentorshipPage() {
  const [activeTab, setActiveTab] = useState<'find' | 'incoming' | 'outgoing'>('find')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(0)
  const [selectedMentor, setSelectedMentor] = useState<MentorResponse | null>(null)

  // Debounce the query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(0)
    }, 400)
    return () => clearTimeout(handler)
  }, [query])

  // Mentors query
  const queryMentors = useMentors(debouncedQuery, page)
  
const MENTOR_CHIPS = [
  { label: 'Tümü', value: '' },
  { label: 'Yazılım', value: 'Yazılım' },
  { label: 'Mühendislik', value: 'Mühendislik' },
  { label: 'Veri & AI', value: 'Veri' },
  { label: 'Kariyer & Danışmanlık', value: 'Kariyer' },
  { label: 'Yönetim', value: 'Yönetim' },
] as const

  // Requests queries
  const queryIncoming = useIncomingRequests(0)
  const queryOutgoing = useOutgoingRequests(0)

  const incomingCount = queryIncoming.data?.page?.totalElements
  const outgoingCount = queryOutgoing.data?.page?.totalElements

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedQuery(query)
    setPage(0)
  }

  const handleChipClick = (val: string) => {
    setQuery(val)
    setDebouncedQuery(val)
    setPage(0)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pt-4">
      {/* Global Search Omnibar Header */}
      <section className="text-center space-y-4">
        <div>
          <h1 className="text-3xl font-bold font-barlow text-primary">Mentörlük</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl mx-auto">
            Deneyimli BTÜ mezunlarıyla birebir bağlantı kurun, kariyer tavsiyesi alın veya yeni mezunlara rehberlik edin.
          </p>
        </div>
        
        {activeTab === 'find' && (
          <>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-6">
              <div className="relative flex items-center bg-white shadow-sm hover:shadow-md transition-shadow rounded-full border border-pastel-blue focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-pastel-blue">
                <Search className="absolute left-5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="İsim, şirket, pozisyon veya uzmanlık alanına göre arayın..." 
                  className="w-full h-12 pl-14 pr-36 rounded-full bg-transparent outline-none text-sm text-foreground placeholder:text-gray-400"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setDebouncedQuery(''); setPage(0); }}
                      className="size-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors text-xs font-bold"
                      aria-label="Aramayı temizle"
                    >
                      ✕
                    </button>
                  )}
                  <Button type="submit" className="h-9 rounded-full px-5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs">
                    Ara
                  </Button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {MENTOR_CHIPS.map(chip => {
                const active = (chip.value === '' && query === '') || (chip.value !== '' && query.toLowerCase().includes(chip.value.toLowerCase()))
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleChipClick(chip.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      active 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:bg-pastel-blue-light'
                    }`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-gray-200 justify-center">
        <button 
          onClick={() => { setActiveTab('find'); setPage(0); }}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'find' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mentör Bul
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors flex items-center gap-1.5 ${activeTab === 'incoming' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gelen Talepler
          {typeof incomingCount === 'number' && incomingCount > 0 && (
            <span className="rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5 font-bold">
              {incomingCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors flex items-center gap-1.5 ${activeTab === 'outgoing' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Giden Talepler
          {typeof outgoingCount === 'number' && outgoingCount > 0 && (
            <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 font-bold">
              {outgoingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'find' && (
        <div className="space-y-6">
          {queryMentors.isPending ? (
            <p className="text-gray-500 text-center py-10">Mentörler yükleniyor...</p>
          ) : queryMentors.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-center">
              Mentörler yüklenirken hata oluştu.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Toplam <span className="text-slate-900 font-bold">{queryMentors.data.page.totalElements}</span> kayıtlı mentör
                </p>
                {query && (
                  <button 
                    type="button"
                    onClick={() => { setQuery(''); setDebouncedQuery(''); setPage(0); }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>

              {queryMentors.data.content.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-slate-600 space-y-3">
                  <p className="text-base font-semibold text-slate-800">Aradığınız kriterlere uygun mentör bulunamadı.</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Farklı bir arama terimi deneyebilir veya filtreleri temizleyerek tüm mentörleri listeleyebilirsiniz.
                  </p>
                  {query && (
                    <Button 
                      variant="outline" 
                      onClick={() => { setQuery(''); setDebouncedQuery(''); setPage(0); }}
                      className="rounded-xl text-xs"
                    >
                      Tüm Mentörleri Göster
                    </Button>
                  )}
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {queryMentors.data.content.map(mentor => (
                    <MentorCard 
                      key={mentor.id} 
                      mentor={mentor} 
                      onRequest={() => setSelectedMentor(mentor)} 
                    />
                  ))}
                </ul>
              )}
              
              {queryMentors.data.page.totalPages > 1 && (
                <nav aria-label="Sayfalama" className="mt-6 flex items-center justify-center gap-4">
                  <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Önceki</Button>
                  <span className="text-sm font-medium">Sayfa {page + 1} / {queryMentors.data.page.totalPages}</span>
                  <Button variant="outline" disabled={page + 1 >= queryMentors.data.page.totalPages} onClick={() => setPage(p => p + 1)}>Sonraki</Button>
                </nav>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'incoming' && (
        <div className="max-w-4xl mx-auto">
          {queryIncoming.isPending ? (
            <p className="text-gray-500 text-center py-10">Gelen talepler yükleniyor...</p>
          ) : queryIncoming.isError ? (
            <div className="rounded-2xl border border-dashed border-pastel-blue bg-white p-8 text-center space-y-3">
              <p className="text-base font-semibold text-primary">Mezuniyet Doğrulaması Gereklidir</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Gelen mentörlük taleplerinizi yönetebilmek için mezuniyet durumunuzun doğrulanmış (VERIFIED) olması gerekmektedir.
              </p>
              <Button asChild variant="outline" className="rounded-xl text-xs h-9 px-4">
                <Link to="/app/profile">Profil ve Doğrulama Durumunu İncele</Link>
              </Button>
            </div>
          ) : (
            <MentorshipRequestsList requests={queryIncoming.data.content} type="incoming" />
          )}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div className="max-w-4xl mx-auto">
          {queryOutgoing.isPending ? (
            <p className="text-gray-500 text-center py-10">Giden talepler yükleniyor...</p>
          ) : queryOutgoing.isError ? (
            <div className="rounded-2xl border border-dashed border-pastel-blue bg-white p-8 text-center space-y-3">
              <p className="text-base font-semibold text-primary">Mezuniyet Doğrulaması Gereklidir</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Giden mentörlük taleplerinizi listeleyebilmek için mezuniyet durumunuzun doğrulanmış (VERIFIED) olması gerekmektedir.
              </p>
              <Button asChild variant="outline" className="rounded-xl text-xs h-9 px-4">
                <Link to="/app/profile">Profil ve Doğrulama Durumunu İncele</Link>
              </Button>
            </div>
          ) : (
            <MentorshipRequestsList requests={queryOutgoing.data.content} type="outgoing" />
          )}
        </div>
      )}

      {selectedMentor && (
        <RequestModal mentorId={selectedMentor.userId} mentorName={selectedMentor.firstName + ' ' + selectedMentor.lastName} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  )
}
