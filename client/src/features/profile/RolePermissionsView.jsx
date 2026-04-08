import { ShieldCheck, Users } from 'lucide-react';

export default function RolePermissionsView() {
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
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>System Administrator</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              You have full, unrestricted access to the Inspire Holdings IT Inventory Management System.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 rounded-xl border bg-[var(--color-bg-base)]" style={{ borderColor: 'var(--color-border)' }}>
          <h4 className="font-semibold text-sm tracking-wide mb-4" style={{ color: 'var(--color-text-tertiary)' }}>CAPABILITIES OVERVIEW</h4>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Write and Edit all assets and assignments
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Depreciate assets and run financial reports
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> System configuration and user management
            </li>
          </ul>
        </div>
        
        <div className="flex items-center gap-3 text-xs mt-6" style={{ color: 'var(--color-text-tertiary)' }}>
          <Users size={14} /> To request a role downgrade, please contact InfoSec.
        </div>
      </div>
    </div>
  );
}
