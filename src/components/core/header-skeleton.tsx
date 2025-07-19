import React from 'react';

export function HeaderLoadingSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      {/* Desktop: Full button skeletons */}
      <div className="hidden sm:flex items-center space-x-2">
        {/* Sign In button skeleton */}
        <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
        {/* Register button skeleton */}
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      </div>
      
      {/* Mobile: Icon + Button skeletons */}
      <div className="flex sm:hidden items-center space-x-2">
        {/* Login icon skeleton */}
        <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
        {/* Register button skeleton */}
        <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  );
}

export function AuthenticatedHeaderSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      {/* Post Job button skeleton */}
      <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
      {/* Notification bell skeleton */}
      <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
      {/* User menu skeleton */}
      <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
    </div>
  );
}
