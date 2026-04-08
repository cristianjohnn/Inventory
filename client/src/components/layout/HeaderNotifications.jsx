import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, type: 'alert', title: 'Asset Depreciation Warning', desc: '5 assets are nearing end of life.', time: '10 min ago', icon: AlertCircle, color: 'text-orange-500' },
    { id: 2, type: 'success', title: 'Audit Completed', desc: 'Q3 IT Equipment audit finalized.', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500' },
    { id: 3, type: 'info', title: 'System Update', desc: 'Scheduled maintenance this weekend.', time: '1 day ago', icon: Clock, color: 'text-blue-500' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-secondary)]"
        title="Notifications"
      >
        <Bell size={18} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[var(--color-bg-header)]"
          style={{ background: '#e86c30' }}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 border"
          style={{ 
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Notifications</h3>
            <button 
              onClick={() => {
                toast.success('Marked all as read');
                setIsOpen(false);
              }}
              className="text-xs hover:underline" 
              style={{ color: 'var(--accent)' }}
            >
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  key={n.id}
                  className="px-4 py-3 border-b last:border-0 hover:bg-[var(--color-bg-surface-hover)] transition-colors cursor-pointer flex gap-3"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className={`mt-0.5 ${n.color}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{n.desc}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-medium hover:underline" style={{ color: 'var(--color-text-secondary)' }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
