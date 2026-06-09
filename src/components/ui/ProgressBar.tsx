import { cn } from '@/lib/utils';

type ProgressColor = 'mint' | 'coral' | 'sky' | 'lemon' | 'lavender';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  label?: string;
}

const colorMap: Record<ProgressColor, string> = {
  mint: 'from-mint-400 to-mint-600',
  coral: 'from-coral-400 to-coral-600',
  sky: 'from-sky2-400 to-sky2-600',
  lemon: 'from-lemon-400 to-lemon-600',
  lavender: 'from-lavender-400 to-lavender-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'mint',
  showValue = true,
  size = 'md',
  animated = true,
  className,
  label,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between text-xs font-medium">
          {label && <span className="text-slate-600">{label}</span>}
          {showValue && (
            <span className="text-slate-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-slate-100',
          sizeMap[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
            colorMap[color]
          )}
          style={{
            width: `${percentage}%`,
            ['--progress-width' as string]: `${percentage}%`,
            animation: animated ? 'progress-fill 1.2s ease-out both' : 'none',
          }}
        >
          <div className="absolute inset-0 bg-white/30 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
