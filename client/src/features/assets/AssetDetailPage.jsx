import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, UserPlus, UserMinus, ShieldAlert, Monitor, Activity, Tag, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assetsApi } from '../../api/client.js';
import { formatCurrency, formatDate, timeAgo, formatPercent } from '../../utils/formatters.js';
import { getStatusConfig, CATEGORY_OPTIONS, DEPRECIATION_METHODS } from '../../utils/constants.js';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import AssignModal from './AssignModal.jsx';
import AssetFormModal from './AssetFormModal.jsx';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [assetResult, historyResult] = await Promise.all([
        assetsApi.get(id),
        assetsApi.history(id),
      ]);
      setData(assetResult.data);
      setHistory(historyResult.data);
    } catch (err) {
      toast.error('Failed to load asset details');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await assetsApi.delete(id);
      toast.success('Asset deleted successfully');
      navigate('/assets');
    } catch (err) {
      toast.error(err.message || 'Failed to delete asset');
    }
  };

  const handleUnassign = async () => {
    try {
      await assetsApi.unassign(id);
      toast.success('Employee unassigned successfully');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to unassign employee');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton width="120px" height="24px" className="mb-6" />
        <div className="flex gap-6 items-start">
          <Skeleton width="64px" height="64px" className="rounded-2xl" />
          <div className="space-y-3">
            <Skeleton width="300px" height="32px" />
            <Skeleton width="200px" height="20px" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton width="100%" height="250px" className="glass-card" />
            <Skeleton width="100%" height="300px" className="glass-card" />
          </div>
          <Skeleton width="100%" height="400px" className="glass-card" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const category = CATEGORY_OPTIONS.find(c => c.value === data.category);
  const method = DEPRECIATION_METHODS.find(m => m.value === data.depreciationMethod);
  const isHealthy = data.depreciation.percentRemaining > 20;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation */}
      <button 
        onClick={() => navigate('/assets')}
        className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Assets
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-zinc-900/50 to-transparent p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-3xl shadow-xl">
            {category?.icon || '📦'}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-zinc-100">{data.name}</h1>
              <Badge status={data.status} />
            </div>
            <p className="text-zinc-400 flex items-center gap-2">
              <Tag size={14} /> {data.assetTag}
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-xs">{data.serialNumber}</span>
              <span className="text-zinc-600">•</span>
              {category?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium transition-colors border border-rose-500/20"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left Col) */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Depreciation Overview */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className={`absolute right-0 top-0 w-64 h-64 bg-gradient-to-br ${isHealthy ? 'from-emerald-500/10 to-teal-500/5' : 'from-rose-500/10 to-orange-500/5'} blur-3xl -z-10`} />
            
            <h3 className="text-lg font-semibold text-zinc-200 mb-6 flex items-center gap-2">
              <Activity size={18} className={isHealthy ? 'text-emerald-500' : 'text-rose-500'} /> 
              Depreciation Status
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Current Value</p>
                <p className="text-2xl font-bold text-zinc-100">{formatCurrency(data.depreciation.currentValue)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Purchase Price</p>
                <p className="text-xl font-semibold text-zinc-300 line-through decoration-zinc-600">{formatCurrency(data.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Monthly Cost</p>
                <p className="text-xl font-semibold text-rose-400">-{formatCurrency(data.depreciation.monthlyDepreciation)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Total Depreciated</p>
                <p className="text-xl font-semibold text-zinc-300">{formatCurrency(data.depreciation.totalDepreciated)}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-zinc-300">Value Remaining</span>
                <span className={`text-lg font-bold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(data.depreciation.percentRemaining)}
                </span>
              </div>
              <ProgressBar 
                value={data.depreciation.percentRemaining} 
                height={12}
                color={isHealthy ? '#10b981' : data.depreciation.percentRemaining > 10 ? '#f59e0b' : '#ef4444'} 
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-800/50">
              <div className="px-3 py-1.5 rounded-md bg-zinc-900/50 text-xs text-zinc-400 border border-zinc-800">
                <span className="font-semibold text-zinc-300">Method:</span> {method?.label || data.depreciationMethod}
              </div>
              <div className="px-3 py-1.5 rounded-md bg-zinc-900/50 text-xs text-zinc-400 border border-zinc-800">
                <span className="font-semibold text-zinc-300">Months Left:</span> {data.depreciation.monthsRemaining}
              </div>
              <div className="px-3 py-1.5 rounded-md bg-zinc-900/50 text-xs text-zinc-400 border border-zinc-800">
                <span className="font-semibold text-zinc-300">Fully Depreciates:</span> {formatDate(data.depreciation.fullyDepreciatedDate)}
              </div>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Monitor size={18} className="text-blue-500" /> Identity & Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-zinc-200 font-medium">{data.location || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Purchase Date</p>
                <p className="text-zinc-200 font-medium">{formatDate(data.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Warranty Expiry</p>
                <p className="text-zinc-200 font-medium">{formatDate(data.warrantyExpiry)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Salvage Value</p>
                <p className="text-zinc-200 font-medium">{formatCurrency(data.salvageValue)}</p>
              </div>
              {data.depreciationMethod === 'UNITS_OF_PRODUCTION' && (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Units Lifecycle</p>
                    <p className="text-zinc-200 font-medium">{data.totalUnits?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Units Used</p>
                    <p className="text-zinc-200 font-medium">{data.unitsUsed?.toLocaleString() || 0}</p>
                  </div>
                </>
              )}
              {data.notes && (
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-zinc-300 text-sm whitespace-pre-wrap">{data.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Col) */}
        <div className="col-span-1 space-y-6">
          
          {/* Assignment Card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Assignment</h3>
            {data.assignedEmployee ? (
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
                  {data.assignedEmployee.charAt(0)}
                </div>
                <h4 className="font-semibold text-zinc-100 mb-1">{data.assignedEmployee}</h4>
                <p className="text-xs text-zinc-500 mb-4">Currently using this asset</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleUnassign}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors flex justify-center items-center gap-1"
                  >
                    <UserMinus size={14} /> Unassign
                  </button>
                  <button 
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-sm font-medium transition-colors flex justify-center items-center gap-1"
                  >
                    <UserPlus size={14} /> Reassign
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-center border-dashed">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                  <ShieldAlert size={20} />
                </div>
                <p className="text-sm font-medium text-zinc-300 mb-4">Asset is currently unassigned and in storage.</p>
                <button 
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2"
                >
                  <UserPlus size={16} /> Assign to Employee
                </button>
              </div>
            )}
          </div>

          {/* Audit History */}
          <div className="glass-card p-6 h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-zinc-400" /> Audit History
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 relative filter-container">
              <div className="absolute left-[11px] top-4 bottom-4 w-px bg-zinc-800" />
              <div className="space-y-6">
                {history.map((log, i) => (
                  <div key={log.id} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{log.action}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 mb-2">{timeAgo(log.timestamp)} by {log.performedBy}</p>
                      <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-400">
                        {log.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete ${data.name}? This action cannot be undone and will erase all audit history for this asset.`}
      />

      <AssignModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        assetId={data.id} 
        onSuccess={loadData} 
      />
      
      <AssetFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        asset={data} 
        onSuccess={loadData} 
      />
    </div>
  );
}
