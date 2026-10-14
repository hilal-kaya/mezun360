import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobPost } from '../api/jobs';
import type { JobPostRequest } from '../api/jobs';

export function PostJobModal() {
  const [open, setOpen] = useState(false);
  const [urlError, setUrlError] = useState('');
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    title: '',
    company: '',
    jobType: 'FULL_TIME',
    workModel: 'REMOTE',
    location: '',
    applicationUrl: '',
    description: ''
  });

  const mutation = useMutation({
    mutationFn: (data: JobPostRequest) => createJobPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setOpen(false);
      setUrlError('');
      setForm({
        title: '',
        company: '',
        jobType: 'FULL_TIME',
        workModel: 'REMOTE',
        location: '',
        applicationUrl: '',
        description: ''
      });
    }
  });

  const errorObj = mutation.error as any;
  let errorMsg = errorObj?.problem?.detail || errorObj?.message;
  if (errorObj?.status === 403 || errorMsg?.includes('VERIFIED') || errorMsg?.includes('doğrulanmış')) {
    errorMsg = 'Yalnızca mezuniyeti onaylanmış (VERIFIED) mezunlar yeni iş veya staj ilanı ekleyebilir.';
  } else if (errorObj?.status === 400 || errorObj?.problem?.code === 'VALIDATION_FAILED') {
    errorMsg = 'Lütfen formdaki tüm zorunlu alanları ve geçerli bir başvuru bağlantısını (https://...) eksiksiz doldurun.';
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicationUrl.startsWith('http://') && !form.applicationUrl.startsWith('https://')) {
      setUrlError('Başvuru linki http:// veya https:// ile başlamalıdır.');
      return;
    }
    setUrlError('');
    mutation.mutate(form as any);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setUrlError(''); }}>
      <DialogTrigger asChild>
        <Button className="bg-[#233A85] hover:bg-[#1a2b63] text-white rounded-xl shadow-sm font-semibold">
          + İlan Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-[#233A85]">Yeni İlan Ekle</DialogTitle>
        
        {mutation.isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-destructive font-medium space-y-1">
            <p>{errorMsg || 'İlan eklenirken bir hata oluştu.'}</p>
            {errorObj?.status === 403 && (
              <Link to="/app/profile" className="inline-block font-semibold text-primary underline">
                Profil Doğrulama Durumunu İncele →
              </Link>
            )}
          </div>
        )}

        {urlError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-destructive font-medium">
            {urlError}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-5 py-2">
          {/* Section 1: Temel Bilgiler */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Temel Bilgiler</h3>
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-xs font-semibold text-slate-700">
                İlan Başlığı <span className="text-destructive">*</span>
              </label>
              <Input 
                id="title" 
                required 
                minLength={3} 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                disabled={mutation.isPending} 
                placeholder="örn. Yazılım Mühendisi veya Stajyer"
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company" className="block text-xs font-semibold text-slate-700">
                Şirket / Kurum Adı <span className="text-destructive">*</span>
              </label>
              <Input 
                id="company" 
                required 
                minLength={2} 
                value={form.company} 
                onChange={e => setForm({...form, company: e.target.value})} 
                disabled={mutation.isPending}
                placeholder="örn. Bursa Teknik Üniversitesi veya Şirket A.Ş."
                className="rounded-xl h-10"
              />
            </div>
          </div>

          {/* Section 2: Çalışma Koşulları */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Çalışma Koşulları</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="jobType" className="block text-xs font-semibold text-slate-700">
                  İlan Türü <span className="text-destructive">*</span>
                </label>
                <select 
                  id="jobType"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={form.jobType} 
                  onChange={e => setForm({...form, jobType: e.target.value})}
                  disabled={mutation.isPending}
                >
                  <option value="FULL_TIME">Tam Zamanlı</option>
                  <option value="PART_TIME">Yarı Zamanlı</option>
                  <option value="INTERNSHIP">Staj</option>
                  <option value="CONTRACT">Sözleşmeli</option>
                  <option value="FREELANCE">Serbest (Freelance)</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="workModel" className="block text-xs font-semibold text-slate-700">
                  Çalışma Modeli <span className="text-destructive">*</span>
                </label>
                <select 
                  id="workModel"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={form.workModel} 
                  onChange={e => setForm({...form, workModel: e.target.value})}
                  disabled={mutation.isPending}
                >
                  <option value="REMOTE">Uzaktan (Remote)</option>
                  <option value="HYBRID">Hibrit</option>
                  <option value="ONSITE">Ofisten</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-semibold text-slate-700">
                Konum / Şehir <span className="text-muted-foreground font-normal">(İsteğe Bağlı)</span>
              </label>
              <Input 
                id="location" 
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                disabled={mutation.isPending}
                placeholder="örn. Bursa, İstanbul veya Tüm Türkiye" 
                className="rounded-xl h-10"
              />
            </div>
          </div>

          {/* Section 3: Başvuru ve Detaylar */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Başvuru & Detaylar</h3>
            <div className="space-y-1.5">
              <label htmlFor="applicationUrl" className="block text-xs font-semibold text-slate-700">
                Başvuru Linki <span className="text-destructive">*</span>
              </label>
              <Input 
                id="applicationUrl" 
                type="url" 
                required 
                value={form.applicationUrl} 
                onChange={e => setForm({...form, applicationUrl: e.target.value})} 
                disabled={mutation.isPending}
                placeholder="https://sirketiniz.com/kariyer/ilan" 
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
                  İlan Detayı & Gereksinimler <span className="text-destructive">*</span>
                </label>
                <span className={`text-[10px] font-medium ${form.description.trim().length >= 20 ? 'text-green-600' : 'text-slate-400'}`}>
                  {form.description.trim().length}/20 min
                </span>
              </div>
              <textarea 
                id="description" 
                className="flex min-h-[90px] w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})}
                rows={4} 
                required
                minLength={20}
                disabled={mutation.isPending}
                placeholder="Pozisyonun sorumluluklarını, aranan yetkinlikleri ve çalışma imkanlarını açıklayın."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending} className="rounded-xl">
              Vazgeç
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white hover:bg-primary/90 rounded-xl font-semibold shadow-sm px-6">
              {mutation.isPending ? 'İlan Ekleniyor...' : 'İlanı Yayınla'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
