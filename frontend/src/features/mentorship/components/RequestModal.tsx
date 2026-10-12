import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCreateMentorshipRequest } from '../api/mentorshipApi'

export function RequestModal({ mentorId, mentorName, onClose }: { mentorId: string, mentorName: string, onClose: () => void }) {
  const [message, setMessage] = useState('')
  const mutation = useCreateMentorshipRequest()

  const isValidLength = message.trim().length >= 10

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidLength) return
    mutation.mutate({ mentorId: mentorId, message: message.trim() }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const errorObj = mutation.error as any
  let errorMessage = errorObj?.problem?.detail || errorObj?.message || "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
  const problemCode = errorObj?.problem?.code
  const status = errorObj?.status

  const isAccessDenied = status === 403 || 
    errorMessage.includes('Access is denied') || 
    errorMessage.includes('verified') || 
    errorMessage.includes('doğrulanmış') || 
    problemCode === 'FORBIDDEN'

  if (isAccessDenied) {
    errorMessage = "Mentörlük talebi gönderebilmek için mezuniyetinizin onaylanmış (VERIFIED) olması ve profilinizin tamamlanmış olması gerekmektedir."
  } else if (problemCode === "VALIDATION_FAILED" || errorMessage === "One or more fields are invalid.") {
    errorMessage = "Lütfen geçerli ve yeterli uzunlukta bir açıklama giriniz (En az 10 karakter)."
  } else if (errorMessage === "You cannot mentor yourself.") {
    errorMessage = "Kendinize mentörlük talebi gönderemezsiniz."
  } else if (errorMessage === "An active mentorship request already exists.") {
    errorMessage = "Zaten aktif bir mentörlük talebiniz bulunuyor."
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-pastel-blue">
        <h2 className="text-xl font-bold text-primary font-barlow mb-4">
          Mentörlük Talebi: {mentorName}
        </h2>
        
        {mutation.isError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-pastel-peach/60 p-3.5 text-xs text-destructive font-medium space-y-2">
            <p>{errorMessage}</p>
            {isAccessDenied && (
              <Link to="/app/profile" className="inline-block text-xs font-semibold text-primary underline">
                Profil ve Mezuniyet Doğrulama Sayfasına Git →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Talep Açıklaması
              </label>
              <span className={`text-[11px] font-medium ${isValidLength ? 'text-green-600' : 'text-slate-400'}`}>
                {message.trim().length}/10 min karakter
              </span>
            </div>
            <textarea
              className="w-full h-32 rounded-lg border border-gray-300 p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
              placeholder="Merhaba, ben BTÜ'den... Mentörlük sürecinde şu konularda deneyiminizden faydalanmak istiyorum..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              disabled={mutation.isPending}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="rounded-xl">
              İptal
            </Button>
            <Button type="submit" disabled={mutation.isPending || !isValidLength} className="bg-primary text-white hover:bg-primary/90 rounded-xl">
              {mutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
