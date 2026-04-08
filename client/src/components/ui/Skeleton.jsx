export default function Skeleton({ width = '100%', height = '20px', className = '' }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--color-border) 25%, var(--color-bg-surface-hover) 50%, var(--color-border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton width="60%" height="14px" />
      <Skeleton width="80%" height="28px" />
      <Skeleton width="40%" height="12px" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-2">
      <Skeleton width="32px" height="32px" className="rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height="14px" />
        <Skeleton width="40%" height="10px" />
      </div>
      <Skeleton width="60px" height="24px" className="rounded-md" />
    </div>
  );
}
