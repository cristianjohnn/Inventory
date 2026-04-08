import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-all duration-300 hover:bg-[var(--color-bg-surface-hover)]"
      style={{ color: 'var(--color-text-secondary)' }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className="transition-transform duration-300"
        style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </div>
    </button>
  );
}
