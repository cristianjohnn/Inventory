export default function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`rounded-lg bg-zinc-800 ${className}`}
      style={{
        width,
        height: height || '1rem',
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <Skeleton width="40%" height="0.75rem" className="mb-3" />
      <Skeleton width="60%" height="1.5rem" className="mb-2" />
      <Skeleton width="30%" height="0.75rem" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50">
      <Skeleton width="2rem" height="2rem" className="rounded-full" />
      <Skeleton width="25%" height="0.875rem" />
      <Skeleton width="15%" height="0.875rem" />
      <Skeleton width="10%" height="1.5rem" className="rounded-full" />
      <Skeleton width="15%" height="0.875rem" className="ml-auto" />
    </div>
  );
}
