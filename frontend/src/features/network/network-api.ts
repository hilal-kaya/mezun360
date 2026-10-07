import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AlumniNetworkDTO {
  id: string
  firstName: string
  lastName: string
  department: string | null
  graduationYear: number | null
  currentCompany: string | null
  currentPosition: string | null
  industry: string | null
  city: string | null
  connectionStatus: string
}

export interface Page<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export function useAlumniNetwork(params: { search?: string; department?: string; year?: number; industry?: string; page?: number }) {
  return useQuery({
    queryKey: ['network', params],
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.set('search', params.search)
      if (params.department) searchParams.set('department', params.department)
      if (params.year) searchParams.set('year', params.year.toString())
      if (params.industry) searchParams.set('industry', params.industry)
      if (params.page !== undefined) searchParams.set('page', params.page.toString())
      
      const queryStr = searchParams.toString()
      return await api.get<Page<AlumniNetworkDTO>>(`/network/alumni${queryStr ? '?' + queryStr : ''}`, { signal })
    },
    staleTime: 5 * 60 * 1000
  })
}

export function useConnectMutation() {
  return useMutation({
    mutationFn: async (receiverId: string) => {
      return await api.post(`/network/connections/${receiverId}`)
    },
  })
}

export function useCancelConnectionMutation() {
  return useMutation({
    mutationFn: async (receiverId: string) => {
      return await api.delete(`/network/connections/${receiverId}`)
    },
  })
}
