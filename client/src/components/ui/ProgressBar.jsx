export default function ProgressBar({ value, max = 100, color = '#10b981', height = 8 }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className="w-full rounded-full overflow-hidden bg-zinc-800"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          animation: 'progressFill 1s ease-out',
        }}
      />
    </div>
  );
}
