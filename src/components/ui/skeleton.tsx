
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  glowing?: boolean;
}

function Skeleton({
  className,
  glowing = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted relative overflow-hidden", 
        glowing && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-light-reflect",
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="steel-panel p-4 space-y-4 rounded-lg animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/3 bg-space-dark/40" glowing />
        <Skeleton className="h-6 w-24 rounded-full bg-space-dark/40" glowing />
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-1/3 bg-space-dark/30" />
          <Skeleton className="h-6 w-full bg-space-dark/30" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-1/3 bg-space-dark/30" />
          <Skeleton className="h-6 w-full bg-space-dark/30" />
        </div>
      </div>
      <div className="pt-2 flex gap-4">
        <Skeleton className="h-4 w-24 bg-space-dark/20" />
        <Skeleton className="h-4 w-20 bg-space-dark/20" />
      </div>
      <div className="pt-3 mt-3 border-t border-space-dark/30 flex justify-end">
        <Skeleton className="h-8 w-28 bg-space-dark/40 rounded-md" glowing />
      </div>
    </div>
  )
}

function QuestionDetailsSkeleton() {
  return (
    <div className="steel-panel h-full space-y-6 p-4">
      <div className="border-b border-space-dark/30 pb-4">
        <Skeleton className="h-8 w-1/2 bg-space-dark/40" glowing />
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-space-dark/30" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 bg-space-dark/40 rounded-full" glowing />
            <Skeleton className="h-7 w-32 bg-space-dark/40 rounded-md" glowing />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-space-dark/30" />
          <Skeleton className="h-6 w-3/4 bg-space-dark/30" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-space-dark/30" />
          <Skeleton className="h-6 w-32 bg-space-dark/30" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-space-dark/30" />
          <Skeleton className="h-6 w-32 bg-space-dark/30" />
        </div>
      </div>
      
      <div className="pt-4">
        <Skeleton className="h-10 w-48 bg-space-dark/40 rounded-md" glowing />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, QuestionDetailsSkeleton }
