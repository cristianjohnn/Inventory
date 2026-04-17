import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Monitor, Menu, X, FileBarChart, ChevronRight, ChevronLeft, ClipboardList, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

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
  {
    title: 'System',
    items: [
      { to: '/activity-logs', icon: ClipboardList, label: 'Activity Logs' },
    ],
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const desktopWidth = isCollapsed ? 'w-[72px]' : 'w-[250px]';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="sidebar-mobile-toggle lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop spacer — pushes main content right */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${desktopWidth}`} />

      {/* Sidebar panel */}
      <aside
        className={`sidebar-panel ${mobileOpen ? 'w-[250px] translate-x-0' : `-translate-x-full lg:translate-x-0 ${desktopWidth}`}`}
      >
        {/* Logo area */}
        <div className={`sidebar-logo-area ${isCollapsed && !mobileOpen ? 'justify-center px-2' : 'px-5'}`}>
          <div className="sidebar-logo-icon">IT</div>
          {(!isCollapsed || mobileOpen) && (
            <div className="sidebar-logo-text">
              <h1>IT Inventory</h1>
              <p>Monitoring System</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              {(!isCollapsed || mobileOpen) ? (
                <p className="sidebar-section-title">{section.title}</p>
              ) : (
                <div className="sidebar-section-spacer" />
              )}
              <div className="sidebar-nav-items">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed && !mobileOpen ? label : ''}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'active' : ''} ${isCollapsed && !mobileOpen ? 'collapsed' : ''}`
                    }
                  >
                    <Icon size={isCollapsed && !mobileOpen ? 22 : 18} className="shrink-0" />
                    {(!isCollapsed || mobileOpen) && (
                      <span className="sidebar-nav-label">{label}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="sidebar-collapse-toggle hidden lg:flex">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-collapse-btn"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {(!isCollapsed) && <span>Collapse</span>}
          </button>
        </div>

        {/* Footer */}
        <div className={`sidebar-footer ${isCollapsed && !mobileOpen ? 'justify-center px-2' : 'px-5'}`}>
          <div className="sidebar-status-dot" />
          {(!isCollapsed || mobileOpen) && (
            <p className="sidebar-footer-text">v1.0.0 • System Online</p>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
