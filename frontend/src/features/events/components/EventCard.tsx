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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pastel-blue flex flex-col h-full transition-all hover:shadow-md hover:border-primary/20 hover:bg-pastel-blue-light/50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          {event.isOnline ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-pastel-blue-light text-primary px-3 py-1 rounded-full">
              <Video className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-pastel-mint text-emerald-800 px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> Yüz Yüze
            </span>
          )}
          {isFull && !event.isUserAttending && (
             <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/10 text-destructive px-3 py-1 rounded-full">
               Kontenjan Dolu
             </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-primary font-barlow mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-primary" />
            <span>{event.currentAttendees} {event.capacity ? `/ ${event.capacity}` : ''} Katılımcı</span>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-pastel-blue mt-auto flex flex-col gap-2">
        {toggleAttendance.isError && (
          <div className="text-xs text-destructive p-2 bg-destructive/10 rounded-xl">
            {(toggleAttendance.error as any)?.problem?.detail || "İşlem başarısız"}
          </div>
        )}
        {toggleAttendance.isSuccess && (
          <div className="text-xs text-emerald-700 p-2 bg-pastel-mint rounded-xl">
            {event.isUserAttending ? "Etkinliğe başarıyla katıldınız." : "Katılımınız başarıyla iptal edildi."}
          </div>
        )}
        <Button 
          onClick={handleToggle}
          disabled={toggleAttendance.isPending || (isFull && !event.isUserAttending) || new Date(event.eventDate).getTime() < Date.now()}
          variant={event.isUserAttending ? "outline" : "default"}
          className={`w-full rounded-xl ${!event.isUserAttending ? 'bg-primary hover:bg-primary/90 text-white shadow-sm' : 'bg-pastel-pink text-destructive border-transparent hover:bg-pastel-pink/80'}`}
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
