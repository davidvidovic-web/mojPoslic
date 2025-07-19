import React, { Suspense } from 'react'
import { Header } from './header'

// Skeleton component for header loading state
function HeaderSkeleton() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo skeleton */}
          <div className="flex items-center">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          
          {/* Navigation skeleton */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          
          {/* User area skeleton */}
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}

// Optimized header with Suspense boundary to handle loading states gracefully
export function OptimizedHeader() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <Header />
    </Suspense>
  )
}
