import { Save, Bell, Moon, Sidebar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PreferencesView() {
  const handleSave = () => {
    toast.success('App preferences updated');
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="border-b px-8 py-5" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>App Preferences</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Customize your dashboard experience.</p>
      </div>
      
      <div className="p-8 space-y-6">
        
        {/* Preference Item */}
        <div className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-[var(--color-bg-surface-hover)] cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[var(--accent-bg-strong)] text-[var(--accent)]">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Email Notifications</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Receive daily asset digests.</p>
            </div>
          </div>
          <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ background: 'var(--accent)' }}>
            <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm"></div>
          </div>
        </div>

        {/* Preference Item */}
        <div className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-[var(--color-bg-surface-hover)] cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[var(--accent-bg-strong)] text-[var(--accent)]">
              <Sidebar size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Collapsed Sidebar</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Default to a mini navigation rail.</p>
            </div>
          </div>
          <div className="w-12 h-6 rounded-full relative cursor-pointer bg-gray-500/30">
            <div className="w-4 h-4 rounded-full bg-white absolute top-1 left-1 shadow-sm"></div>
          </div>
        </div>

      </div>

      <div className="px-8 py-5 border-t flex justify-end bg-[var(--color-bg-base)]" style={{ borderColor: 'var(--color-border)' }}>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 shadow-md flex-wrap" 
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  );
}
