import type { MentorshipRequestDTO } from '../types'
import { Button } from '@/components/ui/button'
import { useUpdateMentorshipStatus } from '../api/mentorshipApi'
import { Check, X } from 'lucide-react'

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
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
        Henüz {type === 'incoming' ? 'gelen' : 'giden'} mentörlük talebiniz bulunmuyor.
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {requests.map(request => (
        <li key={request.id} className="rounded-2xl border border-pastel-blue bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                  request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status === 'PENDING' ? 'Bekliyor' :
                   request.status === 'ACCEPTED' ? 'Kabul Edildi' :
                   request.status === 'REJECTED' ? 'Reddedildi' : request.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                "{request.message}"
              </p>
            </div>
            
            {type === 'incoming' && request.status === 'PENDING' && (
              <div className="flex items-center gap-2 md:flex-col md:w-32 shrink-0">
                <Button 
                   
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex gap-1"
                  onClick={() => updateMutation.mutate({ id: request.id, dto: { status: 'ACCEPTED' } })}
                  disabled={updateMutation.isPending}
                >
                  <Check size={16} /> Kabul Et
                </Button>
                <Button 
                   
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex gap-1"
                  onClick={() => updateMutation.mutate({ id: request.id, dto: { status: 'REJECTED' } })}
                  disabled={updateMutation.isPending}
                >
                  <X size={16} /> Reddet
                </Button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
