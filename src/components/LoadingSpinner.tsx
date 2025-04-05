
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
  text?: string;
  variant?: 'default' | 'pulse' | 'scanner';
}

export default function LoadingSpinner({ 
  size = 'md', 
  fullPage = false,
  className,
  text,
  variant = 'default'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'scanner') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 relative",
        fullPage && "min-h-[50vh]",
        className
      )}>
        <div className="relative w-40 h-40 rounded-lg bg-space-dark/30 border border-space/30 overflow-hidden">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-px">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="bg-space/5 animate-grid-pulse" style={{ animationDelay: `${i * 0.05}s` }}></div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "text-space",
              sizeClasses[size]
            )}>
              <Loader className="h-full w-full animate-spin" />
            </div>
          </div>
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-x-0 h-8 bg-gradient-to-r from-space/0 via-space/30 to-space/0 animate-scanner-line"></div>
          </div>
        </div>
        
        {text && (
          <p className="text-space/80 text-sm mt-4 animate-pulse font-mono tracking-wider">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullPage && "min-h-[50vh]",
        className
      )}>
        <div className="relative bg-space-dark/20 p-5 rounded-lg border border-space/20">
          <div className="absolute inset-0 rounded-lg animate-pulse opacity-10 bg-space"></div>
          <div className={cn(
            "animate-spin text-space relative z-10",
            sizeClasses[size]
          )}>
            <Loader className="h-full w-full" />
          </div>
        </div>
        
        {text && (
          <p className="text-space/80 text-sm mt-2 animate-pulse font-mono tracking-wider">{text}</p>
        )}
      </div>
    );
  }

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
        <p className="text-space-light/70 text-sm animate-pulse font-mono tracking-wider">{text}</p>
      )}
    </div>
  );
}
