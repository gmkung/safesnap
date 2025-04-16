
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-space-dark/50", className)}
      {...props}
    />
  )
}

function QuestionRowSkeleton() {
  return (
    <div className="border border-space-dark/30 rounded-md p-4 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[250px]" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[70px]" />
          <Skeleton className="h-8 w-[100px] rounded-full" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
    </div>
  )
}

function QuestionDetailsSkeleton() {
  return (
    <div className="h-full relative overflow-hidden animate-pulse">
      <dl className="grid grid-cols-1 gap-4 p-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-[120px] mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
        <div className="flex space-x-4 mt-2">
          <Skeleton className="h-9 w-[150px] rounded-md" />
        </div>
      </dl>
      <div className="border-t border-space-dark/30 p-4 relative">
        <dl className="grid grid-cols-1 gap-4">
          <div>
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-[150px] mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        </dl>
      </div>
    </div>
  )
}

export { Skeleton, QuestionRowSkeleton, QuestionDetailsSkeleton }
