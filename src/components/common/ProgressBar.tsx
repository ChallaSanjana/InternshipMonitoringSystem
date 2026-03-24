interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  size?: 'small' | 'medium';
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  size = 'small'
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const heightClass = size === 'medium' ? 'h-2.5' : 'h-1.5';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 w-32 overflow-hidden rounded-full bg-slate-200 ${heightClass}`}>
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && <span className="whitespace-nowrap text-sm font-semibold text-slate-700">{Math.round(clampedProgress)}%</span>}
    </div>
  );
}
