import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AlumniNetworkPage } from './network-page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as apiModule from './network-api'

vi.mock('./network-api', () => ({
  useAlumniNetwork: vi.fn(),
}))

const queryClient = new QueryClient()
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('AlumniNetworkPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(apiModule.useAlumniNetwork).mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as any)

    render(<AlumniNetworkPage />, { wrapper })
    expect(screen.getByText('Mezunlar yükleniyor...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(apiModule.useAlumniNetwork).mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: vi.fn(),
    } as any)

    render(<AlumniNetworkPage />, { wrapper })
    expect(screen.getByRole('alert')).toHaveTextContent('Mezun ağı yüklenirken bir hata oluştu.')
  })

  it('renders empty state when no data', () => {
    vi.mocked(apiModule.useAlumniNetwork).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        content: [],
        page: { size: 10, number: 0, totalElements: 0, totalPages: 0 }
      },
      refetch: vi.fn(),
    } as any)

    render(<AlumniNetworkPage />, { wrapper })
    expect(screen.getByText('Aradığınız kriterlere uygun mezun bulunamadı.')).toBeInTheDocument()
  })

  it('renders alumni cards when data is available', async () => {
    vi.mocked(apiModule.useAlumniNetwork).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        content: [
          { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz', department: 'Bilgisayar', graduationYear: 2020, city: 'Bursa', currentCompany: null, currentPosition: null, industry: null }
        ],
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 }
      },
      refetch: vi.fn(),
    } as any)

    render(<AlumniNetworkPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
      expect(screen.getByText('Bilgisayar')).toBeInTheDocument()
      expect(screen.getByText('2020 Mezunu')).toBeInTheDocument()
      expect(screen.getByText('Bursa')).toBeInTheDocument()
    })
  })
})
