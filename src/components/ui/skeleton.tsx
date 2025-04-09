
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
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="steel-panel p-4 space-y-4">
      <Skeleton className="h-8 w-3/4 bg-space-dark/40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-space-dark/30" />
        <Skeleton className="h-4 w-5/6 bg-space-dark/30" />
        <Skeleton className="h-4 w-4/6 bg-space-dark/30" />
      </div>
      <div className="pt-2 flex justify-between">
        <Skeleton className="h-10 w-24 bg-space-dark/50 rounded-md" />
        <Skeleton className="h-10 w-32 bg-space-dark/50 rounded-md" />
      </div>
    </div>
  )
}

function QuestionRowSkeleton() {
  return (
    <div className="rounded-lg border border-tron-dark/30 bg-tron-black/20 p-4 mb-6 w-full max-w-5xl mx-auto relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-tron/5 before:to-transparent before:rounded-lg before:-z-10 before:blur-md before:translate-y-1 before:translate-x-1">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 bg-tron-dark/30 mb-2" />
          <Skeleton className="h-4 w-1/2 bg-tron-dark/20" />
        </div>
        <div className="flex gap-3 items-center">
          <Skeleton className="h-8 w-24 bg-tron-dark/30 rounded-full" />
          <Skeleton className="h-6 w-28 bg-tron-dark/30" />
          <Skeleton className="h-6 w-20 bg-tron-dark/30" />
        </div>
      </div>
    </div>
  )
}

function QuestionDetailsSkeleton() {
  return (
    <div className="steel-panel h-full space-y-6 p-4">
      <div className="border-b border-space-dark/30 pb-4">
        <Skeleton className="h-8 w-1/2 bg-space-dark/40" />
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-space-dark/30" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 bg-space-dark/40 rounded-full" />
            <Skeleton className="h-7 w-32 bg-space-dark/40 rounded-md" />
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
        <Skeleton className="h-10 w-48 bg-space-dark/40 rounded-md" />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, QuestionRowSkeleton, QuestionDetailsSkeleton }
