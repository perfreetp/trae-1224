import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  value: string | number;
  label: string;
  action?: ReactNode;
  gradient?: string;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  iconBg = 'bg-mint-100',
  iconColor = 'text-mint-600',
  value,
  label,
  action,
  gradient,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5',
        gradient ? gradient : 'bg-white',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} strokeWidth={2.2} />
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-4">
        <div
          className={cn(
            'text-3xl font-bold tracking-tight',
            gradient ? 'text-white' : 'text-slate-900'
          )}
        >
          {value}
        </div>
        <div
          className={cn(
            'mt-1 text-sm font-medium',
            gradient ? 'text-white/85' : 'text-slate-500'
          )}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
