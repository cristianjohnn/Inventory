import { Package } from 'lucide-react';

export default function EmptyState({ icon: Icon = Package, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
      >
        <Icon size={28} />
      </div>
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      {message && (
        <p
          className="text-sm max-w-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
