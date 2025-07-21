import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function JobCardListSkeleton() {
  return (
    <Card className="border-0 bg-white dark:bg-gray-950 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          
          {/* Information Pills */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
          
          {/* Badge Section */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
          
          {/* Apply Button */}
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export function JobCardSkeleton() {
  return (
    <Card className="border-0 bg-white dark:bg-gray-950 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header with company info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
          
          {/* Job Title */}
          <Skeleton className="h-7 w-4/5" />
          
          {/* Information Pills */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
