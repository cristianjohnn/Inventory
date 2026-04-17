import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';
import {
  Monitor, TrendingDown, Activity, CheckCircle2, AlertTriangle,
  LayoutDashboard, PhilippinePeso, Package, ArrowDownRight, Shield
} from 'lucide-react';
import { dashboardApi } from '../../api/client.js';
import { formatCurrency, formatPercent, timeAgo } from '../../utils/formatters.js';
import { getStatusConfig, getCategoryConfig, DEPARTMENT_OPTIONS } from '../../utils/constants.js';
import Skeleton, { SkeletonCard, SkeletonRow } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

// Animated number counter
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') return;
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      const pct = Math.min(progress / duration, 1);
      setCount(Math.floor(value * pct));
      if (pct < 1) requestAnimationFrame(animate);
      else setCount(value);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  if (typeof value !== 'number') return value;
  return count.toLocaleString();
};

const StatCard = ({ icon: Icon, title, value, subtitle, accentColor }) => {
  const isCurrency = typeof value === 'string' && value.startsWith('₱');
  const numericValue = typeof value === 'number' ? value : (isCurrency ? parseFloat(value.replace(/[^0-9.]/g, '')) : value);

  return (
    <div 
      className="rounded-xl p-5 relative overflow-hidden group shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-0.5" 
      style={{ background: accentColor, color: '#ffffff' }}
    >
      {/* Background Translucent Icon (NetSuite/Premium Tile effect) */}
      <Icon size={90} className="absolute -right-4 -bottom-6 opacity-10 rotate-12 transition-transform group-hover:scale-110" />
      
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5 opacity-80 drop-shadow-sm">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold truncate drop-shadow-sm tracking-tight text-white">
            {isCurrency ? '₱' : ''}
            {typeof numericValue === 'number' ? <AnimatedCounter value={numericValue} /> : value}
          </h3>
          {subtitle && (
            <p className="text-[10px] mt-2 truncate max-w-full font-semibold bg-black/20 inline-block px-2 py-0.5 rounded-md drop-shadow-sm">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg shrink-0 bg-white/20 backdrop-blur-sm ring-1 ring-white/30 drop-shadow-sm">
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
};

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

  const { statusCounts, portfolio, categoryValues, recentActivity, expiringWarranties, trend } = data;
  const depreciationPercent = portfolio.totalOriginalValue > 0
    ? ((portfolio.totalCurrentValue / portfolio.totalOriginalValue) * 100)
    : 0;

  // Pie chart data
  const pieData = [
    { name: 'In Use', value: statusCounts.inUse, color: '#10b981' }, // emerald
    { name: 'Available', value: statusCounts.available, color: '#3b82f6' }, // blue
    { name: 'Repair', value: statusCounts.underRepair, color: '#f59e0b' }, // amber
    { name: 'Retired', value: statusCounts.retired, color: '#525252' }, // neutral
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
          accentColor="var(--accent)"
        />
        <StatCard
          icon={PhilippinePeso}
          title="Portfolio Value"
          value={formatCurrency(portfolio.totalCurrentValue)}
          subtitle={`${formatPercent(depreciationPercent)} of original`}
          accentColor="#0f172a" 
        />
        <StatCard
          icon={TrendingDown}
          title="Monthly Exp."
          value={formatCurrency(portfolio.totalCurrentValue - portfolio.totalProjectedNextMonth)}
          accentColor="#9f1239" 
        />
        <StatCard
          icon={CheckCircle2}
          title="In Use"
          value={statusCounts.inUse}
          subtitle={`${statusCounts.available} available`}
          accentColor="#059669" 
        />
        <StatCard
          icon={AlertTriangle}
          title="Under Repair"
          value={statusCounts.underRepair}
          subtitle={`${statusCounts.retired} retired`}
          accentColor="#b45309" 
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
                  <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-bg-surface-hover)' }} wrapperStyle={{ outline: 'none' }} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
                  />
                  <Bar dataKey="original" name="Original Cost" fill="#404040" radius={[4, 4, 0, 0]} activeBar={false} />
                  <Bar dataKey="value" name="Current Value" fill="#e86c30" radius={[4, 4, 0, 0]} activeBar={false} />
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
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} content={({ active, payload }) => {
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

        {/* Depreciation Forecast with AreaChart */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Depreciation Trend (6 Mo)
            </h3>
          </div>
          <div className="p-5">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val / 1000}k`} />
                  <RechartsTooltip content={<ChartTooltip />} wrapperStyle={{ outline: 'none' }} />
                  <Area type="monotone" dataKey="value" name="Portfolio Value" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-text-tertiary)' }}>Current Value</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(portfolio.totalCurrentValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-text-tertiary)' }}>Monthly Loss</p>
                <p className="text-sm font-bold mt-0.5 flex items-center justify-center gap-1" style={{ color: '#ef4444' }}>
                  <ArrowDownRight size={14} />
                  {formatCurrency(portfolio.totalCurrentValue - portfolio.totalProjectedNextMonth)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Required: Expiring Warranties */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Shield size={16} style={{ color: '#eab308' }} />
              Action Required
            </h3>
          </div>
          <div className="p-5">
            {expiringWarranties?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[240px] text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                <CheckCircle2 size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">All clear</p>
                <p className="text-xs mt-1">No warranties expiring in the next 30 days.</p>
              </div>
            ) : (
              <div className="space-y-3 h-[240px] overflow-y-auto pr-1">
                {expiringWarranties?.map(w => (
                  <div key={w.id} className="p-3 bg-[var(--color-bg-surface-hover)] border-y first:border-t-0 flex items-center justify-between transition-colors" 
                    style={{ borderColor: 'var(--color-border-subtle)', borderLeft: w.daysLeft <= 7 ? '4px solid #ef4444' : '4px solid #eab308' }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{w.name}</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{w.assetTag}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold" style={{ color: w.daysLeft <= 7 ? '#ef4444' : '#eab308' }}>
                        {w.daysLeft} days
                      </p>
                      <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-text-tertiary)' }}>Left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {recentActivity.map((log) => {
                  const barColor = log.action === 'CREATED' ? '#10b981' : log.action === 'ASSIGNED' || log.action === 'REASSIGNED' ? '#3b82f6' : log.action === 'UPDATED' || log.action === 'STATUS_CHANGED' ? 'var(--accent)' : log.action === 'UNASSIGNED' ? '#f59e0b' : '#6b7280';
                  return (
                  <div
                    key={log.id}
                    className="px-5 py-3 flex items-start gap-3 transition-colors hover:bg-[var(--color-bg-surface-hover)] border-b last:border-b-0"
                    style={{ borderLeft: `4px solid ${barColor}`, borderColor: 'var(--color-border-subtle)' }}
                  >
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm"
                          style={{
                            background: barColor + '20',
                            color: barColor,
                          }}
                        >
                          {log.action}
                        </span>
                        <span className="text-[10px] shrink-0 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                          {timeAgo(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-[13px] mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                        {log.details}
                      </p>
                      {log.asset?.name && (
                        <span className="text-[10px] mt-1.5 flex items-center gap-1 font-semibold opacity-80" style={{ color: 'var(--accent)' }}>
                          <Monitor size={10} />
                          {log.asset.name}
                        </span>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
