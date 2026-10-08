import type { JobPostDTO } from '../api/jobs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Building2, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBookmark, removeBookmark } from '../api/jobs';

interface JobCardProps {
  job: JobPostDTO;
}

export function JobCard({ job }: JobCardProps) {
  const queryClient = useQueryClient();

  const toggleBookmark = useMutation({
    mutationFn: () => job.bookmarked ? removeBookmark(job.id) : addBookmark(job.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });

  return (
    <Card className="hover:shadow-md transition-all flex flex-col p-6 rounded-3xl border border-pastel-blue hover:border-primary/20 hover:bg-pastel-blue-light/50">
      <div className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <h3 className="text-xl font-bold text-primary">{job.title}</h3>
          <div className="flex items-center text-muted-foreground mt-1">
            <Building2 className="h-4 w-4 mr-1" />
            <span>{job.company}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          
          onClick={() => toggleBookmark.mutate()}
          className={job.bookmarked ? 'text-yellow-500' : 'text-gray-400'}
        >
          <Star className="h-5 w-5" fill={job.bookmarked ? 'currentColor' : 'none'} />
        </Button>
      </div>
      <div className="flex-grow pt-0">
        <div className="flex space-x-2 mt-2 mb-4">
          {job.location && (
            <Badge className="bg-pastel-blue text-primary border-none rounded-full px-3">
              <MapPin className="h-3 w-3 mr-1" />
              {job.location}
            </Badge>
          )}
          <Badge className="bg-pastel-blue text-primary border-none rounded-full px-3">
            <Building2 className="h-3 w-3 mr-1" />
            {job.jobType === 'FULL_TIME' ? 'Tam Zamanlı' : job.jobType === 'PART_TIME' ? 'Yarı Zamanlı' : job.jobType === 'INTERNSHIP' ? 'Staj' : job.jobType === 'CONTRACT' ? 'Sözleşmeli' : 'Serbest'}
          </Badge>
          <Badge className="bg-pastel-brown text-gray-800 border-none rounded-full px-3">
            <Clock className="h-3 w-3 mr-1" />
            {job.workModel === 'REMOTE' ? 'Uzaktan' : job.workModel === 'HYBRID' ? 'Hibrit' : 'Ofisten'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{job.description}</p>
      </div>
      <div className="mt-4 flex items-center pt-0">
        <Button asChild className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm">
          <a 
            href={
              job.applicationUrl.startsWith('http://') || job.applicationUrl.startsWith('https://') || job.applicationUrl.startsWith('mailto:') 
                ? job.applicationUrl 
                : `https://${job.applicationUrl}`
            } 
            target="_blank" 
            rel="noopener noreferrer"
          >
            İncele / Başvur
          </a>
        </Button>
      </div>
    </Card>
  );
}
