import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobPost } from '../api/jobs';
import type { JobPostRequest } from '../api/jobs';

export function PostJobModal() {
  const [open, setOpen] = useState(false);
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form as any);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#233A85] hover:bg-[#1a2b63] text-white">İlan Ekle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
          <DialogTitle className="text-[#233A85]">Yeni İlan Ekle</DialogTitle>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">İlan Başlığı</label>
            <Input id="title" required minLength={3} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="company" className="block text-sm font-medium">Şirket</label>
              <Input id="company" required minLength={2} value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label htmlFor="jobType" className="block text-sm font-medium">İlan Türü</label>
              <select 
                id="jobType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}
              >
                <option value="FULL_TIME">Tam Zamanlı</option>
                <option value="PART_TIME">Yarı Zamanlı</option>
                <option value="INTERNSHIP">Staj</option>
                <option value="CONTRACT">Sözleşmeli</option>
                <option value="FREELANCE">Serbest (Freelance)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="workModel" className="block text-sm font-medium">Çalışma Şekli</label>
              <select 
                id="workModel"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.workModel} onChange={e => setForm({...form, workModel: e.target.value})}
              >
                <option value="REMOTE">Uzaktan</option>
                <option value="HYBRID">Hibrit</option>
                <option value="ONSITE">Ofisten</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium">Konum (İsteğe Bağlı)</label>
            <Input id="location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="örn. İstanbul" />
          </div>

          <div className="space-y-2">
            <label htmlFor="applicationUrl" className="block text-sm font-medium">Başvuru Linki</label>
            <Input id="applicationUrl" type="url" required value={form.applicationUrl} onChange={e => setForm({...form, applicationUrl: e.target.value})} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">İlan Detayı</label>
            <textarea 
              id="description" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={4} 
              required
              minLength={20}
              placeholder="Rolü, gereksinimleri vb. açıklayın."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending} className="bg-[#233A85] text-white hover:bg-[#1a2b63]">
              {mutation.isPending ? 'Ekleniyor...' : 'İlan Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
