import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight, Monitor, MoreVertical } from 'lucide-react';
import { assetsApi } from '../../api/client.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { getStatusConfig, CATEGORY_OPTIONS, STATUS_OPTIONS } from '../../utils/constants.js';
import { exportToCsv } from '../../utils/exportCsv.js';
import Badge from '../../components/ui/Badge.jsx';
import Skeleton, { SkeletonRow } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import AssetFormModal from './AssetFormModal.jsx';

export default function AssetsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ data: [], meta: { total: 0, page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // Form Modal (we'll implement this later)
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      // Fetch all matching assets for export (ignoring pagination)
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Assets Inventory</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and track your IT assets portfolio</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, tag, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 text-xs uppercase text-zinc-500 bg-zinc-900/20">
                <th className="px-6 py-4 font-semibold">Asset Info</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Assigned To</th>
                <th className="px-6 py-4 font-semibold">Current Value</th>
                <th className="px-6 py-4 font-semibold">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4"><SkeletonRow /></td>
                  </tr>
                ))
              ) : data.data.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState 
                      icon={Monitor} 
                      title="No assets found" 
                      message="Try adjusting your filters or search query." 
                    />
                  </td>
                </tr>
              ) : (
                data.data.map((asset) => (
                  <tr 
                    key={asset.id} 
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">
                          {CATEGORY_OPTIONS.find(c => c.value === asset.category)?.icon || '📦'}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">{asset.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{asset.assetTag} • {asset.serialNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={asset.status} />
                    </td>
                    <td className="px-6 py-4">
                      {asset.assignedEmployee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                            {asset.assignedEmployee.charAt(0)}
                          </div>
                          <span className="text-sm text-zinc-300">{asset.assignedEmployee}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-200">{formatCurrency(asset.depreciation.currentValue)}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 line-through">{formatCurrency(asset.purchasePrice)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-32">
                        <div className="flex-1">
                          <ProgressBar 
                            value={asset.depreciation.percentRemaining} 
                            color={asset.depreciation.percentRemaining > 30 ? '#10b981' : asset.depreciation.percentRemaining > 10 ? '#f59e0b' : '#ef4444'} 
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-400 w-10 text-right">
                          {formatPercent(asset.depreciation.percentRemaining)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && data.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800/50 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Showing <span className="font-medium text-zinc-300">{(data.meta.page - 1) * data.meta.pageSize + 1}</span> to{' '}
              <span className="font-medium text-zinc-300">{Math.min(data.meta.page * data.meta.pageSize, data.meta.total)}</span> of{' '}
              <span className="font-medium text-zinc-300">{data.meta.total}</span> assets
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AssetFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => setPage(1) /* Refresh page 1 */} 
      />
    </div>
  );
}
