interface JobFilterSidebarProps {
  location: string;
  setLocation: (loc: string) => void;
  workModel: string;
  setWorkModel: (wm: string) => void;
}

export function JobFilterSidebar({ location, setLocation, workModel, setWorkModel }: JobFilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[#233A85] mb-4">Filtreler</h3>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium">Konum</label>
        <input 
          id="location"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="örn. İstanbul, Ankara"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Çalışma Şekli</label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
