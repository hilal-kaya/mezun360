import { useState, useEffect } from 'react'
import { Search, Briefcase, GraduationCap, MapPin, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAlumniNetwork, useConnectMutation, useCancelConnectionMutation, type AlumniNetworkDTO } from './network-api'

function AlumniCard({ alumni }: { alumni: AlumniNetworkDTO }) {
  const [status, setStatus] = useState<string>(alumni.connectionStatus || 'NONE')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Sync local state whenever server data changes (e.g. after query invalidation)
  useEffect(() => {
    setStatus(alumni.connectionStatus || 'NONE')
  }, [alumni.connectionStatus])

  const connectMutation = useConnectMutation()
  const cancelMutation = useCancelConnectionMutation()

  const handleAction = async () => {
    setErrorMsg(null)
    const prevStatus = status
    try {
      if (prevStatus === 'PENDING') {
        setStatus('NONE') // optimistic
        await cancelMutation.mutateAsync(alumni.id)
      } else {
        setStatus('PENDING') // optimistic
        await connectMutation.mutateAsync(alumni.id)
      }
    } catch (error: any) {
      if (error?.problem?.detail === 'Bu kişiye zaten istek gönderdiniz.') {
        setStatus('PENDING')
        setErrorMsg(null) // self-corrected
        return;
      }
      
      setStatus(prevStatus) // revert on failure
      if (error?.problem?.detail) {
        setErrorMsg(error.problem.detail)
      } else if (error?.message) {
        setErrorMsg(error.message === 'API request failed.' ? 'Bir hata oluştu, lütfen tekrar deneyin.' : error.message)
      } else {
        setErrorMsg('İşlem sırasında bir hata oluştu.')
      }
    }
  }

  const isPending = status === 'PENDING'
  const isAccepted = status === 'ACCEPTED'
  const isActionLoading = connectMutation.isPending || cancelMutation.isPending

  const buttonLabel = isAccepted
    ? 'Bağlantılı'
    : isPending
    ? 'İptal Et'
    : 'Bağlantı Kur'

  return (
    <li className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {alumni.firstName.charAt(0)}{alumni.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-primary">{alumni.firstName} {alumni.lastName}</h3>
            <p className="text-xs text-muted-foreground">{alumni.department ?? 'Bölüm belirtilmemiş'}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {alumni.currentPosition && (
            <div className="flex items-start gap-2">
              <Briefcase size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <p>{alumni.currentPosition} {alumni.currentCompany ? `@ ${alumni.currentCompany}` : ''}</p>
            </div>
          )}
          {alumni.graduationYear && (
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-gray-400" />
              <p>{alumni.graduationYear} Mezunu</p>
            </div>
          )}
          {alumni.city && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <p>{alumni.city}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
        {errorMsg && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {errorMsg}
          </div>
        )}
        <button
          type="button"
          disabled={isAccepted || isActionLoading}
          onClick={handleAction}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${
            isAccepted
              ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-default'
              : isPending
              ? 'border border-red-300 bg-white text-red-600 hover:border-red-400 hover:bg-red-50'
              : 'bg-primary text-white hover:bg-primary/90'
          } w-full`}
        >
          {isActionLoading ? 'İşleniyor...' : (
            <>
              {!isPending && !isAccepted && <UserPlus size={16} className="mr-2" />}
              {buttonLabel}
            </>
          )}
        </button>
      </div>
    </li>
  )
}

export function AlumniNetworkPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(0)

  // Debounce the query for real-time search without flooding the API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(0)
    }, 400)
    return () => clearTimeout(handler)
  }, [query])

  const { data, isPending, isError, refetch } = useAlumniNetwork({ query: debouncedQuery, page })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedQuery(query)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Global Search Omnibar */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-primary/10 text-center space-y-4">
        <h1 className="text-3xl font-bold font-barlow text-primary">Mezun Ağı</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">BTÜ mezunlarını keşfet ve ağını genişlet.</p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="İsim, bölüm, sektör veya yıla göre arayın..." 
              className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-primary/20 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-lg transition-all"
            />
            <Button type="submit" className="absolute right-2 h-10 rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-semibold">
              Ara
            </Button>
          </div>
        </form>
      </section>

      {/* Main Content */}
      <main className="space-y-6">
        {isPending ? (
          <p role="status" className="text-gray-500 text-center py-10">Mezunlar yükleniyor...</p>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-center">
            <p role="alert">Mezun ağı yüklenirken bir hata oluştu.</p>
            <Button variant="outline" className="mt-2 bg-white" onClick={() => void refetch()}>Tekrar Dene</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 font-medium">Toplam {data.page.totalElements} mezun bulundu.</p>
            
            {data.content.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                Aradığınız kriterlere uygun mezun bulunamadı.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.content.map(alumni => (
                  <AlumniCard key={alumni.id} alumni={alumni} />
                ))}
              </ul>
            )}

            {/* Pagination Controls */}
            {data.page.totalPages > 1 && (
              <nav aria-label="Sayfalama" className="mt-6 pb-12 flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </Button>
                <span className="text-sm font-medium">Sayfa {page + 1} / {data.page.totalPages}</span>
                <Button 
                  variant="outline" 
                  disabled={page + 1 >= data.page.totalPages} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Sonraki
                </Button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  )
}
