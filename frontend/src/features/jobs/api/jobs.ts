import { api } from '@/lib/api';

export type WorkModel = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface JobPostDTO {
  id: string;
  title: string;
  company: string;
  location?: string;
  workModel: WorkModel;
  description: string;
  applicationUrl: string;
  createdAt: string;
  bookmarked: boolean;
}

export interface JobPostRequest {
  title: string;
  company: string;
  location?: string;
  workModel: WorkModel;
  description: string;
  applicationUrl: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function searchJobs(params: { location?: string; workModel?: string; page?: number; size?: number }): Promise<Page<JobPostDTO>> {
  const query = new URLSearchParams();
  if (params.location) query.append('location', params.location);
  if (params.workModel) query.append('workModel', params.workModel);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.size !== undefined) query.append('size', params.size.toString());
  
  const queryString = query.toString();
  return api.get<Page<JobPostDTO>>(`/jobs${queryString ? '?' + queryString : ''}`);
}

export async function createJobPost(data: JobPostRequest): Promise<JobPostDTO> {
  return api.post<JobPostDTO>('/jobs', data);
}

export async function addBookmark(id: string): Promise<void> {
  await api.post(`/jobs/${id}/bookmarks`);
}

export async function removeBookmark(id: string): Promise<void> {
  await api.delete(`/jobs/${id}/bookmarks`);
}
