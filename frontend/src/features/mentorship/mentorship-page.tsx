import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIncomingRequests, useOutgoingRequests, useMentors } from './api/mentorshipApi'
import type { MentorResponse } from './api/mentorshipApi'
import { MentorCard } from './components/MentorCard'
import { RequestModal } from './components/RequestModal'
import { MentorshipRequestsList } from './components/MentorshipRequestsList'

export function MentorshipPage() {
  const [activeTab, setActiveTab] = useState<'find' | 'incoming' | 'outgoing'>('find')
  const [expertiseSearch, setExpertiseSearch] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selectedMentor, setSelectedMentor] = useState<MentorResponse | null>(null)

  // Mentors query
  const queryMentors = useMentors(expertiseFilter, page)
  
  // Requests queries
  const queryIncoming = useIncomingRequests(0)
  const queryOutgoing = useOutgoingRequests(0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setExpertiseFilter(expertiseSearch)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-barlow text-btu-navy">Mentörlük</h1>
        <p className="mt-2 text-muted-foreground">Mentör bul, deneyimlerini paylaş veya gelen talepleri yönet.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => { setActiveTab('find'); setPage(0); }}
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'find' ? 'border-b-2 border-btu-navy text-btu-navy' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mentör Bul
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'incoming' ? 'border-b-2 border-btu-navy text-btu-navy' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gelen Talepler
        </button>
        <button 
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'outgoing' ? 'border-b-2 border-btu-navy text-btu-navy' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Giden Talepler
        </button>
      </div>

      {activeTab === 'find' && (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={expertiseSearch}
                onChange={e => setExpertiseSearch(e.target.value)}
                placeholder="Uzmanlık alanına göre ara..." 
                className="w-full rounded-lg border bg-gray-50 p-2 pl-9 focus:border-btu-navy focus:ring-1 focus:ring-btu-navy outline-none" 
              />
            </div>
            <Button type="submit" className="bg-btu-navy hover:bg-btu-navy/90 text-white">Ara</Button>
          </form>

          {queryMentors.isPending ? (
            <p className="text-gray-500">Mentörler yükleniyor...</p>
          ) : queryMentors.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              Mentörler yüklenirken hata oluştu.
            </div>
          ) : (
            <>
              {queryMentors.data.content.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                  Uygun mentör bulunamadı.
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div>
          {queryIncoming.isPending ? <p className="text-gray-500">Gelen talepler yükleniyor...</p> : 
           queryIncoming.isError ? <p className="text-red-500">Hata oluştu.</p> :
           <MentorshipRequestsList requests={queryIncoming.data.content} type="incoming" />}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div>
          {queryOutgoing.isPending ? <p className="text-gray-500">Giden talepler yükleniyor...</p> : 
           queryOutgoing.isError ? <p className="text-red-500">Hata oluştu.</p> :
           <MentorshipRequestsList requests={queryOutgoing.data.content} type="outgoing" />}
        </div>
      )}

      {selectedMentor && (
        <RequestModal mentorId={selectedMentor.userId} mentorName={selectedMentor.firstName + ' ' + selectedMentor.lastName} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  )
}
