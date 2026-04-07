import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Monitor, CreditCard, Activity, CheckCircle2, AlertTriangle, XCircle, LayoutDashboard } from 'lucide-react';
import { dashboardApi } from '../../api/client.js';
import { formatCurrency, formatPercent, timeAgo } from '../../utils/formatters.js';
import { getStatusConfig } from '../../utils/constants.js';
import Skeleton, { SkeletonCard, SkeletonRow } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';

// Components
const StatCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
  <div className="glass-card p-5 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${gradient} group-hover:scale-125 transition-transform duration-500`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-zinc-100">{value}</h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 text-white`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

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
        <div className="flex items-center gap-3">
          <Skeleton width="40px" height="40px" className="rounded-xl" />
          <Skeleton width="200px" height="32px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton width="100%" height="300px" className="glass-card" />
            <Skeleton width="100%" height="300px" className="glass-card" />
          </div>
          <div className="glass-card p-5">
            <Skeleton width="150px" height="24px" className="mb-4" />
            {Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title="Failed to load dashboard" message={error.message} />;
  }

  const { statusCounts, portfolio, categoryValues, recentActivity } = data;

  // Pie chart data
  const pieData = [
    { name: 'In Use', value: statusCounts.inUse, color: getStatusConfig('IN_USE').color },
    { name: 'Available', value: statusCounts.available, color: getStatusConfig('AVAILABLE').color },
    { name: 'Repair', value: statusCounts.underRepair, color: getStatusConfig('UNDER_REPAIR').color },
    { name: 'Retired', value: statusCounts.retired, color: getStatusConfig('RETIRED').color },
  ].filter(d => d.value > 0);

  // Bar chart data
  const barData = Object.entries(categoryValues).map(([cat, vals]) => ({
    name: cat.charAt(0) + cat.slice(1).toLowerCase(),
    value: vals.current,
    original: vals.original,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-sm text-zinc-500">Real-time asset insights and portfolio value</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger">
        <StatCard
          icon={Monitor}
          title="Total Assets"
          value={statusCounts.total}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={CreditCard}
          title="Total Value"
          value={formatCurrency(portfolio.totalCurrentValue)}
          subtitle={`${formatPercent((portfolio.totalCurrentValue / portfolio.totalOriginalValue) * 100)} of original value`}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={CheckCircle2}
          title="In Use"
          value={statusCounts.inUse}
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          icon={Activity}
          title="Available"
          value={statusCounts.available}
          gradient="from-cyan-500 to-blue-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Under Repair"
          value={statusCounts.underRepair}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Portfolio Depreciation */}
          <div className="glass-card p-6 flex-1 border border-zinc-800/50">
            <h3 className="text-lg font-semibold text-zinc-200 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Value by Category
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="original" name="Original Cost" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" name="Current Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Chart */}
            <div className="glass-card p-6 border border-zinc-800/50">
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">Asset Status</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Forecast */}
            <div className="glass-card p-6 border border-zinc-800/50 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-zinc-200 mb-6">Depreciation Forecast</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50">
                  <span className="text-sm text-zinc-400">Current Portfolio</span>
                  <span className="font-semibold text-zinc-200">{formatCurrency(portfolio.totalCurrentValue)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm text-amber-500 font-medium">Next Month Est.</span>
                  <span className="font-semibold text-amber-400">{formatCurrency(portfolio.totalProjectedNextMonth)}</span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-sm text-zinc-500">Monthly Depreciation</span>
                  <span className="font-medium text-rose-400">-{formatCurrency(portfolio.totalCurrentValue - portfolio.totalProjectedNextMonth)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="glass-card flex flex-col border border-zinc-800/50 h-[calc(100vh-140px)] sticky top-[88px]">
          <div className="p-5 border-b border-zinc-800/50">
            <h3 className="text-lg font-semibold text-zinc-200">Activity Log</h3>
            <p className="text-xs text-zinc-500 mt-1">Latest asset movements and updates</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No recent activity</div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 transition-colors">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded-md">
                        {timeAgo(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-2 line-clamp-2">{log.details}</p>
                    {(log.asset?.name || log.employeeName) && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                        {log.asset?.name && (
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <Monitor size={10} className="text-emerald-500" /> {log.asset.name}
                          </span>
                        )}
                        {log.employeeName && (
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            👤 {log.employeeName}
                          </span>
                        )}
                      </div>
                    )}
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
