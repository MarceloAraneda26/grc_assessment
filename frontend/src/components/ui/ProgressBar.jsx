export const ProgressBar = ({ value, height = 6, className = '' }) => (
  <div className={`w-full bg-surface-2 rounded-full overflow-hidden ${className}`} style={{ height }}>
    <div
      className="h-full rounded-full transition-[width] duration-300"
      style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: 'linear-gradient(90deg, var(--blue) 0%, var(--accent-bright) 100%)',
      }}
    />
  </div>
);
