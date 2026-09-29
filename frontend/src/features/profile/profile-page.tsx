import { useEffect, useState, type ReactNode } from 'react'
import { Award, BriefcaseBusiness, Check, GraduationCap, MapPin, Pencil, Plus, ShieldCheck } from 'lucide-react'
import { VerificationCard } from '@/features/privacy-verification/verification-card'
import { Button } from '@/components/ui/button'
import { useProfile } from './profile-api'
import { contributionLabels } from './profile-constants'
import { ProfileEditor, type EditorSection } from './profile-editor'

function Card({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="profile-card"><div className="profile-card-title"><h2>{title}</h2>{action}</div>{children}</section>
}
function Empty({ children }: { children: ReactNode }) { return <p className="profile-empty">{children}</p> }
function date(value: string) { return new Intl.DateTimeFormat('tr-TR', { month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) }
export function ProfilePage() {
  const query = useProfile()
  const [editor, setEditor] = useState<{ section: EditorSection; index?: number } | null>(null)
  const [toast, setToast] = useState(false)
  const [restoreFocus, setRestoreFocus] = useState<HTMLElement | null>(null)
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(false), 4000); return () => clearTimeout(timer) }, [toast])
  function open(section: EditorSection, index?: number) { setRestoreFocus(document.activeElement as HTMLElement); setEditor({ section, index }) }
  function close() { setEditor(null); requestAnimationFrame(() => restoreFocus?.focus()) }
  if (query.isPending) return <div role="status" aria-label="Profil yükleniyor" className="space-y-5"><h1 className="text-2xl">Profilim</h1><p>Profil yükleniyor…</p><div className="profile-grid animate-pulse"><div className="h-80 rounded-2xl bg-pastel-blue/50" /><div className="h-96 rounded-2xl bg-slate-100" /></div></div>
  if (query.isError) return <section className="profile-card"><h1 className="text-2xl">Profil yüklenemedi</h1><p role="alert" className="my-4">Bağlantını kontrol edip tekrar dene. Kayıtlı bilgilerin değiştirilmedi.</p><Button onClick={() => void query.refetch()}>Tekrar dene</Button></section>
  const snapshot = query.data
  const p = snapshot.profile.data
  const existing = !!snapshot.profile.exists && !!p
  const initials = p ? `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toLocaleUpperCase('tr') : 'BTÜ'
  const edit = (section: EditorSection, label: string, adding = false) => <Button variant="ghost" disabled={!existing} onClick={() => open(section)} aria-label={label}>{adding ? <Plus size={15} aria-hidden="true" /> : <Pencil size={14} aria-hidden="true" />}{adding ? label : 'Düzenle'}</Button>
  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl">Profilim</h1><span className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15} aria-hidden="true" />İletişim bilgilerin gizli</span></div>
    {!existing && <section className="mb-5 rounded-2xl bg-pastel-blue p-5"><h2>Profilini tamamla</h2><p className="mt-1 text-sm text-muted-foreground">Önce adını ve soyadını ekle; ardından kariyer yolculuğunu, eğitimini ve yeteneklerini paylaş.</p></section>}
    <div className="profile-grid">
      <div className="profile-column">
        <section className="profile-card text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-pastel-blue text-2xl font-semibold text-primary">{initials}</div>
          <h2 className="mt-4 !text-xl">{p ? `${p.firstName} ${p.lastName}` : 'Kariyer profilin'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{p?.currentPosition || 'Pozisyon bilgisi eklenmedi'}</p>
          {p?.currentCompany && <p className="mt-1 text-sm text-muted-foreground">{p.currentCompany}</p>}
          {(p?.department || p?.graduationYear) && <p className="mt-3 flex items-center justify-center gap-2 text-sm"><GraduationCap size={16} aria-hidden="true" />{[p.department, p.graduationYear].filter(Boolean).join(' · ')}</p>}
          {p?.city && <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground"><MapPin size={14} aria-hidden="true" />{p.city}</p>}
          <div className="my-5 rounded-xl bg-pastel-mint p-3"><p className="text-xs text-muted-foreground">Profil Tamamlanma</p><progress aria-label="Profil tamamlanma" className="my-2 h-1.5 w-full overflow-hidden rounded-full accent-primary" value={snapshot.profile.completionPercentage ?? 0} max={100} /><p className="text-xs font-semibold text-primary">%{snapshot.profile.completionPercentage ?? 0}</p></div>
          <Button className="w-full" onClick={() => open('core')}><Pencil size={16} aria-hidden="true" />Profili Düzenle</Button>
        </section>
        <section className="profile-card !bg-pastel-lavender"><div className="profile-card-title"><h2>BTÜ Topluluğuna Katkı</h2>{edit('contribution', 'Katkı tercihlerini düzenle')}</div><p className="mb-4 text-sm text-muted-foreground">Topluma katkı sağlamak istediğin alanlar.</p><ul className="space-y-4">{Object.entries(contributionLabels).map(([key, label]) => <li key={key} className="flex items-start gap-2 text-sm"><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${p?.contribution[key as keyof typeof contributionLabels] ? 'bg-primary text-white' : 'border border-slate-400'}`} aria-hidden="true">{p?.contribution[key as keyof typeof contributionLabels] && <Check size={13} />}</span><span>{label}<span className="sr-only">: {p?.contribution[key as keyof typeof contributionLabels] ? 'Seçili' : 'Seçili değil'}</span></span></li>)}</ul><p className="mt-5 text-xs text-muted-foreground">Tercihler programlara kayıt oluşturmaz.</p></section>
        <p className="px-2 text-xs text-muted-foreground">Tamamlama: temel bilgiler, hakkımda, kariyer, eğitim ve yetenekler. Her bölüm %20; katkı tercihleri ve sertifikalar isteğe bağlıdır.</p>
      </div>
      <div className="profile-column">
        <VerificationCard profileExists={existing} />
        <Card title="Hakkımda" action={edit('about', 'Hakkımda düzenle')}>{p?.about ? <p className="profile-description">{p.about}</p> : <Empty>Kendini ve kariyer hedeflerini birkaç cümleyle anlat.</Empty>}</Card>
        <Card title="Kariyer Yolculuğu" action={edit('career', 'Deneyim Ekle', true)}>{p?.career.length ? <ol className="profile-timeline">{p.career.map((c, i) => <li key={c.id ?? i}><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-muted-foreground">{date(c.startDate)} – {c.currentlyWorking ? 'Günümüz' : c.endDate ? date(c.endDate) : ''}</p><h3 className="mt-1 text-base font-semibold">{c.position}</h3><p className="text-sm">{c.company}</p></div><Button variant="ghost" aria-label={`${c.position} deneyimini düzenle`} onClick={() => open('career', i)}><Pencil size={15} /></Button></div>{(c.city || c.industry) && <p className="mt-1 text-xs text-muted-foreground">{[c.city, c.industry].filter(Boolean).join(' · ')}</p>}{c.description && <p className="profile-description mt-2">{c.description}</p>}</li>)}</ol> : <Empty>İlk iş veya staj deneyimini ekleyerek yolculuğunu başlat.</Empty>}</Card>
        <Card title="Eğitim" action={edit('education', 'Eğitim Ekle', true)}>{p?.education.length ? <ul className="space-y-5">{p.education.map((e, i) => <li key={e.id ?? i} className="flex items-start gap-3"><span className="rounded-xl bg-pastel-mint p-3 text-primary"><GraduationCap size={22} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold">{e.institution}</h3><p className="text-sm">{e.department}</p><p className="text-xs text-muted-foreground">{e.degree} · {e.startYear} – {e.graduationYear ?? 'Devam ediyor'}</p><p className="mt-1 text-xs text-muted-foreground">Kullanıcı beyanı</p></div><Button variant="ghost" aria-label={`${e.institution} eğitimini düzenle`} onClick={() => open('education', i)}><Pencil size={15} /></Button></li>)}</ul> : <Empty>Eğitim bilgilerin henüz eklenmedi. Eklediğin kayıtlar kurumsal doğrulama sayılmaz.</Empty>}</Card>
        <Card title="Yetenekler" action={edit('skills', 'Yetenekleri düzenle')}>{p?.skills.length ? <div className="flex flex-wrap gap-2">{p.skills.map(s => <span key={s} className="profile-chip">{s}</span>)}</div> : <Empty>Uzmanlık alanlarını yetenek etiketleriyle belirt.</Empty>}</Card>
        <Card title="Sertifikalar" action={edit('certifications', 'Sertifika Ekle', true)}>{p?.certifications.length ? <ul className="space-y-4">{p.certifications.map((c, i) => <li key={c.id ?? i} className="flex items-start gap-3"><span className="rounded-xl bg-pastel-peach p-3 text-primary"><Award size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold">{c.name}</h3><p className="text-xs text-muted-foreground">{c.issuer} · {c.year}</p>{c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="mt-1 inline-block text-sm text-primary underline">Sertifikayı görüntüle<span className="sr-only"> (yeni sekme)</span></a>}</div><Button variant="ghost" aria-label={`${c.name} sertifikasını düzenle`} onClick={() => open('certifications', i)}><Pencil size={15} /></Button></li>)}</ul> : <Empty>Sertifika ve başarı belgelerini ayrı kayıtlar olarak ekle.</Empty>}</Card>
        {!existing && <p className="flex items-center gap-2 text-sm text-muted-foreground"><BriefcaseBusiness size={17} aria-hidden="true" />Diğer bölümleri düzenlemek için önce profilini oluştur.</p>}
      </div>
    </div>
    {editor && <ProfileEditor snapshot={snapshot} section={editor.section} index={editor.index} close={close} saved={() => { close(); setToast(true) }} reload={() => { close(); void query.refetch() }} />}
    {toast && <div role="status" className="fixed bottom-5 left-5 right-5 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-primary/20 bg-pastel-mint px-5 py-4 text-sm text-primary shadow-lg"><Check size={20} aria-hidden="true" />Profilin başarıyla güncellendi.</div>}
  </>
}
