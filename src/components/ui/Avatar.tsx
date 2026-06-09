import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  emoji?: string;
  fallbackText?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  ringColor?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
};

const ringColorMap = {
  mint: 'ring-4 ring-mint-200',
  coral: 'ring-4 ring-coral-300',
  sky: 'ring-4 ring-sky2-200',
};

export default function Avatar({
  src,
  alt = 'avatar',
  emoji,
  fallbackText,
  size = 'md',
  className,
  ring = false,
  ringColor = 'mint',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const renderFallback = () => {
    if (emoji) {
      return <span className="select-none">{emoji}</span>;
    }
    if (fallbackText) {
      return (
        <span className="font-semibold text-white">
          {fallbackText.slice(0, 2).toUpperCase()}
        </span>
      );
    }
    return <User className="h-1/2 w-1/2 text-white" strokeWidth={1.8} />;
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-mint-400 to-mint-600',
        sizeMap[size],
        ring && ringColorMap[ringColor as keyof typeof ringColorMap],
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
}
