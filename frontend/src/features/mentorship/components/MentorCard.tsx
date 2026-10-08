import type { MentorResponse } from '../api/mentorshipApi'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'

export function MentorCard({ mentor, onRequest }: { mentor: MentorResponse, onRequest: () => void }) {
  return (
    <li className="flex flex-col justify-between rounded-3xl border border-pastel-blue bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:bg-pastel-blue-light/50">
      <div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pastel-blue text-lg font-bold text-primary">
            {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-primary text-lg">{mentor.firstName} {mentor.lastName}</h3>
            {mentor.title && (
              <p className="text-sm font-medium text-gray-700">{mentor.title}</p>
            )}
          </div>
        </div>
        
        <div className="mt-5 space-y-2 text-sm text-gray-600 mb-4">
          {mentor.company && (
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <p>{mentor.company}</p>
            </div>
          )}
        </div>

        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {mentor.expertise.slice(0, 5).map(skill => (
              <span key={skill} className="rounded-full bg-pastel-blue-light px-3 py-1 text-xs font-semibold text-primary">
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 5 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                +{mentor.expertise.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
      <Button 
        onClick={onRequest} 
        variant="outline" 
        className="w-full rounded-xl border-pastel-blue text-primary hover:bg-pastel-blue/20"
      >
        Mentörlük Talep Et
      </Button>
    </li>
  )
}
