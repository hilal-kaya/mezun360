import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '../api/jobs';
import { JobFilterSidebar } from '../components/JobFilterSidebar';
import { JobCard } from '../components/JobCard';
import { PostJobModal } from '../components/PostJobModal';
import { Briefcase } from 'lucide-react';

export function Jobs() {
  const [location, setLocation] = useState('');
  const [workModel, setWorkModel] = useState('ALL');
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', location, workModel],
    queryFn: () => searchJobs({ 
      location: location || undefined, 
      workModel: workModel === 'ALL' ? undefined : workModel 
    })
  });

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#233A85] flex items-center">
            <Briefcase className="mr-3 h-8 w-8" />
            Alumni Job Board
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover opportunities shared by the BTÜ alumni community.
          </p>
        </div>
        <PostJobModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <JobFilterSidebar 
              location={location} 
              setLocation={setLocation} 
              workModel={workModel} 
              setWorkModel={setWorkModel} 
            />
          </div>
        </aside>
        
        <main className="lg:col-span-3 space-y-4">
          {isLoading && (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233A85]"></div>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
              Failed to load jobs. Please try again later.
            </div>
          )}

          {data?.content.length === 0 && (
            <div className="bg-gray-50 p-12 rounded-lg text-center border border-dashed border-gray-200">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or be the first to post a new opportunity.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {data?.content.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
