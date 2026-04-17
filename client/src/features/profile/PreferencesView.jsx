import { useState, useEffect } from 'react';
import { Save, Bell, Sidebar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { usersApi } from '../../api/client.js';

export default function PreferencesView() {
  const { user, updateUser } = useAuth();
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    collapsedSidebar: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPrefs({
        emailNotifications: user.preferences.emailNotifications ?? true,
        collapsedSidebar: user.preferences.collapsedSidebar ?? false,
      });
    }
  }, [user]);

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await usersApi.updatePreferences(prefs);
      updateUser({ preferences: result.data.preferences });
      toast.success('App preferences updated');
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ checked, onClick }) => (
    <div
      onClick={onClick}
      className="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
      style={{ background: checked ? 'var(--accent)' : 'rgba(150,150,150,0.3)' }}
    >
      <div
        className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-all duration-200"
        style={{ left: checked ? '28px' : '4px' }}
      />
    </div>
  );

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="border-b px-8 py-5" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>App Preferences</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Customize your dashboard experience.</p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-[var(--color-bg-surface-hover)] cursor-pointer" style={{ borderColor: 'var(--color-border)' }} onClick={() => togglePref('emailNotifications')}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[var(--accent-bg-strong)] text-[var(--accent)]">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Email Notifications</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Receive daily asset digests.</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.emailNotifications} onClick={(e) => { e.stopPropagation(); togglePref('emailNotifications'); }} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-[var(--color-bg-surface-hover)] cursor-pointer" style={{ borderColor: 'var(--color-border)' }} onClick={() => togglePref('collapsedSidebar')}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[var(--accent-bg-strong)] text-[var(--accent)]">
              <Sidebar size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Collapsed Sidebar</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Default to a mini navigation rail.</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.collapsedSidebar} onClick={(e) => { e.stopPropagation(); togglePref('collapsedSidebar'); }} />
        </div>
      </div>

      <div className="px-8 py-5 border-t flex justify-end bg-[var(--color-bg-base)]" style={{ borderColor: 'var(--color-border)' }}>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 shadow-md flex-wrap" 
          style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.7 : 1 }}
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
