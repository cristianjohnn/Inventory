import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * 3-dot dropdown action menu for table rows.
 * Closes on click outside or Escape.
 */
export default function ActionMenu({ items = [], onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg hover:bg-[var(--color-bg-surface-hover)] transition-colors"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border shadow-lg animate-scale-in"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          <div className="py-1">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onAction?.(item.action);
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-surface-hover)] transition-colors"
                style={{ color: item.danger ? '#ef4444' : 'var(--color-text-primary)' }}
              >
                {item.icon && <item.icon size={14} />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
