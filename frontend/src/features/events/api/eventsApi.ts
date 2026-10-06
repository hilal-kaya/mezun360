import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventDTO } from '../types'

type PageResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export function useEvents(type: 'upcoming' | 'past', page = 0) {
  return useQuery({
    queryKey: ['events', type, page],
    queryFn: async () => {
      try {
        return await api.get<PageResponse<EventDTO>>(`/events?type=${type}&page=${page}&size=10`);
      } catch (error: any) {
        console.error("Events fetch error:", error.problem || error.response || error);
        throw error;
      }
    },
    staleTime: 60 * 1000
  })
}

export function useToggleAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (eventId: string) => {
      try {
        return await api.post<void>(`/events/${eventId}/attend`);
      } catch (error: any) {
        console.error("Event attendance error:", error.problem || error.response || error);
        throw error;
      }
    },
    onSuccess: (_, eventId) => {
      queryClient.setQueriesData({ queryKey: ['events'] }, (oldData: any) => {
        if (!oldData || !oldData.content) return oldData;
        return {
          ...oldData,
          content: oldData.content.map((event: EventDTO) => {
            if (event.id === eventId) {
              const wasAttending = event.isUserAttending;
              return {
                ...event,
                isUserAttending: !wasAttending,
                currentAttendees: wasAttending ? event.currentAttendees - 1 : event.currentAttendees + 1
              };
            }
            return event;
          })
        };
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  })
}
