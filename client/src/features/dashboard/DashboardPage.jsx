import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  Monitor, TrendingDown, Activity, CheckCircle2, AlertTriangle,
  LayoutDashboard, DollarSign, Package, ArrowDownRight
} from 'lucide-react';
import { dashboardApi } from '../../api/client.js';
import { formatCurrency, formatPercent, timeAgo } from '../../utils/formatters.js';
import { getStatusConfig, getCategoryConfig, DEPARTMENT_OPTIONS } from '../../utils/constants.js';
import Skeleton, { SkeletonCard, SkeletonRow } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

// KPI Stat Card
const StatCard = ({ icon: Icon, title, value, subtitle, accentColor }) => (
  <div className="card p-5 relative overflow-hidden group animate-count-up">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
          {title}
        </p>
        <h3 className="text-2xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1.5 truncate" style={{ color: 'var(--color-text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        className="p-2.5 rounded-lg shrink-0"
        style={{ background: `${accentColor}15`, color: accentColor }}
      >
        <Icon size={20} />
      </div>
    </div>
    {/* Bottom accent bar */}
    <div
      className="absolute bottom-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
    />
  </div>
);

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await dashboardApi.get();
        setData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton width="250px" height="32px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton width="100%" height="320px" className="card" />
          </div>
          <Skeleton width="100%" height="320px" className="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title="Failed to load dashboard" message={error.message} />;
  }

  const { statusCounts, portfolio, categoryValues, recentActivity } = data;
  const depreciationPercent = portfolio.totalOriginalValue > 0
    ? ((portfolio.totalCurrentValue / portfolio.totalOriginalValue) * 100)
    : 0;

  // Pie chart data
  const pieData = [
    { name: 'In Use', value: statusCounts.inUse, color: '#22c55e' },
    { name: 'Available', value: statusCounts.available, color: '#3b82f6' },
    { name: 'Repair', value: statusCounts.underRepair, color: '#f59e0b' },
    { name: 'Retired', value: statusCounts.retired, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Bar chart data
  const barData = Object.entries(categoryValues).map(([cat, vals]) => ({
    name: cat.charAt(0) + cat.slice(1).toLowerCase(),
    value: vals.current,
    original: vals.original,
  })).sort((a, b) => b.original - a.original).slice(0, 8);

  // Department distribution data
  const deptData = {};
  // We can derive department info from category values or show a simple breakdown
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            Real-time asset insights and portfolio health
          </p>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
          }}
        >
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger">
        <StatCard
          icon={Package}
          title="Total Assets"
          value={statusCounts.total}
          accentColor="#e86c30"
        />
        <StatCard
          icon={DollarSign}
          title="Portfolio Value"
          value={formatCurrency(portfolio.totalCurrentValue)}
          subtitle={`${formatPercent(depreciationPercent)} of original`}
          accentColor="#3b82f6"
        />
        <StatCard
          icon={TrendingDown}
          title="Monthly Depreciation"
          value={formatCurrency(portfolio.totalCurrentValue - portfolio.totalProjectedNextMonth)}
          accentColor="#ef4444"
        />
        <StatCard
          icon={CheckCircle2}
          title="In Use"
          value={statusCounts.inUse}
          subtitle={`${statusCounts.available} available`}
          accentColor="#22c55e"
        />
        <StatCard
          icon={AlertTriangle}
          title="Under Repair"
          value={statusCounts.underRepair}
          subtitle={`${statusCounts.retired} retired`}
          accentColor="#f59e0b"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Value by Category - Bar Chart */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Activity size={16} style={{ color: 'var(--accent)' }} />
              Value by Category
            </h3>
          </div>
          <div className="p-5">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-text-tertiary)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-tertiary)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₱${val / 1000}k`}
                  />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
                  />
                  <Bar dataKey="original" name="Original Cost" fill="#404040" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" name="Current Value" fill="#e86c30" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Asset Status
            </h3>
          </div>
          <div className="p-5">
            <div style={{ height: 200 }} className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div
                        className="rounded-lg px-3 py-2 text-xs shadow-xl"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <span style={{ color: payload[0].payload.color }}>{payload[0].name}</span>
                        : {payload[0].value}
                      </div>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {statusCounts.total}
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Total
                </span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                  <span className="ml-auto font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Depreciation Forecast + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Depreciation Forecast */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Depreciation Forecast
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div
              className="p-3.5 rounded-lg flex items-center justify-between"
              style={{ background: 'var(--color-bg-surface-hover)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Current Portfolio
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrency(portfolio.totalCurrentValue)}
              </span>
            </div>

            <div
              className="p-3.5 rounded-lg flex items-center justify-between"
              style={{ background: 'rgba(232, 108, 48, 0.08)', border: '1px solid rgba(232, 108, 48, 0.15)' }}
            >
              <span className="text-xs font-medium" style={{ color: '#e86c30' }}>
                Next Month Est.
              </span>
              <span className="text-sm font-bold" style={{ color: '#e86c30' }}>
                {formatCurrency(portfolio.totalProjectedNextMonth)}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                Monthly Loss
              </span>
              <span className="text-sm font-semibold flex items-center gap-1" style={{ color: '#ef4444' }}>
                <ArrowDownRight size={14} />
                -{formatCurrency(portfolio.totalCurrentValue - portfolio.totalProjectedNextMonth)}
              </span>
            </div>

            <div
              className="p-3.5 rounded-lg"
              style={{ background: 'var(--color-bg-surface-hover)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Value Retained
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatPercent(depreciationPercent)}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--color-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${depreciationPercent}%`,
                    background: 'linear-gradient(90deg, #e86c30, #fb923c)',
                    animation: 'progressFill 1s ease-out',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col" style={{ maxHeight: 420 }}>
          <div className="card-header shrink-0">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Recent Activity
            </h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
            }}>
              {recentActivity.length} entries
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                No recent activity
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="px-5 py-3.5 flex items-start gap-3 transition-colors hover:bg-[var(--color-bg-surface-hover)]"
                  >
                    {/* Action dot */}
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        background: log.action === 'CREATED' ? '#22c55e'
                          : log.action === 'ASSIGNED' || log.action === 'REASSIGNED' ? '#3b82f6'
                          : log.action === 'UPDATED' || log.action === 'STATUS_CHANGED' ? '#e86c30'
                          : log.action === 'UNASSIGNED' ? '#f59e0b'
                          : '#6b7280',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: 'var(--color-bg-surface-hover)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {log.action}
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                          {timeAgo(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {log.details}
                      </p>
                      {log.asset?.name && (
                        <span className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <Monitor size={10} style={{ color: 'var(--accent)' }} />
                          {log.asset.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
