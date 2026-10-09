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
    <li className="flex flex-col justify-between rounded-2xl border border-pastel-blue bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:bg-pastel-blue-light/50">
      <div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-full bg-pastel-blue text-lg font-bold text-primary">
            {alumni.firstName.charAt(0)}{alumni.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-primary text-lg">{alumni.firstName} {alumni.lastName}</h3>
            <p className="text-sm text-muted-foreground">{alumni.department ?? 'Bölüm belirtilmemiş'}</p>
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

      <div className="mt-5 pt-4 border-t border-pastel-blue flex flex-col gap-2">
        {errorMsg && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-xl">
            {errorMsg}
          </div>
        )}
        <button
          type="button"
          disabled={isAccepted || isActionLoading}
          onClick={handleAction}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${
            isAccepted
              ? 'bg-gray-100 text-gray-500 cursor-default'
              : isPending
              ? 'bg-pastel-pink text-destructive hover:bg-pastel-pink/80'
              : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
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
    <div className="flex flex-col gap-5 max-w-5xl mx-auto pt-4">
      {/* Global Search Omnibar Header */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold font-barlow text-primary">Mezun Ağı</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">BTÜ mezunlarını keşfet ve ağını genişlet.</p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-8">
          <div className="relative flex items-center bg-white shadow-sm hover:shadow-md transition-shadow rounded-full border border-pastel-blue focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-pastel-blue">
            <Search className="absolute left-5 text-gray-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="İsim, bölüm, sektör veya yıla göre arayın..." 
              className="w-full h-12 pl-14 pr-32 rounded-full bg-transparent outline-none text-base text-foreground placeholder:text-gray-400"
            />
            <Button type="submit" className="absolute right-2 h-10 rounded-full px-5 bg-primary hover:bg-primary/90 text-white font-semibold">
              Ara
            </Button>
          </div>
        </form>
      </section>

      {/* Main Content */}
      <main className="space-y-6">
        {isPending ? (
          <p role="status" className="text-muted-foreground text-center py-8">Mezunlar yükleniyor...</p>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 text-center max-w-lg mx-auto">
            <p role="alert">Mezun ağı yüklenirken bir hata oluştu.</p>
            <Button variant="outline" className="mt-4 bg-white rounded-full" onClick={() => void refetch()}>Tekrar Dene</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-medium px-2">Toplam {data.page.totalElements} mezun bulundu.</p>
            
            {data.content.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-pastel-blue bg-white p-16 text-center text-muted-foreground">
                Aradığınız kriterlere uygun mezun bulunamadı.
              </div>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.content.map(alumni => (
                  <AlumniCard key={alumni.id} alumni={alumni} />
                ))}
              </ul>
            )}

            {/* Pagination Controls */}
            {data.page.totalPages > 1 && (
              <nav aria-label="Sayfalama" className="mt-8 pb-12 flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="rounded-full border-pastel-blue hover:bg-pastel-blue-light"
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </Button>
                <span className="text-sm font-medium text-muted-foreground">Sayfa {page + 1} / {data.page.totalPages}</span>
                <Button 
                  variant="outline" 
                  className="rounded-full border-pastel-blue hover:bg-pastel-blue-light"
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
