import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, UserPlus, UserMinus, ShieldAlert,
  Monitor, Activity, Tag, Clock, MapPin, Calendar, Shield, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assetsApi } from '../../api/client.js';
import { formatCurrency, formatDate, timeAgo, formatPercent } from '../../utils/formatters.js';
import { getCategoryConfig, DEPRECIATION_METHODS, DEPARTMENT_OPTIONS } from '../../utils/constants.js';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import DepreciationGauge from '../../components/ui/DepreciationGauge.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import AssignModal from './AssignModal.jsx';
import AssetFormModal from './AssetFormModal.jsx';

// Info row component for detail sections
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
    {Icon && (
      <div className="p-1.5 rounded-md shrink-0 mt-0.5" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
        <Icon size={14} />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {value || '—'}
      </p>
    </div>
  </div>
);

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
        <Skeleton width="120px" height="20px" />
        <div className="flex gap-6 items-start">
          <Skeleton width="56px" height="56px" className="rounded-xl" />
          <div className="space-y-3">
            <Skeleton width="300px" height="28px" />
            <Skeleton width="200px" height="16px" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton width="100%" height="280px" className="card" />
            <Skeleton width="100%" height="280px" className="card" />
          </div>
          <Skeleton width="100%" height="400px" className="card" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const catConfig = getCategoryConfig(data.category);
  const CatIcon = catConfig.icon;
  const method = DEPRECIATION_METHODS.find(m => m.value === data.depreciationMethod);
  const isHealthy = data.depreciation.percentRemaining > 20;
  const dept = DEPARTMENT_OPTIONS.find(d => d.value === data.department);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/assets')}
        className="btn btn-ghost text-xs"
      >
        <ArrowLeft size={15} /> Back to Assets
      </button>

      {/* Hero Header */}
      <div
        className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="flex gap-4 items-center">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            <CatIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {data.name}
              </h1>
              <Badge status={data.status} />
            </div>
            <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              <Tag size={13} />
              <span className="font-mono text-xs">{data.assetTag}</span>
              <span>•</span>
              <span className="font-mono text-xs">{data.serialNumber}</span>
              <span>•</span>
              <span>{catConfig.label}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditModalOpen(true)} className="btn btn-secondary">
            <Edit size={15} /> Edit
          </button>
          <button onClick={() => setIsDeleteDialogOpen(true)} className="btn btn-danger">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="col-span-1 lg:col-span-2 space-y-6">

          {/* Depreciation Card */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Activity size={16} style={{ color: isHealthy ? '#22c55e' : '#ef4444' }} />
                Depreciation Status
              </h3>
              <div
                className="text-[11px] font-semibold px-2 py-1 rounded-md"
                style={{
                  background: isHealthy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: isHealthy ? '#22c55e' : '#ef4444',
                }}
              >
                {isHealthy ? 'Healthy' : 'Critical'}
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Gauge */}
                <div className="shrink-0">
                  <DepreciationGauge
                    value={data.depreciation.percentRemaining}
                    size={160}
                    strokeWidth={12}
                    label="Value Remaining"
                  />
                </div>

                {/* Key Metrics */}
                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-surface-hover)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Current Value
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(data.depreciation.currentValue)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-surface-hover)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Purchase Price
                    </p>
                    <p className="text-xl font-bold line-through decoration-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatCurrency(data.purchasePrice)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-surface-hover)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Monthly Cost
                    </p>
                    <p className="text-xl font-bold" style={{ color: '#ef4444' }}>
                      -{formatCurrency(data.depreciation.monthlyDepreciation)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-surface-hover)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Total Depreciated
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatCurrency(data.depreciation.totalDepreciated)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full-width progress bar */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Value Remaining
                  </span>
                  <span className="text-sm font-bold" style={{ color: isHealthy ? '#22c55e' : '#ef4444' }}>
                    {formatPercent(data.depreciation.percentRemaining)}
                  </span>
                </div>
                <ProgressBar value={data.depreciation.percentRemaining} height={10} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                <span
                  className="text-[11px] px-2.5 py-1 rounded-md font-medium"
                  style={{ background: 'var(--color-bg-surface-hover)', color: 'var(--color-text-secondary)' }}
                >
                  Method: <span style={{ color: 'var(--accent)' }}>{method?.label || data.depreciationMethod}</span>
                </span>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-md font-medium"
                  style={{ background: 'var(--color-bg-surface-hover)', color: 'var(--color-text-secondary)' }}
                >
                  Months Left: <span style={{ color: 'var(--color-text-primary)' }}>{data.depreciation.monthsRemaining}</span>
                </span>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-md font-medium"
                  style={{ background: 'var(--color-bg-surface-hover)', color: 'var(--color-text-secondary)' }}
                >
                  End of Life: <span style={{ color: 'var(--color-text-primary)' }}>{formatDate(data.depreciation.fullyDepreciatedDate)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Identity & Specifications */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Monitor size={16} style={{ color: '#3b82f6' }} />
                Identity & Specifications
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow icon={MapPin} label="Location" value={data.location} />
                <InfoRow icon={Calendar} label="Purchase Date" value={formatDate(data.purchaseDate)} />
                <InfoRow icon={Shield} label="Warranty Expiry" value={formatDate(data.warrantyExpiry)} />
                <InfoRow
                  icon={Tag}
                  label="Salvage Value"
                  value={formatCurrency(data.salvageValue)}
                />
                {data.department && (
                  <InfoRow
                    icon={Monitor}
                    label="Department"
                    value={dept?.label || data.department}
                  />
                )}
                {data.depreciationMethod === 'UNITS_OF_PRODUCTION' && (
                  <>
                    <InfoRow icon={Activity} label="Total Units Lifecycle" value={data.totalUnits?.toLocaleString()} />
                    <InfoRow icon={Activity} label="Units Used" value={(data.unitsUsed || 0).toLocaleString()} />
                  </>
                )}
              </div>
              {data.notes && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    <FileText size={12} className="inline mr-1" style={{ color: 'var(--accent)' }} />
                    Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                    {data.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-6">

          {/* Assignment Card */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Assignment
              </h3>
            </div>
            <div className="p-6">
              {data.assignedEmployee ? (
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-3"
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6',
                    }}
                  >
                    {data.assignedEmployee.charAt(0)}
                  </div>
                  <h4 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                    {data.assignedEmployee}
                  </h4>
                  <p className="text-[11px] mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                    Currently using this asset
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleUnassign} className="btn btn-secondary flex-1 justify-center text-xs">
                      <UserMinus size={14} /> Unassign
                    </button>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="btn btn-primary flex-1 justify-center text-xs"
                    >
                      <UserPlus size={14} /> Reassign
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{ background: 'var(--color-bg-surface-hover)', color: 'var(--color-text-tertiary)' }}
                  >
                    <ShieldAlert size={22} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Unassigned
                  </p>
                  <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                    This asset is currently in storage.
                  </p>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="btn btn-primary w-full justify-center"
                  >
                    <UserPlus size={15} /> Assign to Employee
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="card overflow-hidden flex flex-col" style={{ maxHeight: 450 }}>
            <div className="card-header shrink-0">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Clock size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                Audit History
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-[7px] top-2 bottom-2 w-px"
                  style={{ background: 'var(--color-border)' }}
                />
                <div className="space-y-5">
                  {history.map((log) => {
                    const dotColor =
                      log.action === 'CREATED' ? '#22c55e'
                      : log.action === 'ASSIGNED' || log.action === 'REASSIGNED' ? '#3b82f6'
                      : log.action === 'UPDATED' || log.action === 'STATUS_CHANGED' ? '#e86c30'
                      : log.action === 'UNASSIGNED' ? '#f59e0b'
                      : '#6b7280';

                    return (
                      <div key={log.id} className="relative pl-7">
                        {/* Timeline dot */}
                        <div
                          className="absolute left-0 top-1 w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: dotColor,
                            background: 'var(--card-bg)',
                          }}
                        >
                          <div
                            className="w-[6px] h-[6px] rounded-full"
                            style={{ background: dotColor }}
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {log.action}
                          </p>
                          <p className="text-[10px] mt-0.5 mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
                            {timeAgo(log.timestamp)} by {log.performedBy}
                          </p>
                          <div
                            className="p-2.5 rounded-lg text-xs"
                            style={{
                              background: 'var(--color-bg-surface-hover)',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {log.details}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
