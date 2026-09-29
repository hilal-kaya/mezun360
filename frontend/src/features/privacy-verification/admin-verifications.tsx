import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useDecision, useReview, useVerificationQueue, reviewError, type Status, type Snapshot, type Review } from './queries'
import { StatusBadge, Toast } from './shared'
import { reviewDate, statusLabels } from './display'

function ReviewActions({ snapshot, saved, reload }: { snapshot: Snapshot<Review>; saved: () => void; reload: () => void }) {
  const mutation = useDecision(snapshot.data.id)
  const [decision, setDecision] = useState<'VERIFIED' | 'REJECTED' | null>(null)
  const [reason, setReason] = useState('')
  const [baseEtag] = useState(snapshot.etag)
  const r = snapshot.data
  if (!r.current) return <p className="rounded-xl bg-pastel-peach p-3">Bu başvurudan sonra mezuniyet bilgileri değişti. Eski bilgiler üzerinden karar verilemez.</p>
  if (r.status !== 'PENDING') return <p className="text-sm">Bu başvuru sonuçlandırılmıştır.</p>
  return <div className="mt-5 space-y-4">
    {!decision ? <div className="flex gap-3"><Button onClick={() => setDecision('VERIFIED')}>Doğrula</Button><Button variant="outline" onClick={() => setDecision('REJECTED')}>Reddet</Button></div> : <form onSubmit={e => { e.preventDefault(); void mutation.mutateAsync({ body: { status: decision, ...(decision === 'REJECTED' ? { rejectionReason: reason.trim() } : {}) }, etag: baseEtag }).then(saved).catch(() => {}) }}>
      <fieldset disabled={mutation.isPending} className="space-y-4"><legend className="mb-3 font-semibold">{decision === 'VERIFIED' ? 'Mezuniyeti doğrulamayı onaylıyor musun?' : 'Ret kararını onaylıyor musun?'}</legend>
        {decision === 'REJECTED' && <label className="block text-sm">Mezuna gösterilecek açıklama<textarea className="mt-2 min-h-28 w-full rounded-lg border p-3" required minLength={10} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /><span className="text-xs text-muted-foreground">10–500 karakter; yalnızca düz metin. Özel kurum içi not veya iletişim bilgisi yazma.</span></label>}
        <div className="flex flex-wrap gap-2"><Button type="submit">{mutation.isPending ? 'Kaydediliyor…' : decision === 'VERIFIED' ? 'Evet, doğrula' : 'Evet, reddet'}</Button><Button variant="ghost" onClick={() => { setDecision(null); mutation.reset() }}>Vazgeç</Button></div>
      </fieldset>
    </form>}
    {mutation.isError && <div><p role="alert">{reviewError(mutation.error)}</p><Button variant="outline" onClick={reload}>Güncel kaydı yükle</Button></div>}
  </div>
}
function ReviewContent({ id, saved }: { id: string; saved: () => void }) {
  const query = useReview(id)
  const [version, setVersion] = useState(0)
  if (query.isPending) return <p role="status">Başvuru yükleniyor…</p>
  if (query.isError) return <><p role="alert">Başvuru yüklenemedi.</p><Button onClick={() => void query.refetch()}>Tekrar dene</Button></>
  const r = query.data.data
  return <div className="mt-5 space-y-4"><StatusBadge status={r.status} /><h3 className="text-lg font-semibold">{r.evidence.firstName} {r.evidence.lastName}</h3><p>{r.evidence.department} · {r.evidence.graduationYear}</p><p className="text-sm text-muted-foreground">Gönderim: {reviewDate(r.submittedAt)}</p>
    <h4 className="font-semibold">Beyan edilen eğitim</h4><ul className="space-y-3">{r.evidence.education.map((e, i) => <li key={i} className="rounded-xl bg-pastel-lavender p-3 text-sm"><p className="font-semibold">{e.institution}</p><p>{e.department} · {e.degree}</p><p>{e.startYear} – {e.graduationYear ?? 'Devam ediyor'}</p></li>)}</ul>
    {r.rejectionReason && <p className="rounded-xl bg-pastel-peach p-3">{r.rejectionReason}</p>}
    <ReviewActions key={version} snapshot={query.data} saved={saved} reload={() => { void query.refetch().then(result => { if (result.isSuccess) setVersion(v => v + 1) }) }} />
  </div>
}
export function AdminVerificationsPage() {
  const [status, setStatus] = useState<Status>('PENDING')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [focus, setFocus] = useState<HTMLElement | null>(null)
  const [toast, setToast] = useState(false)
  const clear = useCallback(() => setToast(false), [])
  const queue = useVerificationQueue(status, page)
  function close() { setSelected(null); requestAnimationFrame(() => focus?.focus()) }
  return <div className="space-y-6"><Link to="/admin" className="text-sm text-primary underline">Yönetim alanına dön</Link><div><h1 className="text-3xl">Mezuniyet Doğrulamaları</h1><p className="mt-2 text-muted-foreground">Gönderilen mezuniyet beyanlarını incele ve kararını kaydet.</p></div>
    <p className="rounded-xl bg-pastel-mint p-4 text-sm">Bu alandaki özel bilgilere erişimin ve verdiğin kararlar kaydedilir. Yalnızca doğrulama için gerekli bilgiler gösterilir.</p>
    <label className="block max-w-sm text-sm font-semibold">Başvuru durumu<select className="mt-2 block w-full rounded-lg border bg-white p-3" value={status} onChange={e => { setStatus(e.target.value as Status); setPage(0) }}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {queue.isPending ? <p role="status">Başvurular yükleniyor…</p> : queue.isError ? <div><p role="alert">Başvurular yüklenemedi.</p><Button onClick={() => void queue.refetch()}>Tekrar dene</Button></div> : <>
      <p className="text-sm text-muted-foreground">{queue.data.totalElements} başvuru</p>
      {!queue.data.items.length ? <p className="rounded-xl border bg-white p-8">Bu durumda başvuru bulunmuyor.</p> : <ul className="divide-y overflow-hidden rounded-2xl border bg-white">{queue.data.items.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="min-w-0 flex-1"><p className="break-words font-semibold">{item.firstName} {item.lastName}</p><p className="mt-1 break-words text-sm text-muted-foreground">{item.department} · {item.graduationYear} · {reviewDate(item.submittedAt)}</p></div><StatusBadge status={item.status ?? 'PENDING'} /><Button variant="outline" onClick={() => { setFocus(document.activeElement as HTMLElement); setSelected(item.id!) }}>İncele<span className="sr-only">: {item.firstName} {item.lastName}</span></Button></li>)}</ul>}
      <nav aria-label="Başvuru sayfaları" className="flex items-center gap-3"><Button variant="ghost" disabled={page === 0} onClick={() => setPage(v => v - 1)}>Önceki</Button><span className="text-sm">Sayfa {page + 1}</span><Button variant="ghost" disabled={(page + 1) * queue.data.size >= queue.data.totalElements} onClick={() => setPage(v => v + 1)}>Sonraki</Button></nav>
    </>}
    <Dialog open={!!selected} onOpenChange={value => { if (!value) close() }}><DialogContent className="max-w-xl"><DialogTitle>Mezuniyet başvurusunu incele</DialogTitle><DialogDescription>Kararın, başvuru anında gönderilen aşağıdaki bilgilere bağlıdır.</DialogDescription>{selected && <ReviewContent key={selected} id={selected} saved={() => { close(); setToast(true) }} />}</DialogContent></Dialog>
    {toast && <Toast message="Doğrulama kararı kaydedildi." clear={clear} />}
  </div>
}
