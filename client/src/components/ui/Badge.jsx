import { getStatusConfig } from '../../utils/constants.js';

export default function Badge({ status, children }) {
  if (status) {
    const config = getStatusConfig(status);
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
        style={{ color: config.color, backgroundColor: config.bg }}
      >
        {config.dot && (
          <span
            className="status-dot pulse"
            style={{ backgroundColor: config.color }}
          />
        )}
        {config.label}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold"
      style={{
        background: 'var(--color-bg-surface-hover)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {children}
    </span>
  );
}
