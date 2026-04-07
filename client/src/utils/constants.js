// =============================================
// Constants — labels, colors, options
// =============================================

export const STATUS_OPTIONS = [
  { value: 'IN_USE', label: 'In Use', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { value: 'AVAILABLE', label: 'Available', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { value: 'UNDER_REPAIR', label: 'Under Repair', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { value: 'RETIRED', label: 'Retired', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
];

export const CATEGORY_OPTIONS = [
  { value: 'LAPTOP', label: 'Laptop', icon: '💻' },
  { value: 'MONITOR', label: 'Monitor', icon: '🖥️' },
  { value: 'SERVER', label: 'Server', icon: '🖧' },
  { value: 'PHONE', label: 'Phone', icon: '📱' },
  { value: 'PRINTER', label: 'Printer', icon: '🖨️' },
  { value: 'NETWORKING', label: 'Networking', icon: '🌐' },
  { value: 'PERIPHERAL', label: 'Peripheral', icon: '🖱️' },
];

export const DEPRECIATION_METHODS = [
  { value: 'STRAIGHT_LINE', label: 'Straight-Line' },
  { value: 'DOUBLE_DECLINING', label: 'Double Declining Balance' },
  { value: 'UNITS_OF_PRODUCTION', label: 'Units of Production' },
];

export function getStatusConfig(status) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[3];
}

export function getCategoryConfig(category) {
  return CATEGORY_OPTIONS.find((c) => c.value === category) || { value: category, label: category, icon: '📦' };
}
