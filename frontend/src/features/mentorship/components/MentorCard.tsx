import type { AlumniNetworkDTO } from '@/features/network/network-api'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, GraduationCap } from 'lucide-react'

export function MentorCard({ mentor, onRequest }: { mentor: AlumniNetworkDTO, onRequest: () => void }) {
  return (
    <li className="flex flex-col justify-between rounded-2xl border border-pastel-blue bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pastel-blue/30 text-lg font-bold text-btu-navy">
            {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-btu-navy">{mentor.firstName} {mentor.lastName}</h3>
            <p className="text-xs text-muted-foreground">{mentor.department ?? 'Bölüm belirtilmemiş'}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-gray-600 mb-6">
          {mentor.currentPosition && (
            <div className="flex items-start gap-2">
              <Briefcase size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <p>{mentor.currentPosition} {mentor.currentCompany ? `@ ${mentor.currentCompany}` : ''}</p>
            </div>
          )}
          {mentor.graduationYear && (
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-gray-400" />
              <p>{mentor.graduationYear} Mezunu</p>
            </div>
          )}
          {mentor.city && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <p>{mentor.city}</p>
            </div>
          )}
        </div>
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
