import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrivacy, useSavePrivacy, reviewError, type Privacy, type Snapshot } from './queries'
import { Toast } from './shared'

function PrivacyForm({ initial, reload, saved }: { initial: Snapshot<Privacy>; reload: () => void; saved: () => void }) {
  const [optIn, setOptIn] = useState(initial.data.directoryOptIn)
  const [visibility, setVisibility] = useState(initial.data.profileVisibility)
  const [baseEtag] = useState(initial.etag)
  const mutation = useSavePrivacy()
  async function submit(event: FormEvent) {
    event.preventDefault()
    try { await mutation.mutateAsync({ body: { directoryOptIn: optIn, profileVisibility: visibility }, etag: baseEtag }); saved() } catch { /* Render the safe error below; preserve unsaved preferences. */ }
  }
  return <form onSubmit={submit} aria-busy={mutation.isPending}>
    <fieldset disabled={mutation.isPending || !initial.data.profileExists} className="space-y-5">
      <section className="profile-card space-y-4"><h2 className="flex items-center gap-2"><ShieldCheck size={19} aria-hidden="true" />Mezun Ağı Görünürlüğü</h2>
        <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl bg-pastel-lavender p-4"><span>Mezunlar Ağı'nda görünmek istiyorum.</span><input type="checkbox" role="switch" checked={optIn} onChange={e => setOptIn(e.target.checked)} className="peer sr-only" /><span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary" /></label>
        <p className="text-sm text-muted-foreground">Mezunlar Ağı henüz kullanıma açılmadı. Bu tercih gelecekteki katılımın için saklanır. Ağ açıldığında keşfedilebilmek için bu seçenek, BTÜ Mezunları görünürlüğü ve mezuniyet doğrulaması birlikte gereklidir.</p>
      </section>
      <section className="profile-card space-y-3"><h2>Profil görünürlüğü</h2><p className="text-sm text-muted-foreground">Profilini kimlerin görebileceğini seç.</p>
        {([['PRIVATE', 'Yalnızca Ben'], ['ALUMNI_MEMBERS', 'BTÜ Mezunları']] as const).map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl p-4 ${visibility === value ? 'bg-pastel-blue' : 'border'}`}><input type="radio" name="visibility" value={value} checked={visibility === value} onChange={() => setVisibility(value)} className="size-4 accent-primary" />{label}</label>)}
        <p className="text-xs text-muted-foreground">“Yalnızca Ben” seçiliyken ağa katılma tercihin açık olsa da diğer mezunlar profilini göremez. Yetkili Kariyer Merkezi personeli, gönderdiğin doğrulama bilgilerini inceleyebilir; bu erişim kaydedilir.</p>
      </section>
      <Button type="submit">{mutation.isPending ? 'Kaydediliyor…' : 'Tercihleri Kaydet'}</Button>
    </fieldset>
    {mutation.isError && <div className="mt-4 space-y-2"><p role="alert">{reviewError(mutation.error)}</p><Button variant="outline" onClick={reload}>Güncel tercihleri yükle</Button></div>}
  </form>
}
export function PrivacyPage() {
  const query = usePrivacy()
  const [toast, setToast] = useState(false)
  const [formVersion, setFormVersion] = useState(0)
  const clear = useCallback(() => setToast(false), [])
  if (query.isPending) return <p role="status">Gizlilik tercihlerin yükleniyor…</p>
  if (query.isError) return <section className="profile-card"><h1>Gizlilik Ayarları</h1><p role="alert" className="my-4">Tercihler yüklenemedi.</p><Button onClick={() => void query.refetch()}>Tekrar dene</Button></section>
  return <div className="max-w-2xl space-y-5"><div><h1 className="text-2xl">Gizlilik Ayarları</h1><p className="mt-2 text-muted-foreground">Görünürlüğün senin kontrolünde.</p></div>
    {!query.data.data.profileExists && <p className="rounded-xl bg-pastel-blue p-4">Tercihlerini kaydetmek için önce <Link to="/app/profile" className="underline">profilini oluştur</Link>. Şu anda görünürlüğün kapalı.</p>}
    <PrivacyForm key={formVersion} initial={query.data} reload={() => { void query.refetch().then(result => { if (result.isSuccess) setFormVersion(v => v + 1) }) }} saved={() => { setToast(true); setFormVersion(v => v + 1) }} />
    <section className="profile-card !bg-pastel-mint"><h2 className="flex items-center gap-2"><LockKeyhole size={18} aria-hidden="true" />İletişim bilgilerin gizli</h2><p className="mt-3 text-sm">Kişisel e-posta, telefon ve ayrıntılı iletişim bilgileri diğer mezunlara, işverenlere veya ziyaretçilere açılmaz. Giriş e-postan profil iletişim bilgisi olarak paylaşılmaz.</p></section>
    {toast && <Toast message="Gizlilik tercihlerin güncellendi." clear={clear} />}
  </div>
}
