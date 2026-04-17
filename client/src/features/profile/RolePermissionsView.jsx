import { ShieldCheck, Users, Edit, Eye, Trash2, FileBarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const roleConfig = {
  ADMIN: {
    title: 'System Administrator',
    description: 'You have full, unrestricted access to the Inspire Holdings IT Inventory Management System.',
    capabilities: [
      { icon: Edit, text: 'Write and edit all assets and assignments' },
      { icon: FileBarChart, text: 'Depreciate assets and run financial reports' },
      { icon: Users, text: 'System configuration and user management' },
      { icon: Trash2, text: 'Delete assets and manage audit logs' },
    ],
  },
  MANAGER: {
    title: 'Department Manager',
    description: 'You can manage assets and assignments within your department.',
    capabilities: [
      { icon: Edit, text: 'Write and edit assets in your department' },
      { icon: FileBarChart, text: 'View financial reports and depreciation' },
      { icon: Eye, text: 'View all assets across departments (read-only)' },
    ],
  },
  VIEWER: {
    title: 'Viewer',
    description: 'You have read-only access to the inventory system.',
    capabilities: [
      { icon: Eye, text: 'View all assets and assignments' },
      { icon: FileBarChart, text: 'View financial reports and depreciation' },
    ],
  },
};

export default function RolePermissionsView() {
  const { user } = useAuth();
  const role = user?.role || 'VIEWER';
  const config = roleConfig[role] || roleConfig.VIEWER;

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="border-b px-8 py-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>Role & Permissions</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>View your granted access levels across the system.</p>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Active Role */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--accent-bg-strong)] text-[var(--accent)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{config.title}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{config.description}</p>
            <div className="mt-2">
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 rounded-xl border bg-[var(--color-bg-base)]" style={{ borderColor: 'var(--color-border)' }}>
          <h4 className="font-semibold text-sm tracking-wide mb-4" style={{ color: 'var(--color-text-tertiary)' }}>CAPABILITIES OVERVIEW</h4>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {config.capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <Icon size={14} className="opacity-50" />
                  {cap.text}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="flex items-center gap-3 text-xs mt-6" style={{ color: 'var(--color-text-tertiary)' }}>
          <Users size={14} /> To request a role change, please contact InfoSec.
        </div>
      </div>
    </div>
  );
}
