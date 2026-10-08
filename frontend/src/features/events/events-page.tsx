import { useState } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { useEvents } from './api/eventsApi'
import { EventCard } from './components/EventCard'
import { Button } from '@/components/ui/button'

export function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all')
  const [page, setPage] = useState(0)

  const { data, isLoading, isError, error } = useEvents(activeTab, page)

  const events = data?.content || []
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    
    if (filterType === 'online') return e.isOnline
    if (filterType === 'offline') return !e.isOnline
    return true
  })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Global Search Omnibar Header */}
      <section className="text-center space-y-3 pt-4">
        <h1 className="text-3xl font-bold text-primary font-barlow flex items-center justify-center gap-3">
          <CalendarDays className="w-8 h-8 text-primary/80" />
          Etkinlikler
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          BTÜ mezun ağı tarafından düzenlenen eğitimler, atölyeler ve buluşmalar.
        </p>

        <div className="max-w-2xl mx-auto relative mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="relative flex-1 flex items-center bg-white shadow-sm hover:shadow-md transition-shadow rounded-full border border-pastel-blue focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-pastel-blue">
            <Search className="absolute left-5 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Etkinlik ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 pl-14 pr-4 rounded-full bg-transparent outline-none text-base text-foreground placeholder:text-gray-400"
            />
          </div>
          <select
            className="h-14 px-6 rounded-full border border-pastel-blue bg-white shadow-sm text-foreground outline-none focus:border-primary/30 focus:ring-4 focus:ring-pastel-blue transition-all"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Tüm Etkinlikler</option>
            <option value="online">Sadece Online</option>
            <option value="offline">Sadece Yüz Yüze</option>
          </select>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 justify-center">
        <button 
          onClick={() => { setActiveTab('upcoming'); setPage(0); }}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'upcoming' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Yaklaşanlar
        </button>
        <button 
          onClick={() => { setActiveTab('past'); setPage(0); }}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'past' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Geçmiş Etkinlikler
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64"></div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
          Etkinlikler yüklenirken bir hata oluştu: {(error as any)?.problem?.detail || (error as any)?.message}
        </div>
      )}

      {!isLoading && !isError && filteredEvents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === 'upcoming' ? 'Yaklaşan etkinlik bulunamadı' : 'Geçmiş etkinlik bulunamadı'}
          </h3>
          <p className="text-gray-500">
            Filtreleri değiştirmeyi deneyebilir veya daha sonra tekrar kontrol edebilirsiniz.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {data && data.page.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            Önceki
          </Button>
          <span className="text-sm text-gray-600">
            Sayfa {page + 1} / {data.page.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.page.totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  )
}
