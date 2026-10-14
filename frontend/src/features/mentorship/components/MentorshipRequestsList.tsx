import type { MentorshipRequestDTO } from '../types'
import { Button } from '@/components/ui/button'
import { useUpdateMentorshipStatus } from '../api/mentorshipApi'
import { Check, X, Clock, CheckCircle2, XCircle, Calendar, MessageSquareQuote } from 'lucide-react'

export function MentorshipRequestsList({ 
  requests, 
  type 
}: { 
  requests: MentorshipRequestDTO[], 
  type: 'incoming' | 'outgoing' 
}) {
  const updateMutation = useUpdateMentorshipStatus()

  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="size-12 rounded-2xl bg-pastel-blue/40 text-primary flex items-center justify-center mx-auto">
          <MessageSquareQuote size={22} />
        </div>
        <p className="text-base font-semibold text-slate-800">
          Henüz {type === 'incoming' ? 'gelen' : 'giden'} mentörlük talebiniz bulunmuyor.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {type === 'incoming' 
            ? 'Profilinizde mentörlük yapmaya açık olduğunuzu belirttiğinizde diğer mezun ve öğrenciler size talep gönderebilir.'
            : 'Mentör Bul sekmesinden sektörünüzdeki veya ilgi duyduğunuz alandaki mezunlara mentörlük talebi iletebilirsiniz.'}
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {requests.map(request => {
        const isPending = request.status === 'PENDING'
        const isAccepted = request.status === 'ACCEPTED'
        const isRejected = request.status === 'REJECTED'

        return (
          <li key={request.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                    isPending ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    isAccepted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    isRejected ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {isPending && <Clock size={12} className="text-amber-600" />}
                    {isAccepted && <CheckCircle2 size={12} className="text-emerald-600" />}
                    {isRejected && <XCircle size={12} className="text-rose-600" />}
                    {isPending ? 'Bekliyor' :
                     isAccepted ? 'Kabul Edildi' :
                     isRejected ? 'Reddedildi' : request.status}
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={13} className="text-slate-400" />
                    {new Date(request.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  <p className="italic text-slate-800">"{request.message}"</p>
                </div>
              </div>
              
              {type === 'incoming' && isPending && (
                <div className="flex items-center gap-2 md:flex-col md:w-32 shrink-0 pt-1">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex gap-1.5 text-xs rounded-xl h-9"
                    onClick={() => updateMutation.mutate({ id: request.id, dto: { status: 'ACCEPTED' } })}
                    disabled={updateMutation.isPending}
                  >
                    <Check size={14} /> Kabul Et
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex gap-1.5 text-xs rounded-xl h-9"
                    onClick={() => updateMutation.mutate({ id: request.id, dto: { status: 'REJECTED' } })}
                    disabled={updateMutation.isPending}
                  >
                    <X size={14} /> Reddet
                  </Button>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
