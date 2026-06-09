import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export default function EmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className
      )}
    >
      <div className="mb-5 text-6xl animate-bounce-soft">{emoji}</div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant ?? 'primary'}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
