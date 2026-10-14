import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { searchJobs } from '../api/jobs';
import { JobCard } from '../components/JobCard';
import { PostJobModal } from '../components/PostJobModal';
import { Briefcase, Search } from 'lucide-react';

const JOB_FILTER_CHIPS = [
  { label: 'Tümü', value: '' },
  { label: 'Staj', value: 'INTERNSHIP' },
  { label: 'Tam Zamanlı', value: 'FULL_TIME' },
  { label: 'Yarı Zamanlı', value: 'PART_TIME' },
  { label: 'Uzaktan (Remote)', value: 'REMOTE' },
  { label: 'Hibrit', value: 'HYBRID' },
] as const;

export function Jobs() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Debounce the query for real-time search without flooding the API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobs', debouncedQuery],
    queryFn: () => searchJobs({ 
      query: debouncedQuery || undefined,
    })
  });

  const isForbidden = (error as any)?.status === 403 || 
    (error as any)?.problem?.detail?.includes('VERIFIED') || 
    (error as any)?.problem?.detail?.includes('doğrulanmış');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  const handleChipClick = (val: string) => {
    setQuery(val);
    setDebouncedQuery(val);
  };

  return (
    <div className="container py-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Top Header Section */}
      <section className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-primary flex items-center font-barlow">
              <Briefcase className="mr-3 h-7 w-7 text-primary/80" />
              İş & Staj İlanları
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              BTÜ mezun topluluğu ve onaylı işverenler tarafından paylaşılan kariyer fırsatları.
            </p>
          </div>
          <PostJobModal />
        </div>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-6">
          <div className="relative flex items-center bg-white shadow-sm hover:shadow-md transition-shadow rounded-full border border-pastel-blue focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-pastel-blue">
            <Search className="absolute left-5 text-gray-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pozisyon, şirket, çalışma şekli veya konuma göre arayın..." 
              className="w-full h-12 pl-14 pr-32 rounded-full bg-transparent outline-none text-sm text-foreground placeholder:text-gray-400"
            />
            {query && (
              <button 
                type="button" 
                onClick={() => { setQuery(''); setDebouncedQuery(''); }}
                className="absolute right-20 text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded-full"
                aria-label="Aramayı temizle"
              >
                ✕
              </button>
            )}
            <button type="submit" className="absolute right-2 h-9 rounded-full px-5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors">
              Ara
            </button>
          </div>
        </form>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {JOB_FILTER_CHIPS.map(chip => {
            const active = (chip.value === '' && query === '') || (chip.value !== '' && query.toLowerCase().includes(chip.value.toLowerCase()))
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:bg-pastel-blue-light'
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Main Content */}
      <main className="space-y-4">
        {isLoading && (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}

        {isError && (
          isForbidden ? (
            <div className="bg-pastel-blue/30 border border-pastel-blue p-8 rounded-2xl text-center flex flex-col items-center space-y-3">
              <p className="text-base font-semibold text-primary">Mezuniyet Doğrulaması Gereklidir</p>
              <p className="text-sm text-muted-foreground max-w-md">
                İş ve staj ilanlarını görüntüleyebilmek ve başvuru yapabilmek için mezuniyet durumunuzun Kariyer Merkezi tarafından onaylanmış (VERIFIED) olması gerekmektedir.
              </p>
              <Link to="/app/profile" className="inline-block px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors">
                Profil ve Doğrulama Durumunu İncele
              </Link>
            </div>
          ) : (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center flex flex-col items-center">
              <p>İlanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
              <button className="mt-4 px-4 py-2 bg-white border border-red-200 rounded text-red-600 hover:bg-red-50" onClick={() => void refetch()}>Tekrar Dene</button>
            </div>
          )
        )}

        {data && !isLoading && !isError && (
          <p className="text-sm text-muted-foreground font-medium px-1">
            Toplam <span className="text-slate-900 font-bold">{data.page?.totalElements ?? data.totalElements ?? data.content.length}</span> ilan listeleniyor.
          </p>
        )}

        {data?.content.length === 0 && (
          <div className="bg-gray-50 p-12 rounded-2xl text-center border border-dashed border-gray-300">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">İlan bulunamadı</h3>
            <p className="text-gray-500 mt-2">Farklı anahtar kelimelerle arama yapmayı deneyin.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.content.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
    </div>
  );
}
