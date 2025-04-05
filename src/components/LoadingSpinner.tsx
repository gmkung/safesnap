
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  fullPage = false,
  className,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullPage && "min-h-[50vh]",
      className
    )}>
      <div className="relative">
        <div className={cn(
          "animate-spin text-space",
          sizeClasses[size]
        )}>
          <Loader className="h-full w-full" />
        </div>
        <div className={cn(
          "absolute inset-0 animate-pulse opacity-70 blur-sm text-space",
          sizeClasses[size]
        )}>
          <Loader className="h-full w-full" />
        </div>
      </div>
      
      {text && (
        <p className="text-space-light/70 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}
