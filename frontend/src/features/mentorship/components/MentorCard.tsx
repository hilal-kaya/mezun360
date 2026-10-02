import type { MentorResponse } from '../api/mentorshipApi'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'

export function MentorCard({ mentor, onRequest }: { mentor: MentorResponse, onRequest: () => void }) {
  return (
    <li className="flex flex-col justify-between rounded-2xl border border-pastel-blue bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pastel-blue/30 text-lg font-bold text-btu-navy">
            {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-btu-navy">{mentor.firstName} {mentor.lastName}</h3>
            {mentor.title && (
              <p className="text-sm font-medium text-gray-700">{mentor.title}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-gray-600 mb-4">
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
              <span key={skill} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 5 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                +{mentor.expertise.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
      <Button 
        onClick={onRequest} 
        variant="outline" 
        className="w-full border-pastel-blue text-btu-navy hover:bg-pastel-blue/20"
      >
        Mentörlük Talep Et
      </Button>
    </li>
  )
}
