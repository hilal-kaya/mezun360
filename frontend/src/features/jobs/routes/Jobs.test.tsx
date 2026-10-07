import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Jobs } from './Jobs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as jobsApi from '../api/jobs';

vi.mock('../api/jobs');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe('Jobs Page', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(jobsApi.searchJobs).mockReturnValue(new Promise(() => {}));
    
    render(
      <QueryClientProvider client={queryClient}>
        <Jobs />
      </QueryClientProvider>
    );

    expect(screen.getByText('İş & Staj İlanları')).toBeInTheDocument();
  });

  it('renders empty state when no jobs', async () => {
    vi.mocked(jobsApi.searchJobs).mockResolvedValue({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Jobs />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('İlan bulunamadı')).toBeInTheDocument();
    });
  });

  it('renders job cards when jobs exist', async () => {
    vi.mocked(jobsApi.searchJobs).mockResolvedValue({
      content: [
        {
          id: '1', title: 'Software Engineer', company: 'Google', location: 'Istanbul', jobType: 'FULL_TIME',
          workModel: 'REMOTE', description: 'Desc', applicationUrl: 'url', createdAt: '2023-01-01', bookmarked: false
        }
      ], 
      totalElements: 1, totalPages: 1, number: 0, size: 20
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Jobs />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
  });
});
