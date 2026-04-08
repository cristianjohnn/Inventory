import { Search } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import HeaderNotifications from './HeaderNotifications.jsx';
import HeaderProfile from './HeaderProfile.jsx';

export default function Header({ isDark, onToggleTheme }) {
  return (
    <header
      className="h-[72px] flex items-center justify-between px-8 lg:px-10 xl:px-12 sticky top-0 z-20 backdrop-blur-lg transition-colors duration-300"
      style={{
        background: 'var(--color-bg-header)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          type="text"
          placeholder="Search assets, tags, employees..."
          className="filter-input w-full !pl-10 pr-10"
        />
        <kbd
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-1.5 py-0.5 rounded border"
          style={{
            color: 'var(--color-text-tertiary)',
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-surface-hover)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-4">
        <HeaderNotifications />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        <HeaderProfile />
      </div>
    </header>
  );
}
