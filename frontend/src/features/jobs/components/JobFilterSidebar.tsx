import { Input } from '@/components/ui/input';

interface JobFilterSidebarProps {
  search: string;
  setSearch: (s: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  jobType: string;
  setJobType: (jt: string) => void;
  workModel: string;
  setWorkModel: (wm: string) => void;
}

export function JobFilterSidebar({ search, setSearch, location, setLocation, jobType, setJobType, workModel, setWorkModel }: JobFilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[#233A85] mb-4">Filtreler</h3>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="search" className="block text-sm font-medium">Arama</label>
        <Input 
          id="search"
          placeholder="Pozisyon veya şirket ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium">Konum</label>
        <Input 
          id="location"
          placeholder="örn. İstanbul, Ankara"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">İlan Türü</label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={jobType} 
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="ALL">Tüm Türler</option>
          <option value="FULL_TIME">Tam Zamanlı</option>
          <option value="PART_TIME">Yarı Zamanlı</option>
          <option value="INTERNSHIP">Staj</option>
          <option value="CONTRACT">Sözleşmeli</option>
          <option value="FREELANCE">Serbest (Freelance)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Çalışma Şekli</label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={workModel} 
          onChange={(e) => setWorkModel(e.target.value)}
        >
          <option value="ALL">Tüm Modeller</option>
          <option value="REMOTE">Uzaktan</option>
          <option value="HYBRID">Hibrit</option>
          <option value="ONSITE">Ofisten</option>
        </select>
      </div>
    </div>
  );
}
