import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Monitor, ClipboardList, ArrowRight, X, Laptop, Server, Smartphone, Printer, Globe, Mouse, HardDrive, Tv, Headphones } from 'lucide-react';
import { searchApi } from '../../api/client.js';

const categoryIcons = {
  LAPTOP: Laptop, MONITOR: Monitor, SERVER: Server, PHONE: Smartphone,
  PRINTER: Printer, NETWORKING: Globe, PERIPHERAL: Mouse,
  STORAGE: HardDrive, DISPLAY: Tv, AUDIO: Headphones,
};

const statusColors = {
  IN_USE: '#22c55e', AVAILABLE: '#3b82f6', UNDER_REPAIR: '#f59e0b', RETIRED: '#6b7280',
};

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ assets: [], activityLogs: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ assets: [], activityLogs: [] });
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ assets: [], activityLogs: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchApi.query(query);
        setResults(result.data);
        setSelectedIndex(0);
      } catch {
        setResults({ assets: [], activityLogs: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // All navigable items
  const allItems = [
    ...results.assets.map(a => ({ type: 'asset', data: a })),
    ...results.activityLogs.map(l => ({ type: 'log', data: l })),
  ];

  const handleSelect = useCallback((item) => {
    onClose();
    if (item.type === 'asset') {
      navigate(`/assets/${item.data.id}`);
    } else if (item.type === 'log') {
      navigate('/activity-logs');
    }
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(allItems[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, allItems, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  const hasResults = allItems.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden animate-scale-in"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={18} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, activity logs, departments..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-[var(--color-bg-surface-hover)]">
              <X size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            </button>
          )}
          <kbd className="text-[10px] font-semibold px-1.5 py-0.5 rounded border" style={{ color: 'var(--color-text-tertiary)', borderColor: 'var(--color-border)' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !query || query.length < 2 ? (
            <div className="py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Type at least 2 characters to search
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              No results found for "{query}"
            </div>
          ) : (
            <>
              {/* Assets */}
              {results.assets.length > 0 && (
                <div>
                  <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-bg-surface-hover)' }}>
                    Assets ({results.assets.length})
                  </p>
                  {results.assets.map((asset, idx) => {
                    const Icon = categoryIcons[asset.category] || Monitor;
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={asset.id}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--color-bg-surface-hover)]'}`}
                        onClick={() => handleSelect({ type: 'asset', data: asset })}
                      >
                        <div className="p-1.5 rounded-md shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{asset.name}</p>
                          <p className="text-[10px] flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)' }}>
                            <span className="font-mono">{asset.assetTag}</span>
                            {asset.assignedEmployee && <span>• {asset.assignedEmployee}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[asset.status] || '#6b7280' }} />
                          <ArrowRight size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activity Logs */}
              {results.activityLogs.length > 0 && (
                <div>
                  <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-bg-surface-hover)' }}>
                    Activity Logs ({results.activityLogs.length})
                  </p>
                  {results.activityLogs.map((log, idx) => {
                    const globalIdx = results.assets.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <div
                        key={log.id}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--color-bg-surface-hover)]'}`}
                        onClick={() => handleSelect({ type: 'log', data: log })}
                      >
                        <div className="p-1.5 rounded-md shrink-0" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                          <ClipboardList size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{log.action}</p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                            {log.details} • {log.userName}
                          </p>
                        </div>
                        <ArrowRight size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {hasResults && (
          <div className="px-5 py-2 border-t flex items-center gap-4 text-[10px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}>
            <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>↵</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>esc</kbd> Close</span>
          </div>
        )}
      </div>
    </div>
  );
}
