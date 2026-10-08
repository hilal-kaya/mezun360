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
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [industry, setIndustry] = useState('')
  const [year, setYear] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(0)

  // Quick debounce or simple form submission
  const [filters, setFilters] = useState({ search: '', department: '', industry: '', year: undefined as number | undefined })

  const query = useAlumniNetwork({ ...filters, page })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search, department, industry, year })
    setPage(0)
  }

  const clearFilters = () => {
    setSearch('')
    setDepartment('')
    setIndustry('')
    setYear(undefined)
    setFilters({ search: '', department: '', industry: '', year: undefined })
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-1/4 shrink-0 space-y-6 rounded-2xl bg-white p-5 shadow-sm border border-primary/20">
        <h2 className="text-xl font-bold text-primary font-barlow">Mezun Filtrele</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-sm">
            <span className="font-semibold text-gray-700">İsim ile Ara</span>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz" 
                className="w-full rounded-lg border bg-gray-50 p-2 pl-9 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
          </label>
          
          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Bölüm</span>
            <input 
              type="text" 
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="Örn: Bilgisayar Mühendisliği" 
              className="mt-1 w-full rounded-lg border bg-gray-50 p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Sektör</span>
            <input 
              type="text" 
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="Örn: Bilişim" 
              className="mt-1 w-full rounded-lg border bg-gray-50 p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Mezuniyet Yılı</span>
            <input 
              type="number" 
              min={1900}
              max={new Date().getFullYear()}
              value={year || ''}
              onChange={e => setYear(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Örn: 2023" 
              className="mt-1 w-full rounded-lg border bg-gray-50 p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">Ara</Button>
            <Button type="button" variant="outline" onClick={clearFilters} className="border-primary/20">Temizle</Button>
          </div>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-barlow text-primary">Mezun Ağı</h1>
          <p className="mt-2 text-muted-foreground">BTÜ mezunlarını keşfet ve ağını genişlet.</p>
        </div>

        {query.isPending ? (
          <p role="status" className="text-gray-500">Mezunlar yükleniyor...</p>
        ) : query.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p role="alert">Mezun ağı yüklenirken bir hata oluştu.</p>
            <Button variant="outline" className="mt-2 bg-white" onClick={() => void query.refetch()}>Tekrar Dene</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 font-medium">Toplam {query.data.page.totalElements} mezun bulundu.</p>
            
            {query.data.content.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                Aradığınız kriterlere uygun mezun bulunamadı.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {query.data.content.map(alumni => (
                  <AlumniCard key={alumni.id} alumni={alumni} />
                ))}
              </ul>
            )}

            {/* Pagination Controls */}
            {query.data.page.totalPages > 1 && (
              <nav aria-label="Sayfalama" className="mt-6 flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </Button>
                <span className="text-sm font-medium">Sayfa {page + 1} / {query.data.page.totalPages}</span>
                <Button 
                  variant="outline" 
                  disabled={page + 1 >= query.data.page.totalPages} 
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
