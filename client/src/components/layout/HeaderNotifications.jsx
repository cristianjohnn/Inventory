import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, CheckCircle, Clock, AlertTriangle, Shield, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsApi } from '../../api/client.js';

const typeConfig = {
  DEPRECIATION_WARNING: { icon: AlertTriangle, color: 'text-orange-500' },
  WARRANTY_EXPIRING: { icon: Shield, color: 'text-yellow-500' },
  AUDIT_COMPLETE: { icon: CheckCircle, color: 'text-green-500' },
  SYSTEM_UPDATE: { icon: Clock, color: 'text-blue-500' },
  ASSIGNMENT: { icon: Package, color: 'text-purple-500' },
  IMPORT: { icon: Package, color: 'text-cyan-500' },
};

export default function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationsApi.unreadCount();
      setUnreadCount(result.data.count);
    } catch {
      // Silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationsApi.list({ pageSize: 5 });
      setNotifications(result.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Marked all as read');
      setIsOpen(false);
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleClickNotification = async (n) => {
    if (!n.isRead) {
      try {
        await notificationsApi.markRead(n.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(item =>
          item.id === n.id ? { ...item, isRead: true } : item
        ));
      } catch {
        // Silently fail
      }
    }
    setIsOpen(false);
    navigate('/notifications');
  };

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-secondary)]"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 ring-2 ring-[var(--color-bg-header)]"
            style={{ background: '#e86c30' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
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
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs hover:underline" 
                style={{ color: 'var(--accent)' }}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const config = typeConfig[n.type] || typeConfig.SYSTEM_UPDATE;
                const Icon = config.icon;
                return (
                  <div 
                    onClick={() => handleClickNotification(n)}
                    key={n.id}
                    className={`px-4 py-3 border-b last:border-0 hover:bg-[var(--color-bg-surface-hover)] transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-[var(--accent-bg)]' : ''}`}
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className={`mt-0.5 ${config.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{n.description}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                    )}
                  </div>
                );
              })
            )}
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
