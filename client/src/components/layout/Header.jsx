import { Search } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle.jsx';

export default function Header({ isDark, onToggleTheme, searchValue, onSearchChange }) {
  return (
    <header className="h-16 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-[#0f172a]/60 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm backdrop-blur-md transition-colors duration-300">
      {/* Search spacer to keep layout aligned */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0">
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
