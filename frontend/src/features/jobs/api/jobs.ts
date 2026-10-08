import { api } from '@/lib/api';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE';
export type WorkModel = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface JobPostDTO {
  id: string;
  title: string;
  company: string;
  location?: string;
  jobType: JobType;
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
  jobType: JobType;
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

export async function searchJobs(params: { query?: string; page?: number; size?: number }): Promise<Page<JobPostDTO>> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.append('query', params.query);
  if (params.page !== undefined) searchParams.append('page', params.page.toString());
  if (params.size !== undefined) searchParams.append('size', params.size.toString());
  
  const queryString = searchParams.toString();
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
