import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Monitor, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets', icon: Monitor, label: 'Assets' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 lg:hidden"
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl transition-all duration-300
          ${collapsed ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Monitor size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100">IT Inventory</h1>
            <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Monitoring System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setCollapsed(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-600">v1.0.0 • Built with ❤️</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
}
