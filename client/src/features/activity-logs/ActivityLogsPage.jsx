import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, Calendar, Filter, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { activityLogsApi } from '../../api/client.js';
import toast from 'react-hot-toast';

const actionColors = {
  LOGIN: '#3b82f6',
  ASSET_CREATED: '#22c55e',
  ASSET_UPDATED: '#e86c30',
  ASSET_DELETED: '#ef4444',
  ASSET_ASSIGNED: '#a855f7',
  ASSET_REASSIGNED: '#8b5cf6',
  ASSET_UNASSIGNED: '#f59e0b',
  PROFILE_UPDATED: '#06b6d4',
  PASSWORD_CHANGED: '#ec4899',
  NOTIFICATIONS_CLEARED: '#6b7280',
  SYSTEM_INITIALIZED: '#3b82f6',
};

function formatDateTime(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  }).format(new Date(dateStr));
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 25, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, pageSize: 25 };
      if (search) params.search = search;
      if (entity) params.entity = entity;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate + 'T23:59:59').toISOString();

      const result = await activityLogsApi.list(params);
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [search, entity, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await activityLogsApi.stats();
      setStats(result.data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, [fetchLogs, fetchStats]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          <ClipboardList size={24} className="inline mr-2 mb-1" style={{ color: 'var(--accent)' }} />
          Activity Logs
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Track all user actions across the system
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          <div className="card p-5 animate-fade-in">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Actions Today</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stats.totalToday}</p>
          </div>
          <div className="card p-5 animate-fade-in">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Total Logged</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{meta.total}</p>
          </div>
          <div className="card p-5 animate-fade-in">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Top Action</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.actionBreakdown?.[0]?.action || '—'}
              <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-tertiary)' }}>
                ({stats.actionBreakdown?.[0]?.count || 0}x)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                placeholder="Search actions, users, details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-input w-full !pl-9"
              />
            </div>
          </div>
          <div className="min-w-[140px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Entity</label>
            <select value={entity} onChange={(e) => setEntity(e.target.value)} className="filter-select w-full">
              <option value="">All Entities</option>
              <option value="Asset">Asset</option>
              <option value="User">User</option>
              <option value="Auth">Auth</option>
              <option value="Notification">Notification</option>
              <option value="System">System</option>
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
              <Calendar size={10} className="inline mr-1" /> From
            </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-input w-full" />
          </div>
          <div className="min-w-[140px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
              <Calendar size={10} className="inline mr-1" /> To
            </label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-input w-full" />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-tertiary)' }}>Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No activity logs found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const color = actionColors[log.action] || '#6b7280';
                    return (
                      <tr key={log.id}>
                        <td>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Clock size={12} className="opacity-40" />
                            <span className="text-xs font-mono">{formatDateTime(log.timestamp)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                            >
                              {log.user?.firstName?.[0] || '?'}
                            </div>
                            <span className="text-xs font-medium whitespace-nowrap">
                              {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap"
                            style={{ background: `${color}15`, color }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{log.entity}</span>
                          {log.entityId && (
                            <span className="text-[10px] ml-1 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>#{log.entityId}</span>
                          )}
                        </td>
                        <td>
                          <span className="text-xs max-w-[300px] truncate block" style={{ color: 'var(--color-text-secondary)' }}>
                            {log.details || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{log.ipAddress || '—'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Showing {((meta.page - 1) * meta.pageSize) + 1}–{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLogs(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="btn btn-ghost text-xs !px-2"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => fetchLogs(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="btn btn-ghost text-xs !px-2"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
