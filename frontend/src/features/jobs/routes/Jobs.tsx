import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '../api/jobs';
import { JobCard } from '../components/JobCard';
import { PostJobModal } from '../components/PostJobModal';
import { Briefcase, Search } from 'lucide-react';

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
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', debouncedQuery],
    queryFn: () => searchJobs({ 
      query: debouncedQuery || undefined,
    })
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <PostJobModal />
      </div>

      {/* Global Search Omnibar Header */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center font-barlow">
          <Briefcase className="mr-3 h-8 w-8 text-primary/80" />
          İş & Staj İlanları
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          BTÜ mezun ağı tarafından paylaşılan fırsatları keşfedin.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mt-8">
          <div className="relative flex items-center bg-white shadow-sm hover:shadow-md transition-shadow rounded-full border border-pastel-blue focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-pastel-blue">
            <Search className="absolute left-5 text-gray-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pozisyon, şirket veya konuma göre iş arayın..." 
              className="w-full h-14 pl-14 pr-32 rounded-full bg-transparent outline-none text-base text-foreground placeholder:text-gray-400"
            />
            <button type="submit" className="absolute right-2 h-10 rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-semibold transition-colors">
              Ara
            </button>
          </div>
        </form>
      </section>

      {/* Main Content */}
      <main className="space-y-4 mt-4">
        {isLoading && (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233A85]"></div>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center flex flex-col items-center">
            <p>İlanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
            <button className="mt-4 px-4 py-2 bg-white border border-red-200 rounded text-red-600 hover:bg-red-50" onClick={() => void refetch()}>Tekrar Dene</button>
          </div>
        )}

        {data?.content.length === 0 && (
          <div className="bg-gray-50 p-12 rounded-lg text-center border border-dashed border-gray-300">
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
