import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { MentorshipRequestDTO, CreateMentorshipRequestDTO, UpdateMentorshipStatusDTO } from '../types'
import type { Page } from '@/features/network/network-api'

export function useIncomingRequests(page = 0) {
  return useQuery({
    queryKey: ['mentorship-requests', 'incoming', page],
    queryFn: async ({ signal }) => {
      return await api.get<Page<MentorshipRequestDTO>>(`/mentorship/requests/incoming?page=${page}`, { signal })
    },
    staleTime: 60 * 1000
  })
}

export function useOutgoingRequests(page = 0) {
  return useQuery({
    queryKey: ['mentorship-requests', 'outgoing', page],
    queryFn: async ({ signal }) => {
      return await api.get<Page<MentorshipRequestDTO>>(`/mentorship/requests/outgoing?page=${page}`, { signal })
    },
    staleTime: 60 * 1000
  })
}

export function useCreateMentorshipRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateMentorshipRequestDTO) => {
      return await api.post<MentorshipRequestDTO>('/mentorship/requests', dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] })
    }
  })
}

export function useUpdateMentorshipStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string, dto: UpdateMentorshipStatusDTO }) => {
      return await api.patch<MentorshipRequestDTO>(`/mentorship/requests/${id}/status`, dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] })
    }
  })
}

export interface MentorResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  expertise: string[];
}

export function useMentors(expertise?: string, page = 0) {
  return useQuery({
    queryKey: ['mentors', expertise, page],
    queryFn: async ({ signal }) => {
      try {
        const qs = expertise ? `?expertise=${encodeURIComponent(expertise)}&page=${page}` : `?page=${page}`;
        return await api.get<Page<MentorResponse>>(`/mentors${qs}`, { signal })
      } catch (error: any) {
        console.error("Mentor fetch error:", error.response || error);
        throw error;
      }
    },
    staleTime: 60 * 1000
  })
}
