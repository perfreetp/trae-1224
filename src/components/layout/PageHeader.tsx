import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  gradient?: string;
}

export default function PageHeader({
  title,
  subtitle,
  children,
  className,
  gradient = 'from-mint-400 via-mint-500 to-sky2-500',
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden px-5 pt-6 pb-8',
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-95',
          gradient
        )}
      />
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-white/85">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        )}
      </div>
    </header>
  );
}
