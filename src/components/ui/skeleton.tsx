
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
        "animate-pulse rounded-md bg-gray-200 relative overflow-hidden", 
        glowing && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-light-reflect",
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="border p-4 space-y-4 rounded-lg shadow-md">
      <Skeleton className="h-8 w-3/4 bg-gray-200" glowing />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-gray-200" />
        <Skeleton className="h-4 w-5/6 bg-gray-200" />
        <Skeleton className="h-4 w-4/6 bg-gray-200" />
      </div>
      <div className="pt-2 flex justify-between">
        <Skeleton className="h-10 w-24 bg-gray-200 rounded-md" glowing />
        <Skeleton className="h-10 w-32 bg-gray-200 rounded-md" glowing />
      </div>
    </div>
  )
}

function QuestionRowSkeleton() {
  return (
    <div className="rounded-lg border shadow-md p-4 mb-3 w-full max-w-5xl mx-auto bg-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 bg-gray-200 mb-2" />
          <Skeleton className="h-4 w-1/2 bg-gray-200" />
        </div>
        <div className="flex gap-3 items-center">
          <Skeleton className="h-8 w-24 bg-gray-200 rounded-full" glowing />
          <Skeleton className="h-6 w-28 bg-gray-200" />
          <Skeleton className="h-6 w-20 bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

function QuestionDetailsSkeleton() {
  return (
    <div className="border h-full space-y-6 p-4 rounded-lg shadow-md bg-white">
      <div className="border-b border-gray-200 pb-4">
        <Skeleton className="h-8 w-1/2 bg-gray-200" glowing />
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-gray-200" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 bg-gray-200 rounded-full" glowing />
            <Skeleton className="h-7 w-32 bg-gray-200 rounded-md" glowing />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-gray-200" />
          <Skeleton className="h-6 w-3/4 bg-gray-200" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-gray-200" />
          <Skeleton className="h-6 w-32 bg-gray-200" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 bg-gray-200" />
          <Skeleton className="h-6 w-32 bg-gray-200" />
        </div>
      </div>
      
      <div className="pt-4">
        <Skeleton className="h-10 w-48 bg-gray-200 rounded-md" glowing />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, QuestionRowSkeleton, QuestionDetailsSkeleton }
