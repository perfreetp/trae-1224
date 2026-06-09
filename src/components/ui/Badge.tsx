import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'vaccinated'
  | 'pending'
  | 'overdue';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-coral-50 text-coral-600 border-coral-200',
  info: 'bg-sky2-50 text-sky2-600 border-sky2-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  mild: 'bg-mint-50 text-mint-600 border-mint-200',
  moderate: 'bg-lemon-50 text-amber-700 border-lemon-300',
  severe: 'bg-coral-50 text-coral-600 border-coral-200',
  vaccinated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-coral-50 text-coral-600 border-coral-200',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-coral-500',
  info: 'bg-sky2-500',
  neutral: 'bg-slate-400',
  mild: 'bg-mint-500',
  moderate: 'bg-lemon-500',
  severe: 'bg-coral-500',
  vaccinated: 'bg-emerald-500',
  pending: 'bg-amber-500',
  overdue: 'bg-coral-500',
};

export default function Badge({
  variant = 'neutral',
  children,
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
