import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import HeaderNotifications from './HeaderNotifications.jsx';
import HeaderProfile from './HeaderProfile.jsx';
import CommandPalette from './CommandPalette.jsx';

export default function Header({ isDark, onToggleTheme }) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Global keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className="h-[72px] flex items-center justify-between px-8 lg:px-10 xl:px-12 sticky top-0 z-20 backdrop-blur-xl transition-colors duration-300 shadow-[0_1px_3px_max(0px,calc(1rem-100vw))*rgba(0,0,0,0.02)]"
        style={{
          background: 'var(--color-bg-header)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Search */}
        <div
          className="relative flex-1 max-w-md ml-12 lg:ml-0 cursor-text group"
          onClick={() => setIsPaletteOpen(true)}
        >
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-hover:text-[var(--accent)] transition-colors"
          />
          <div
            className="w-full flex items-center rounded-xl transition-all duration-200 hover:ring-2 hover:ring-[var(--accent-bg-strong)]"
            style={{ 
              minHeight: '40px',
              paddingLeft: '40px',
              paddingRight: '48px',
              background: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="text-[var(--color-text-secondary)] font-medium text-[13px]">Search assets, tags, employees...</span>
          </div>
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded border shadow-sm"
            style={{
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-surface)',
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6 ml-4">
          <HeaderNotifications />
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <HeaderProfile />
        </div>
      </header>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
