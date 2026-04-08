import { useEffect, useState, useRef } from 'react';

/**
 * Circular SVG gauge for depreciation percentage.
 * Animated on mount, color transitions green→amber→red based on value.
 */
export default function DepreciationGauge({ value, size = 140, strokeWidth = 10, label }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, animatedValue));
  const offset = circumference - (percent / 100) * circumference;

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  // Color based on percentage
  const getColor = (pct) => {
    if (pct > 50) return '#22c55e';
    if (pct > 25) return '#f59e0b';
    if (pct > 10) return '#f97316';
    return '#ef4444';
  };

  const color = getColor(percent);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Value circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {Math.round(value)}%
        </span>
        {label && (
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
