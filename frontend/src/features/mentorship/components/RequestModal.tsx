import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateMentorshipRequest } from '../api/mentorshipApi'

export function RequestModal({ mentorId, mentorName, onClose }: { mentorId: string, mentorName: string, onClose: () => void }) {
  const [message, setMessage] = useState('')
  const mutation = useCreateMentorshipRequest()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    mutation.mutate({ mentorId: mentorId, message }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-pastel-blue">
        <h2 className="text-xl font-bold text-btu-navy font-barlow mb-4">
          Mentörlük Talebi: {mentorName}
        </h2>
        
        {mutation.isError && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {(mutation.error as any)?.problem?.detail || (mutation.error as any)?.message || "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kendinizi tanıtın ve neden mentörlük almak istediğinizi açıklayın
            </label>
            <textarea
              className="w-full h-32 rounded-lg border border-gray-300 p-3 focus:border-btu-navy focus:ring-1 focus:ring-btu-navy outline-none resize-none"
              placeholder="Merhaba, ben..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={mutation.isPending}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              İptal
            </Button>
            <Button type="submit" disabled={mutation.isPending || !message.trim()} className="bg-btu-navy text-white hover:bg-btu-navy/90">
              {mutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
