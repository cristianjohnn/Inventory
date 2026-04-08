// =============================================
// Constants — labels, colors, options
// =============================================

import {
  Laptop, Monitor, Server, Smartphone, Printer, Globe, Mouse,
  Package, HardDrive, Wifi, Headphones, Tv
} from 'lucide-react';

export const STATUS_OPTIONS = [
  { value: 'IN_USE', label: 'In Use', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', dot: true },
  { value: 'AVAILABLE', label: 'Available', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', dot: false },
  { value: 'UNDER_REPAIR', label: 'Under Repair', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', dot: true },
  { value: 'RETIRED', label: 'Retired', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', dot: false },
];

export const CATEGORY_OPTIONS = [
  { value: 'LAPTOP', label: 'Laptop', icon: Laptop, emoji: '💻' },
  { value: 'MONITOR', label: 'Monitor', icon: Monitor, emoji: '🖥️' },
  { value: 'SERVER', label: 'Server', icon: Server, emoji: '🖧' },
  { value: 'PHONE', label: 'Phone', icon: Smartphone, emoji: '📱' },
  { value: 'PRINTER', label: 'Printer', icon: Printer, emoji: '🖨️' },
  { value: 'NETWORKING', label: 'Networking', icon: Globe, emoji: '🌐' },
  { value: 'PERIPHERAL', label: 'Peripheral', icon: Mouse, emoji: '🖱️' },
  { value: 'STORAGE', label: 'Storage', icon: HardDrive, emoji: '💾' },
  { value: 'DISPLAY', label: 'Display', icon: Tv, emoji: '📺' },
  { value: 'AUDIO', label: 'Audio', icon: Headphones, emoji: '🎧' },
];

export const DEPARTMENT_OPTIONS = [
  { value: 'ADMIN_DEPARTMENT', label: 'Admin Department' },
  { value: 'CORPORATE_DEPARTMENT', label: 'Corporate Department' },
  { value: 'CUSTOMER_CARE', label: 'Customer Care' },
  { value: 'I_TECH', label: 'I-Tech' },
  { value: 'I_WALLET', label: 'I-Wallet' },
  { value: 'IT_DEPARTMENT', label: 'IT Department' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
  { value: 'JOINT_VENTURES', label: 'Joint Ventures' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'SECRETARY', label: 'Secretary' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

export const DEPRECIATION_METHODS = [
  { value: 'STRAIGHT_LINE', label: 'Straight-Line', description: 'Equal cost spread over useful life' },
  { value: 'DOUBLE_DECLINING', label: 'Double Declining Balance', description: 'Accelerated early depreciation' },
  { value: 'UNITS_OF_PRODUCTION', label: 'Units of Production', description: 'Based on actual usage' },
];

export function getStatusConfig(status) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[3];
}

export function getCategoryConfig(category) {
  return CATEGORY_OPTIONS.find((c) => c.value === category) || { value: category, label: category, icon: Package, emoji: '📦' };
}
