import { Search } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle.jsx';

export default function Header({ isDark, onToggleTheme, searchValue, onSearchChange }) {
  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search assets... (Ctrl+K)"
          value={searchValue || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          id="global-search"
          className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
