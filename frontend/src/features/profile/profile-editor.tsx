import { useRef, useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ApiError } from '@/lib/api/client'
import { emptyProfile, useSaveProfile, type ProfileData, type ProfileSnapshot, type Career, type Education, type Certification } from './profile-api'

export type EditorSection = 'core' | 'about' | 'career' | 'education' | 'skills' | 'certifications' | 'contribution'
import { contributionLabels } from './profile-constants'
const sectionTitles: Record<EditorSection, string> = { core: 'Profili Düzenle', about: 'Hakkımda', career: 'Kariyer Deneyimi', education: 'Eğitim Bilgisi', skills: 'Yetenekler', certifications: 'Sertifika', contribution: 'BTÜ Topluluğuna Katkı' }
type FieldProps = { name: string; label: string; value: string | number | null | undefined; set: (value: string) => void; error?: string; required?: boolean; maxLength?: number; type?: 'text' | 'number' | 'date' | 'url' | 'textarea'; min?: number; max?: number }
function Field({ name, label, value, set, error, type = 'text', ...props }: FieldProps) {
  const common = { id: name, name, value: value ?? '', onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.value), 'aria-invalid': !!error, 'aria-describedby': error ? `${name}-error` : undefined, ...props }
  return <div className={`profile-field ${type === 'textarea' ? 'sm:col-span-2' : ''}`}><label htmlFor={name}>{label}{props.required && ' *'}</label>{type === 'textarea' ? <textarea {...common} /> : <input type={type} {...common} />}{error && <p id={`${name}-error`} className="profile-field-error">{error}</p>}</div>
}
function initialDraft(snapshot: ProfileSnapshot, section: EditorSection, index?: number): ProfileData {
  const copy = structuredClone(snapshot.profile.data ?? emptyProfile())
  if (index === undefined) {
    if (section === 'career') copy.career.push({ company: '', position: '', startDate: '', currentlyWorking: true })
    if (section === 'education') copy.education.push({ institution: '', department: '', degree: '', startYear: new Date().getFullYear() })
    if (section === 'certifications') copy.certifications.push({ name: '', issuer: '', year: new Date().getFullYear() })
  }
  return copy
}
export function ProfileEditor({ snapshot, section, index, close, saved, reload }: { snapshot: ProfileSnapshot; section: EditorSection; index?: number; close: () => void; saved: () => void; reload: () => void }) {
  const [baseEtag] = useState(snapshot.etag)
  const [draft, setDraft] = useState(() => initialDraft(snapshot, section, index))
  const [skill, setSkill] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [removing, setRemoving] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const mutation = useSaveProfile()
  const collection = section === 'career' || section === 'education' || section === 'certifications' ? section : undefined
  const itemIndex = collection ? index ?? draft[collection].length - 1 : 0
  const prefix = `${section}[${itemIndex}].`
  const set = (key: string, value: unknown) => setDraft(current => ({ ...current, [key]: value }))
  const changeItem = (key: string, value: unknown) => {
    if (!collection) return
    setDraft(current => ({ ...current, [collection]: current[collection].map((item, i) => i === itemIndex ? { ...item, [key]: value } : item) }))
  }
  const nested = (key: string) => ({ name: prefix + key, error: errors[prefix + key] })
  async function save(data: ProfileData) {
    setMessage(''); setErrors({})
    try { await mutation.mutateAsync({ data, etag: baseEtag }); saved() }
    catch (failure) {
      if (failure instanceof ApiError && failure.status === 412) { setMessage('Profil başka bir sekmede güncellendi. Güncel profili yükleyip değişikliklerini tekrar uygula.'); return }
      if (failure instanceof ApiError && failure.problem?.errors?.length) {
        const fields = Object.fromEntries(failure.problem.errors.map(e => [e.field, 'Bu değeri kontrol edin. Tarih, uzunluk ve biçim kurallarına uygun olmalı.']))
        setErrors(fields); setMessage('İşaretli alanları kontrol edip tekrar dene.')
        requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
        return
      }
      setMessage('Profil kaydedilemedi. Bağlantını kontrol edip tekrar dene.')
    }
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (mutation.isPending) return
    const invalid = Array.from(e.currentTarget.elements).filter((el): el is HTMLInputElement | HTMLTextAreaElement => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement).filter(el => !el.validity.valid)
    if (invalid.length) {
      setErrors(Object.fromEntries(invalid.map(el => [el.name, el.validity.valueMissing ? 'Bu alanı doldurun.' : 'Geçerli bir değer girin.'])))
      invalid[0]?.focus(); return
    }
    if (section === 'skills' && skill.trim()) { setErrors({ skills: 'Yazdığın yeteneği Ekle düğmesiyle ekle veya alanı temizle.' }); return }
    void save(draft)
  }
  function addSkill() {
    const value = skill.trim().replace(/\s+/g, ' ')
    const normalize = (v: string) => v.normalize('NFKC').toLowerCase()
    if (!value || value.length > 60 || /[<>]/.test(value)) { setErrors({ skills: '1–60 karakter arasında bir yetenek gir.' }); return }
    if (draft.skills.some(s => normalize(s) === normalize(value))) { setErrors({ skills: 'Bu yetenek zaten eklendi.' }); return }
    if (draft.skills.length >= 50) { setErrors({ skills: 'En fazla 50 yetenek ekleyebilirsin.' }); return }
    set('skills', [...draft.skills, value]); setSkill(''); setErrors({})
  }
  const basicField = (key: keyof ProfileData, label: string, maxLength: number, required = false) => <Field key={key} name={key} label={label} value={draft[key] as string | undefined} set={v => set(key, v)} maxLength={maxLength} required={required} error={errors[key]} />
  const career = collection === 'career' ? draft.career[itemIndex] : undefined
  const education = collection === 'education' ? draft.education[itemIndex] : undefined
  const certificate = collection === 'certifications' ? draft.certifications[itemIndex] : undefined
  const itemField = <T extends Career | Education | Certification,>(item: T, key: keyof T, label: string, maxLength = 150, required = false) => <Field key={String(key)} {...nested(String(key))} label={label} value={item[key] as string | undefined} set={v => changeItem(String(key), v)} maxLength={maxLength} required={required} />
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) close() }}><DialogContent className="max-w-2xl !p-6 sm:!p-8" onOpenAutoFocus={e => { e.preventDefault(); form.current?.querySelector<HTMLInputElement>('input, textarea')?.focus() }} onEscapeKeyDown={e => { if (mutation.isPending) e.preventDefault() }}>
    <DialogTitle>{sectionTitles[section]}</DialogTitle><DialogDescription>{section === 'core' ? 'Kişisel ve profesyonel bilgilerini güncelle. * Zorunlu alan.' : 'Bu bilgiler yalnızca kendi profilinde saklanır.'}</DialogDescription>
    <form ref={form} noValidate onSubmit={submit} className="mt-6" aria-busy={mutation.isPending}>
      <fieldset disabled={mutation.isPending} className="min-w-0 space-y-5">
        {section === 'core' && <div className="profile-editor-grid">{basicField('firstName', 'Ad', 100, true)}{basicField('lastName', 'Soyad', 100, true)}{basicField('department', 'Bölüm', 150)}<Field name="graduationYear" label="Mezuniyet yılı" type="number" min={1900} max={new Date().getFullYear() + 1} value={draft.graduationYear} set={v => set('graduationYear', v ? Number(v) : undefined)} error={errors.graduationYear} />{basicField('city', 'Şehir', 100)}{basicField('currentCompany', 'Güncel şirket', 150)}{basicField('currentPosition', 'Güncel pozisyon', 150)}{basicField('industry', 'Sektör', 100)}</div>}
        {section === 'about' && <><Field name="about" label="Hakkımda" type="textarea" maxLength={2000} value={draft.about} set={v => set('about', v)} error={errors.about} /><p className="text-xs text-muted-foreground">En fazla 2.000 karakter. Düz metin kullan; kişisel iletişim bilgilerini paylaşma.</p></>}
        {career && <div className="profile-editor-grid">{itemField(career, 'company', 'Şirket', 150, true)}{itemField(career, 'position', 'Pozisyon', 150, true)}{itemField(career, 'industry', 'Sektör', 100)}{itemField(career, 'city', 'Şehir', 100)}<Field {...nested('startDate')} label="Başlangıç tarihi" type="date" required value={career.startDate} set={v => changeItem('startDate', v)} /><div><label className="profile-toggle"><input type="checkbox" checked={!!career.currentlyWorking} onChange={e => set('career', draft.career.map((c, i) => i === itemIndex ? { ...c, currentlyWorking: e.target.checked, endDate: undefined } : c))} />Halen çalışıyorum</label>{career.currentlyWorking && errors[prefix + 'endDate'] && <p className="profile-field-error">{errors[prefix + 'endDate']}</p>}</div>{!career.currentlyWorking && <Field {...nested('endDate')} label="Bitiş tarihi" type="date" required value={career.endDate} set={v => changeItem('endDate', v)} />}<Field {...nested('description')} label="Deneyim açıklaması" type="textarea" maxLength={2000} value={career.description} set={v => changeItem('description', v)} /></div>}
        {education && <><p className="rounded-lg bg-pastel-mint p-3 text-sm">Kendi beyanın olarak kaydedilir; kurumsal mezuniyet doğrulaması değildir.</p><div className="profile-editor-grid">{itemField(education, 'institution', 'Kurum / üniversite', 150, true)}{itemField(education, 'department', 'Bölüm / program', 150, true)}{itemField(education, 'degree', 'Derece', 100, true)}<Field {...nested('startYear')} label="Başlangıç yılı" type="number" min={1900} max={new Date().getFullYear() + 1} required value={education.startYear} set={v => changeItem('startYear', v ? Number(v) : undefined)} /><Field {...nested('graduationYear')} label="Mezuniyet yılı" type="number" min={1900} max={new Date().getFullYear() + 1} value={education.graduationYear} set={v => changeItem('graduationYear', v ? Number(v) : undefined)} /></div></>}
        {section === 'skills' && <><div className="flex items-end gap-2"><div className="profile-field flex-1"><label htmlFor="new-skill">Yetenek ekle</label><input id="new-skill" value={skill} maxLength={60} onChange={e => setSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="Örn. Java" aria-describedby="skills-help" aria-invalid={!!errors.skills} /></div><Button variant="outline" type="button" onClick={addSkill}><Plus size={16} aria-hidden="true" />Ekle</Button></div><p id="skills-help" className="text-xs text-muted-foreground">Enter ile ekle. En fazla 50 yetenek; her biri 60 karakter.</p>{errors.skills && <p role="alert" className="profile-field-error">{errors.skills}</p>}<div className="flex flex-wrap gap-2">{draft.skills.map(value => <span className="profile-chip" key={value}>{value}<button type="button" className="inline-flex min-h-9 min-w-9 items-center justify-center rounded" aria-label={`${value} yeteneğini kaldır`} onClick={() => set('skills', draft.skills.filter(s => s !== value))}><X size={16} /></button></span>)}</div></>}
        {certificate && <div className="profile-editor-grid">{itemField(certificate, 'name', 'Sertifika adı', 150, true)}{itemField(certificate, 'issuer', 'Veren kurum', 150, true)}<Field {...nested('year')} label="Sertifika yılı" type="number" required min={1900} max={new Date().getFullYear()} value={certificate.year} set={v => changeItem('year', v ? Number(v) : undefined)} /><Field {...nested('credentialUrl')} label="Sertifika bağlantısı (isteğe bağlı)" type="url" maxLength={2048} value={certificate.credentialUrl} set={v => changeItem('credentialUrl', v)} /></div>}
        {section === 'contribution' && <><p className="text-sm text-muted-foreground">Bunlar ilgi tercihlerindir. Mentörlük veya diğer programlara kayıt oluşturmaz ve profil tamamlama puanını etkilemez.</p>{Object.entries(contributionLabels).map(([key, label]) => <label key={key} className="profile-toggle"><input type="checkbox" checked={!!draft.contribution[key as keyof typeof contributionLabels]} onChange={e => set('contribution', { ...draft.contribution, [key]: e.target.checked })} />{label}</label>)}</>}
        {message && <div className="rounded-lg bg-pastel-peach p-3"><p role="alert" className="text-sm text-destructive">{message}</p>{mutation.error instanceof ApiError && mutation.error.status === 412 && <Button variant="outline" type="button" className="mt-2" onClick={reload}>Güncel profili yükle</Button>}</div>}
        {Object.entries(errors).some(([key]) => key.endsWith('.id') || key.startsWith('skills[')) && <p role="alert" className="profile-field-error">Kayıt referansını veya yinelenen yetenekleri kontrol edin. Gerekirse güncel profili yeniden yükleyin.</p>}
        {removing ? <div className="rounded-lg bg-pastel-peach p-4"><p className="text-sm">Bu kayıt profilinden kaldırılacak.</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" onClick={() => { if (collection) void save({ ...draft, [collection]: draft[collection].filter((_, i) => i !== itemIndex) }) }}>Kaydı kaldır</Button><Button variant="ghost" type="button" onClick={() => setRemoving(false)}>Vazgeç</Button></div></div> : <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-5">{index !== undefined && collection && <Button type="button" variant="ghost" className="mr-auto text-destructive" onClick={() => setRemoving(true)}>Kaydı sil</Button>}<Button type="button" variant="outline" onClick={close}>Vazgeç</Button><Button type="submit">{mutation.isPending ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}</Button></div>}
      </fieldset>
    </form>
  </DialogContent></Dialog>
}
