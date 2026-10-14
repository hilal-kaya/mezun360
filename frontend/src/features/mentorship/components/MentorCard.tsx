import type { MentorResponse } from '../api/mentorshipApi'
import { Button } from '@/components/ui/button'
import { Building2, Sparkles } from 'lucide-react'

export function MentorCard({ mentor, onRequest }: { mentor: MentorResponse, onRequest: () => void }) {
  const initials = `${mentor.firstName.charAt(0)}${mentor.lastName.charAt(0)}`.toUpperCase()

  return (
    <li className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5">
      <div>
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pastel-blue to-pastel-mint text-base font-bold text-primary shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-base truncate font-barlow">
                {mentor.firstName} {mentor.lastName}
              </h3>
            </div>
            {mentor.title ? (
              <p className="text-xs font-medium text-slate-600 truncate">{mentor.title}</p>
            ) : (
              <p className="text-xs text-muted-foreground">BTÜ Mezun Mentör</p>
            )}
            {mentor.company && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                <Building2 size={13} className="shrink-0 text-slate-400" />
                <span className="truncate">{mentor.company}</span>
              </div>
            )}
          </div>
        </div>

        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {mentor.expertise.slice(0, 4).map(skill => (
              <span key={skill} className="rounded-full bg-pastel-blue/40 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 4 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                +{mentor.expertise.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <Button 
        onClick={onRequest} 
        variant="outline" 
        className="w-full rounded-xl border-slate-200 hover:border-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold h-10 gap-1.5 shadow-xs"
      >
        <Sparkles size={14} className="text-amber-500 group-hover:text-white" />
        Mentörlük Talep Et
      </Button>
    </li>
  )
}
