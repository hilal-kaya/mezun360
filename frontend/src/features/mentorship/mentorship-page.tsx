import { useState, useEffect } from 'react'
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
  
  // Requests queries
  const queryIncoming = useIncomingRequests(0)
  const queryOutgoing = useOutgoingRequests(0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedQuery(query)
    setPage(0)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Global Search Omnibar Header */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-primary/10 text-center space-y-4">
        <h1 className="text-3xl font-bold font-barlow text-primary">Mentörlük</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Mentör bul, deneyimlerini paylaş veya gelen talepleri yönet.</p>
        
        {activeTab === 'find' && (
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-6">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400" size={24} />
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="İsim, şirket, pozisyon veya uzmanlığa göre mentör ara..." 
                className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-primary/20 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-lg transition-all"
              />
              <Button type="submit" className="absolute right-2 h-10 rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-semibold">
                Ara
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 justify-center">
        <button 
          onClick={() => { setActiveTab('find'); setPage(0); }}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'find' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mentör Bul
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'incoming' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gelen Talepler
        </button>
        <button 
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'outgoing' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Giden Talepler
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
              {queryMentors.data.content.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                  Aradığınız kriterlere uygun mentör bulunamadı.
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
          {queryIncoming.isPending ? <p className="text-gray-500 text-center py-10">Gelen talepler yükleniyor...</p> : 
           queryIncoming.isError ? <p className="text-red-500 text-center py-10">Hata oluştu.</p> :
           <MentorshipRequestsList requests={queryIncoming.data.content} type="incoming" />}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div className="max-w-4xl mx-auto">
          {queryOutgoing.isPending ? <p className="text-gray-500 text-center py-10">Giden talepler yükleniyor...</p> : 
           queryOutgoing.isError ? <p className="text-red-500 text-center py-10">Hata oluştu.</p> :
           <MentorshipRequestsList requests={queryOutgoing.data.content} type="outgoing" />}
        </div>
      )}

      {selectedMentor && (
        <RequestModal mentorId={selectedMentor.userId} mentorName={selectedMentor.firstName + ' ' + selectedMentor.lastName} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  )
}
