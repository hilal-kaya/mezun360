import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { reviewError, useSubmitVerification, useVerification } from './queries'
import { StatusBadge } from './shared'
import { reviewDate } from './display'
export function VerificationCard({ profileExists }: { profileExists: boolean }) {
  const query = useVerification()
  const submit = useSubmitVerification()
  const [open, setOpen] = useState(false)
  if (query.isPending) return <section className="profile-card"><p role="status">Doğrulama durumu yükleniyor…</p></section>
  if (query.isError) return <section className="profile-card"><p role="alert">Doğrulama durumu alınamadı.</p><Button variant="ghost" onClick={() => void query.refetch()}>Durumu yenile</Button></section>
  const { data, etag } = query.data
  return <section className="profile-card space-y-3"><h2>Mezuniyet Doğrulaması</h2><StatusBadge status={data.status} />
    <p className="text-sm text-muted-foreground">{data.status === 'VERIFIED' ? 'Mezuniyet beyanın Kariyer Merkezi tarafından onaylandı.' : data.status === 'REJECTED' ? 'Bilgilerini gözden geçirip tekrar incelemeye gönderebilirsin.' : data.submitted ? 'Mezuniyet bilgilerin Kariyer Merkezi tarafından inceleniyor.' : 'Profil oluşturmak mezuniyet doğrulaması değildir. Eğitim bilgilerini tamamlayıp incelemeye gönder.'}</p>
    {data.rejectionReason && <p className="rounded-xl bg-pastel-peach p-3 text-sm">{data.rejectionReason}</p>}
    {data.submitted && <p className="text-xs text-muted-foreground">Gönderim: {reviewDate(data.submittedAt)}{data.reviewedAt && ` · İnceleme: ${reviewDate(data.reviewedAt)}`}</p>}
    {(!data.submitted || data.status === 'REJECTED') && <Dialog open={open} onOpenChange={value => { if (!submit.isPending) setOpen(value) }}><DialogTrigger asChild><Button variant="outline" disabled={!profileExists}>{data.status === 'REJECTED' ? 'Tekrar incelemeye gönder' : 'İncelemeye gönder'}</Button></DialogTrigger><DialogContent><DialogTitle>Mezuniyet bilgilerini gönder</DialogTitle><DialogDescription>Adın, soyadın, bölümün, mezuniyet yılın ve eğitim kayıtların yetkili Kariyer Merkezi personelinin incelemesine açılır. Bilgilerinin doğruluğunu kontrol et.</DialogDescription>
      <p className="my-4 text-sm">Eğitim veya kimlik bilgilerini değiştirmen yeni bir inceleme gerektirir. Kişisel iletişim bilgilerin bu başvuruya eklenmez.</p>
      {submit.isError && <p role="alert" className="mb-4">{reviewError(submit.error)}</p>}
      <div className="flex flex-wrap gap-2"><Button disabled={submit.isPending} onClick={() => { void submit.mutateAsync(etag).then(() => setOpen(false)).catch(() => {}) }}>{submit.isPending ? 'Gönderiliyor…' : 'Bilgilerim doğru, gönder'}</Button><Button variant="ghost" disabled={submit.isPending} onClick={() => setOpen(false)}>Vazgeç</Button>{submit.isError && <Button variant="outline" onClick={() => { setOpen(false); submit.reset(); void query.refetch() }}>Durumu yenile</Button>}</div>
    </DialogContent></Dialog>}
  </section>
}
