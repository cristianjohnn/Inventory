import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Monitor, Menu, X, FileBarChart, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    title: 'Inventory',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/assets', icon: Monitor, label: 'Assets' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/reports', icon: FileBarChart, label: 'Reports' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop spacer */}
      <div className="hidden lg:block w-[250px] shrink-0" />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
          ${collapsed ? 'w-[250px] translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[250px]'}
        `}
        style={{
          background: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 h-16"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #e86c30, #d45a20)' }}
          >
            IT
          </div>
          <div>
            <h1
              className="text-sm font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              IT Inventory
            </h1>
            <p
              className="text-[10px] tracking-wider uppercase"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Monitoring System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p
                className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setCollapsed(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                      ${isActive ? 'nav-active' : 'nav-inactive'}`
                    }
                    style={({ isActive }) => ({
                      background: isActive ? 'var(--accent-bg-strong)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--color-text-secondary)',
                      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    })}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                    {!true && <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow" />
          <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            v1.0.0 • System Online
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
}
