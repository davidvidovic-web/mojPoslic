'use client'

import { Skeleton } from "@/components/ui/skeleton"

interface JobCardSkeletonProps {
  viewMode?: 'grid' | 'list'
}

export function JobCardSkeleton({ viewMode = 'grid' }: JobCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl p-5 shadow-sm animate-pulse border border-border/40 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <div className="flex flex-col justify-between md:items-end gap-4 min-w-[120px]">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm animate-pulse border border-border/40 h-[280px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      
      <div className="space-y-2 mb-4 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
      
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
