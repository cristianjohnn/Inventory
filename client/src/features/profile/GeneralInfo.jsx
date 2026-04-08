import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GeneralInfo() {
  const handleSave = () => {
    toast.success('General information saved');
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="border-b px-8 py-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>General Information</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Update your directory details here.</p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-tertiary)' }}>First Name</label>
            <input type="text" className="filter-input w-full !px-4 !py-3 rounded-xl focus:ring-2 focus:ring-[var(--accent)] transition-all" defaultValue="Admin" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-tertiary)' }}>Last Name</label>
            <input type="text" className="filter-input w-full !px-4 !py-3 rounded-xl focus:ring-2 focus:ring-[var(--accent)] transition-all" defaultValue="User" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-tertiary)' }}>Email Address</label>
          <input type="email" className="filter-input w-full !px-4 !py-3 rounded-xl opacity-70 cursor-not-allowed" defaultValue="admin@inspireholdings.ph" disabled />
          <p className="text-xs ml-1" style={{ color: 'var(--color-text-tertiary)' }}>Email changes require IT Desk approval.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-tertiary)' }}>Department</label>
          <select className="filter-input w-full !px-4 !py-3 rounded-xl focus:ring-2 focus:ring-[var(--accent)] transition-all cursor-pointer">
            <option>Information Technology</option>
            <option>Human Resources</option>
            <option>Operations</option>
          </select>
        </div>
      </div>

      <div className="px-8 py-5 border-t flex justify-end" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
        <button 
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md flex-wrap w-full md:w-auto" 
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Save size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
}
