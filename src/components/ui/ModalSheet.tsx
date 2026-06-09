import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  maxHeight?: string;
  className?: string;
  contentClassName?: string;
  draggable?: boolean;
}

export default function ModalSheet({
  open,
  onClose,
  children,
  title,
  showCloseButton = true,
  maxHeight = 'max-h-[85vh]',
  className,
  contentClassName,
  draggable = true,
}: ModalSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      document.body.style.overflow = 'hidden';
      return () => {
        cancelAnimationFrame(raf);
      };
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleDragStart = (clientY: number) => {
    if (!draggable) return;
    startYRef.current = clientY;
    currentYRef.current = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (clientY: number) => {
    if (startYRef.current === null) return;
    const delta = clientY - startYRef.current;
    if (delta > 0) {
      currentYRef.current = delta;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${delta}px)`;
      }
    }
  };

  const handleDragEnd = () => {
    if (startYRef.current === null) return;
    startYRef.current = null;
    if (sheetRef.current) {
      sheetRef.current.style.transition = '';
      sheetRef.current.style.transform = '';
    }
    if (currentYRef.current > 120) {
      onClose();
    }
    currentYRef.current = 0;
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 mx-auto max-w-md',
          'transition-transform duration-300 ease-out',
          isVisible ? 'translate-y-0' : 'translate-y-full',
          className
        )}
      >
        <div
          className={cn(
            'rounded-t-4xl bg-white/95 backdrop-blur-xl border-t border-x border-white/80 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)]',
            'flex flex-col overflow-hidden',
            maxHeight
          )}
        >
          {draggable && (
            <div
              className="flex shrink-0 justify-center py-3 cursor-grab active:cursor-grabbing select-none touch-none"
              onMouseDown={(e) => handleDragStart(e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
            >
              <div className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>
          )}
          <div className="flex shrink-0 items-center justify-between px-5 pb-2">
            {title ? (
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95"
              >
                <X className="h-4.5 w-4.5" strokeWidth={2.3} />
              </button>
            )}
          </div>
          <div
            className={cn(
              'flex-1 overflow-y-auto px-5 pb-safe-bottom',
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
