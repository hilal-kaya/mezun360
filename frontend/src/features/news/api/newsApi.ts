import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { NewsArticleDTO } from '../types'

type PageResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export function useNews(page = 0) {
  return useQuery({
    queryKey: ['news', page],
    queryFn: async () => {
      try {
        return await api.get<PageResponse<NewsArticleDTO>>(`/news?page=${page}&size=12`);
      } catch (error: any) {
        console.error("News fetch error:", error.problem || error.response || error);
        throw error;
      }
    },
    staleTime: 60 * 1000
  })
}
