import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function HeaderProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    toast.success('Logged out successfully');
  };

  const initial = user?.firstName?.[0]?.toUpperCase() || 'U';
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const displayEmail = user?.email || '';

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-105"
        style={{
          background: 'var(--accent-bg-strong)',
          color: 'var(--accent)',
        }}
        title={displayName}
      >
        {initial}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 border outline-none animate-in fade-in slide-in-from-top-2"
          style={{ 
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}
            >
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{displayEmail}</p>
            </div>
          </div>
          
          <div className="py-1">
            <button 
              onClick={() => { setIsOpen(false); navigate('/profile', { state: { tab: 'general' } }); }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-surface-hover)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <User size={14} /> Profile Settings
            </button>
            <button 
              onClick={() => { setIsOpen(false); navigate('/profile', { state: { tab: 'preferences' } }); }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-surface-hover)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Settings size={14} /> Preferences
            </button>
          </div>
          
          <div className="border-t my-1" style={{ borderColor: 'var(--color-border)' }}></div>
          
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-surface-hover)] transition-colors text-red-500 hover:text-red-400"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
