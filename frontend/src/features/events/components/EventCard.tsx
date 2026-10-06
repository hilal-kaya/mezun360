import { MapPin, Calendar, Users, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EventDTO } from '../types'
import { useToggleAttendance } from '../api/eventsApi'

interface EventCardProps {
  event: EventDTO
}

export function EventCard({ event }: EventCardProps) {
  const toggleAttendance = useToggleAttendance()

  const handleToggle = () => {
    toggleAttendance.mutate(event.id)
  }

  const dateStr = new Date(event.eventDate).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const isFull = event.capacity !== null && event.currentAttendees >= event.capacity

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-pastel-blue flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          {event.isOnline ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              <Video className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" /> Yüz Yüze
            </span>
          )}
          {isFull && !event.isUserAttending && (
             <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
               Kontenjan Dolu
             </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-btu-navy font-barlow mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-btu-navy" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-btu-navy" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-btu-navy" />
            <span>{event.currentAttendees} {event.capacity ? `/ ${event.capacity}` : ''} Katılımcı</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 mt-auto flex flex-col gap-2">
        {toggleAttendance.isError && (
          <div className="text-xs text-red-600 p-2 bg-red-50 rounded">
            {(toggleAttendance.error as any)?.problem?.detail || "İşlem başarısız"}
          </div>
        )}
        {toggleAttendance.isSuccess && (
          <div className="text-xs text-emerald-600 p-2 bg-emerald-50 rounded">
            {event.isUserAttending ? "Etkinliğe başarıyla katıldınız." : "Katılımınız başarıyla iptal edildi."}
          </div>
        )}
        <Button 
          onClick={handleToggle}
          disabled={toggleAttendance.isPending || (isFull && !event.isUserAttending) || new Date(event.eventDate).getTime() < Date.now()}
          variant={event.isUserAttending ? "outline" : "default"}
          className={`w-full ${!event.isUserAttending ? 'bg-btu-navy hover:bg-btu-navy/90 text-white' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
        >
          {toggleAttendance.isPending 
            ? 'İşleniyor...' 
            : new Date(event.eventDate).getTime() < Date.now()
              ? 'Etkinlik Sona Erdi'
              : event.isUserAttending 
                ? 'Katılımı İptal Et' 
                : 'Katıl'}
        </Button>
      </div>
    </div>
  )
}
