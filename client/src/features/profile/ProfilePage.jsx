import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Settings, Shield, Key } from 'lucide-react';
import GeneralInfo from './GeneralInfo.jsx';
import PreferencesView from './PreferencesView.jsx';
import SecurityView from './SecurityView.jsx';
import RolePermissionsView from './RolePermissionsView.jsx';

export default function ProfilePage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');

  // Listen to navigation state if somebody clicks "Preferences" from the dropdown
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  return (
    <div className="max-w-6xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-10">
        <div 
          className="w-20 h-20 rounded-[20px] flex items-center justify-center text-3xl font-bold shadow-sm" 
          style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}
        >
          A
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Profile Settings</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your account settings and application preferences.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 lg:gap-10">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'general' ? 'shadow-sm' : 'hover:bg-[var(--color-bg-surface-hover)]'}`} 
            style={{ 
              background: activeTab === 'general' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeTab === 'general' ? 'var(--accent)' : 'var(--color-text-secondary)',
              border: activeTab === 'general' ? '1px solid var(--color-border)' : '1px solid transparent'
            }}
          >
            <User size={18} className={activeTab === 'general' ? '' : 'opacity-70'} /> 
            General Info
          </button>
          
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'preferences' ? 'shadow-sm' : 'hover:bg-[var(--color-bg-surface-hover)]'}`} 
            style={{ 
              background: activeTab === 'preferences' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeTab === 'preferences' ? 'var(--accent)' : 'var(--color-text-secondary)',
              border: activeTab === 'preferences' ? '1px solid var(--color-border)' : '1px solid transparent'
            }}
          >
            <Settings size={18} className={activeTab === 'preferences' ? '' : 'opacity-70'} /> 
            Preferences
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'security' ? 'shadow-sm' : 'hover:bg-[var(--color-bg-surface-hover)]'}`} 
            style={{ 
              background: activeTab === 'security' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeTab === 'security' ? 'var(--accent)' : 'var(--color-text-secondary)',
              border: activeTab === 'security' ? '1px solid var(--color-border)' : '1px solid transparent'
            }}
          >
            <Key size={18} className={activeTab === 'security' ? '' : 'opacity-70'} /> 
            Security
          </button>
          
          <button 
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'roles' ? 'shadow-sm' : 'hover:bg-[var(--color-bg-surface-hover)]'}`} 
            style={{ 
              background: activeTab === 'roles' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeTab === 'roles' ? 'var(--accent)' : 'var(--color-text-secondary)',
              border: activeTab === 'roles' ? '1px solid var(--color-border)' : '1px solid transparent'
            }}
          >
            <Shield size={18} className={activeTab === 'roles' ? '' : 'opacity-70'} /> 
            Role & Permissions
          </button>
        </div>

        {/* Content Area Rendering Sub-components */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && <GeneralInfo />}
          {activeTab === 'preferences' && <PreferencesView />}
          {activeTab === 'security' && <SecurityView />}
          {activeTab === 'roles' && <RolePermissionsView />}
        </div>
        
      </div>
    </div>
  );
}
