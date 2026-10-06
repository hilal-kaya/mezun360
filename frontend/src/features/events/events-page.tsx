import { useState } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-barlow flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-pastel-blue" />
            Etkinlikler
          </h1>
          <p className="text-gray-600 mt-2">
            BTÜ mezun ağı tarafından düzenlenen eğitimler, atölyeler ve buluşmalar.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-pastel-blue p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
              className={activeTab === 'upcoming' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-600'}
              onClick={() => { setActiveTab('upcoming'); setPage(0); }}
            >
              Yaklaşanlar
            </Button>
            <Button
              variant={activeTab === 'past' ? 'default' : 'ghost'}
              className={activeTab === 'past' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-600'}
              onClick={() => { setActiveTab('past'); setPage(0); }}
            >
              Geçmiş Etkinlikler
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Etkinlik ara..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Tüm Etkinlikler</option>
              <option value="online">Sadece Online</option>
              <option value="offline">Sadece Yüz Yüze</option>
            </select>
          </div>
        </div>
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
