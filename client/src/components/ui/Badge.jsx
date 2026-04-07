import { getStatusConfig } from '../../utils/constants.js';

export default function Badge({ status, children }) {
  if (status) {
    const config = getStatusConfig(status);
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
        style={{ color: config.color, backgroundColor: config.bg }}
      >
        {config.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
      {children}
    </span>
  );
}
