import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, CheckCircle, Clock, Shield, Package, Check, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsApi } from '../../api/client.js';

const typeConfig = {
  DEPRECIATION_WARNING: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Depreciation' },
  WARRANTY_EXPIRING: { icon: Shield, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', label: 'Warranty' },
  AUDIT_COMPLETE: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Audit' },
  SYSTEM_UPDATE: { icon: Clock, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'System' },
  ASSIGNMENT: { icon: Package, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', label: 'Assignment' },
  IMPORT: { icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', label: 'Import' },
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, pageSize: 15 };
      if (filter === 'unread') params.unread = 'true';
      const result = await notificationsApi.list(params);
      setNotifications(page === 1 ? result.data : prev => [...prev, ...result.data]);
      setMeta(result.meta);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      // Silently fail
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            <Bell size={24} className="inline mr-2 mb-1" style={{ color: 'var(--accent)' }} />
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {meta.total} total notifications • {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="status-tabs">
            <button className={`status-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All
            </button>
            <button className={`status-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-secondary text-xs">
              <Check size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-tertiary)' }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No notifications</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              {filter === 'unread' ? 'All caught up!' : 'Notifications will appear here as events occur.'}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.SYSTEM_UPDATE;
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-4 border-b last:border-0 transition-colors cursor-pointer hover:bg-[var(--color-bg-surface-hover)] ${!n.isRead ? 'bg-[var(--accent-bg)]' : ''}`}
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                  onClick={() => {
                    if (!n.isRead) handleMarkRead(n.id);
                    if (n.relatedAssetId) navigate(`/assets/${n.relatedAssetId}`);
                  }}
                >
                  <div
                    className="p-2.5 rounded-lg shrink-0 mt-0.5"
                    style={{ background: config.bg, color: config.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                      {!n.isRead && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{n.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: config.bg, color: config.color }}>
                        {config.label}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        {timeAgo(n.createdAt)}
                      </span>
                      {n.relatedAsset && (
                        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                          {n.relatedAsset.assetTag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {meta.page < meta.totalPages && (
          <div className="px-6 py-4 text-center border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => fetchNotifications(meta.page + 1)}
              className="btn btn-ghost text-xs"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load older notifications'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
