export default function ProgressBar({ value, max = 100, color, height = 8, showLabel = false }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  // Auto color based on value if no color provided
  const getAutoColor = (pct) => {
    if (pct > 50) return '#22c55e';
    if (pct > 25) return '#f59e0b';
    if (pct > 10) return '#f97316';
    return '#ef4444';
  };

  const barColor = color || getAutoColor(percent);

  return (
    <div className="relative">
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height,
          background: 'var(--color-border)',
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
            animation: 'progressFill 1s ease-out',
          }}
        />
      </div>
      {showLabel && (
        <span
          className="absolute right-0 -top-5 text-[10px] font-semibold"
          style={{ color: barColor }}
        >
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
