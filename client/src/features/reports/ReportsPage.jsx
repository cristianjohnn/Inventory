import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FileBarChart, Download, TrendingDown, PhilippinePeso, Calendar, Package
} from 'lucide-react';
import { dashboardApi } from '../../api/client.js';
import { assetsApi } from '../../api/client.js';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters.js';
import { getCategoryConfig, DEPARTMENT_OPTIONS, DEPRECIATION_METHODS } from '../../utils/constants.js';
import { exportToCsv } from '../../utils/exportCsv.js';
import { exportToPdf } from '../../utils/exportPdf.js';
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';

// Chart Tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [dashData, setDashData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashResult, assetResult] = await Promise.all([
          dashboardApi.get(),
          assetsApi.list({ pageSize: 500 }),
        ]);
        setDashData(dashResult.data);
        setAssets(assetResult.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton width="200px" height="32px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <Skeleton width="100%" height="400px" className="card" />
      </div>
    );
  }

  if (!dashData) {
    return <EmptyState icon={FileBarChart} title="Unable to load reports" message="Please try again later." />;
  }

  const { portfolio, categoryValues } = dashData;

  // Department distribution
  const deptCounts = {};
  assets.forEach(a => {
    const deptLabel = a.department
      ? (DEPARTMENT_OPTIONS.find(d => d.value === a.department)?.label || a.department)
      : 'Unassigned';
    deptCounts[deptLabel] = (deptCounts[deptLabel] || 0) + 1;
  });
  const deptData = Object.entries(deptCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Depreciation method distribution
  const methodCounts = {};
  assets.forEach(a => {
    const mLabel = DEPRECIATION_METHODS.find(m => m.value === a.depreciationMethod)?.label || a.depreciationMethod;
    methodCounts[mLabel] = (methodCounts[mLabel] || 0) + 1;
  });
  const methodData = Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
  const methodColors = ['#e86c30', '#f97316', '#fb923c', '#fdba74'];

  // Depreciation schedule (top 15 assets sorted by monthly depreciation)
  const schedule = [...assets]
    .filter(a => a.depreciation.monthlyDepreciation > 0)
    .sort((a, b) => b.depreciation.monthlyDepreciation - a.depreciation.monthlyDepreciation)
    .slice(0, 15);

  // Category value chart
  const catBarData = Object.entries(categoryValues).map(([cat, vals]) => ({
    name: cat.charAt(0) + cat.slice(1).toLowerCase(),
    original: Math.round(vals.original),
    current: Math.round(vals.current),
    depreciated: Math.round(vals.original - vals.current),
  })).sort((a, b) => b.original - a.original);

  // Warranty Status
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const warrantyCounts = { Active: 0, ExpiringSoon: 0, Expired: 0, None: 0 };
  
  assets.forEach(a => {
    if (!a.warrantyExpiry) {
      warrantyCounts.None++;
    } else {
      const exp = new Date(a.warrantyExpiry);
      if (exp < now) warrantyCounts.Expired++;
      else if (exp <= thirtyDays) warrantyCounts.ExpiringSoon++;
      else warrantyCounts.Active++;
    }
  });
  
  const warrantyData = [
    { name: 'Active', value: warrantyCounts.Active, color: '#10b981' },
    { name: 'Expiring <30d', value: warrantyCounts.ExpiringSoon, color: '#f59e0b' },
    { name: 'Expired', value: warrantyCounts.Expired, color: '#f43f5e' },
    { name: 'No Warranty', value: warrantyCounts.None, color: '#525252' },
  ].filter(d => d.value > 0);

  // Asset Age Distribution
  const ageBuckets = { '< 1 Year': 0, '1-2 Years': 0, '3-5 Years': 0, '5+ Years': 0 };
  assets.forEach(a => {
    if (!a.purchaseDate) return;
    const ageYears = (now - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYears < 1) ageBuckets['< 1 Year']++;
    else if (ageYears < 3) ageBuckets['1-2 Years']++;
    else if (ageYears <= 5) ageBuckets['3-5 Years']++;
    else ageBuckets['5+ Years']++;
  });
  const ageData = Object.entries(ageBuckets).map(([name, count]) => ({ name, count }));

  const handleExportSchedule = () => {
    exportToCsv(schedule.map(a => ({
      name: a.name,
      assetTag: a.assetTag,
      purchasePrice: a.purchasePrice,
      currentValue: a.depreciation.currentValue,
      monthlyDepreciation: a.depreciation.monthlyDepreciation,
      percentRemaining: a.depreciation.percentRemaining,
      monthsRemaining: a.depreciation.monthsRemaining,
      method: a.depreciationMethod,
    })), `depreciation-schedule-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Reports & Analytics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            Financial depreciation reports and asset distribution
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={() => exportToCsv(assets, `full-report-${new Date().toISOString().split('T')[0]}.csv`)} 
            className="btn btn-secondary flex-1 sm:flex-none justify-center text-xs h-9"
          >
            <Download size={14} className="mr-1" /> CSV
          </button>
          <button 
            onClick={() => exportToPdf(assets, `full-report-${new Date().toISOString().split('T')[0]}.pdf`)} 
            className="btn btn-primary flex-1 sm:flex-none justify-center text-xs h-9"
          >
            <FileBarChart size={14} className="mr-1" /> PDF Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <PhilippinePeso size={18} />
            </div>
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
              Original Investment
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {formatCurrency(portfolio.totalOriginalValue)}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <TrendingDown size={18} />
            </div>
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
              Total Depreciated
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            -{formatCurrency(portfolio.totalDepreciated)}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <Package size={18} />
            </div>
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
              Net Book Value
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {formatCurrency(portfolio.totalCurrentValue)}
          </p>
          <div className="mt-2">
            <ProgressBar
              value={(portfolio.totalCurrentValue / portfolio.totalOriginalValue) * 100}
              height={4}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Value Comparison */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Value by Category
            </h3>
          </div>
          <div className="p-5" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₱${v / 1000}k`} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-bg-surface-hover)' }} wrapperStyle={{ outline: 'none' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="original" name="Original" fill="#404040" radius={[3, 3, 0, 0]} activeBar={false} />
                <Bar dataKey="current" name="Current" fill="#e86c30" radius={[3, 3, 0, 0]} activeBar={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Department Distribution
            </h3>
          </div>
          <div className="p-5" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-bg-surface-hover)' }} wrapperStyle={{ outline: 'none' }} />
                <Bar dataKey="count" name="Assets" fill="#e86c30" radius={[0, 4, 4, 0]} barSize={18} activeBar={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Depreciation Method + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Method Distribution */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Depreciation Methods
            </h3>
          </div>
          <div className="p-5">
            <div style={{ height: 200 }} className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                    {methodData.map((_, i) => <Cell key={i} fill={methodColors[i % methodColors.length]} />)}
                  </Pie>
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
                        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                        {payload[0].name}: {payload[0].value}
                      </div>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {methodData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: methodColors[i % methodColors.length] }} />
                  <span className="flex-1" style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depreciation Schedule Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Depreciation Schedule (Top 15)
            </h3>
            <button onClick={handleExportSchedule} className="btn btn-secondary text-xs">
              <Download size={13} /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Purchase Price</th>
                  <th>Current Value</th>
                  <th>Monthly Dep.</th>
                  <th>Remaining</th>
                  <th>Months Left</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {asset.name}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                        {asset.assetTag}
                      </p>
                    </td>
                    <td className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatCurrency(asset.purchasePrice)}
                    </td>
                    <td className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(asset.depreciation.currentValue)}
                    </td>
                    <td className="text-xs font-medium" style={{ color: '#ef4444' }}>
                      -{formatCurrency(asset.depreciation.monthlyDepreciation)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 w-24">
                        <ProgressBar value={asset.depreciation.percentRemaining} height={4} />
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                          {formatPercent(asset.depreciation.percentRemaining)}
                        </span>
                      </div>
                    </td>
                    <td className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {asset.depreciation.monthsRemaining}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Warranty & Age Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 mt-6">
        {/* Warranty Status */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Warranty Status
            </h3>
          </div>
          <div className="p-5 flex flex-col sm:flex-row items-center gap-6" style={{ height: 280 }}>
            <div className="flex-1 w-full relative" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={warrantyData} innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {warrantyData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
                        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                        <span className="font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].name}</span>
                        : {payload[0].value} assets
                      </div>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {assets.length}
                </span>
                <span className="text-[10px] uppercase font-semibold mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Total</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-3">
              {warrantyData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ background: item.color }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Age Distribution */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Asset Age (Years)
            </h3>
          </div>
          <div className="p-5" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{fill: 'var(--color-bg-surface-hover)'}} wrapperStyle={{ outline: 'none' }} />
                <Bar dataKey="count" name="Assets" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} activeBar={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
