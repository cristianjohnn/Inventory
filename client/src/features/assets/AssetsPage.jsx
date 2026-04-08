import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, ChevronLeft, ChevronRight, Monitor, Edit, UserPlus, Trash2 } from 'lucide-react';
import { assetsApi } from '../../api/client.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { exportToCsv } from '../../utils/exportCsv.js';
import { CATEGORY_OPTIONS, STATUS_OPTIONS, DEPARTMENT_OPTIONS, getCategoryConfig } from '../../utils/constants.js';
import Badge from '../../components/ui/Badge.jsx';
import Skeleton, { SkeletonRow } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import StatusTabs from '../../components/ui/StatusTabs.jsx';
import ActionMenu from '../../components/ui/ActionMenu.jsx';
import AssetFormModal from './AssetFormModal.jsx';

export default function AssetsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ data: [], meta: { total: 0, page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [allCounts, setAllCounts] = useState({ total: 0, inUse: 0, available: 0, underRepair: 0, retired: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load counts for status tabs
  useEffect(() => {
    async function loadCounts() {
      try {
        const results = await Promise.all([
          assetsApi.list({ pageSize: 1 }),
          assetsApi.list({ status: 'IN_USE', pageSize: 1 }),
          assetsApi.list({ status: 'AVAILABLE', pageSize: 1 }),
          assetsApi.list({ status: 'UNDER_REPAIR', pageSize: 1 }),
          assetsApi.list({ status: 'RETIRED', pageSize: 1 }),
        ]);
        setAllCounts({
          total: results[0].meta.total,
          inUse: results[1].meta.total,
          available: results[2].meta.total,
          underRepair: results[3].meta.total,
          retired: results[4].meta.total,
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadCounts();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await assetsApi.list({
          search: debouncedSearch,
          status,
          category,
          page,
          pageSize: 10,
        });
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debouncedSearch, status, category, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category]);

  const handleExport = async () => {
    try {
      const result = await assetsApi.list({
        search: debouncedSearch,
        status,
        category,
        pageSize: 1000,
      });
      exportToCsv(result.data, `assets-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const statusTabs = [
    { value: '', label: 'All', count: allCounts.total },
    { value: 'IN_USE', label: 'In Use', count: allCounts.inUse },
    { value: 'AVAILABLE', label: 'Available', count: allCounts.available },
    { value: 'UNDER_REPAIR', label: 'Repair', count: allCounts.underRepair },
    { value: 'RETIRED', label: 'Retired', count: allCounts.retired },
  ];

  const actionMenuItems = [
    { label: 'Edit', action: 'edit', icon: Edit },
    { label: 'Assign', action: 'assign', icon: UserPlus },
    { label: 'Delete', action: 'delete', icon: Trash2, danger: true },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Assets{' '}
            <span style={{ color: 'var(--accent)' }}>— All ({allCounts.total})</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleExport} className="btn btn-secondary">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
            <Plus size={15} /> Add Asset
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <StatusTabs tabs={statusTabs} activeTab={status} onChange={setStatus} />

      {/* Search & Filter Bar */}
      <div className="card p-4">
        <div className="filter-bar">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Search by name, tag, or serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input w-full !pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-select w-full sm:w-44"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Asset Info</th>
                <th>Status</th>
                <th>Department</th>
                <th>Assigned To</th>
                <th>Current Value</th>
                <th>Remaining</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3"><SkeletonRow /></td>
                  </tr>
                ))
              ) : data.data.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Monitor}
                      title="No assets found"
                      message="Try adjusting your filters or search query."
                    />
                  </td>
                </tr>
              ) : (
                data.data.map((asset) => {
                  const catConfig = getCategoryConfig(asset.category);
                  const CatIcon = catConfig.icon;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      className="cursor-pointer"
                    >
                      {/* Category Icon */}
                      <td>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: 'var(--accent-bg)',
                            color: 'var(--accent)',
                          }}
                        >
                          <CatIcon size={16} />
                        </div>
                      </td>

                      {/* Asset Info */}
                      <td>
                        <p
                          className="font-medium text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {asset.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          {asset.assetTag} • {asset.serialNumber}
                        </p>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge status={asset.status} />
                      </td>

                      {/* Department */}
                      <td>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {asset.department
                            ? DEPARTMENT_OPTIONS.find(d => d.value === asset.department)?.label || asset.department
                            : '—'}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td>
                        {asset.assignedEmployee ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#3b82f6',
                              }}
                            >
                              {asset.assignedEmployee.charAt(0)}
                            </div>
                            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              {asset.assignedEmployee}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Current Value */}
                      <td>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(asset.depreciation.currentValue)}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#ef4444' }}>
                          -{formatCurrency(asset.depreciation.monthlyDepreciation)}/mo
                        </p>
                      </td>

                      {/* Remaining */}
                      <td>
                        <div className="flex items-center gap-2 w-28">
                          <div className="flex-1">
                            <ProgressBar value={asset.depreciation.percentRemaining} height={6} />
                          </div>
                          <span
                            className="text-[11px] font-semibold w-10 text-right"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {formatPercent(asset.depreciation.percentRemaining)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <ActionMenu
                          items={actionMenuItems}
                          onAction={(action) => {
                            if (action === 'edit') navigate(`/assets/${asset.id}`);
                            if (action === 'assign') navigate(`/assets/${asset.id}`);
                            if (action === 'delete') navigate(`/assets/${asset.id}`);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && data.meta.totalPages > 1 && (
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Showing{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {(data.meta.page - 1) * data.meta.pageSize + 1}
              </span>
              {' '}to{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {Math.min(data.meta.page * data.meta.pageSize, data.meta.total)}
              </span>
              {' '}of{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {data.meta.total}
              </span>
              {' '}assets
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(data.meta.totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: p === page ? 'var(--accent)' : 'transparent',
                    color: p === page ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="btn btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => setPage(1)}
      />
    </div>
  );
}
