import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

// Lazy load the NotificationCenter to improve initial load time
const LazyNotificationCenter = lazy(() => 
  import('@/components/ui/notification-center').then(module => ({
    default: module.NotificationCenter
  }))
);

function NotificationSkeleton() {
  return (
    <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full" disabled>
      <Bell className="h-7 w-7" />
    </Button>
  );
}

export function OptimizedNotificationCenter() {
  return (
    <Suspense fallback={<NotificationSkeleton />}>
      <LazyNotificationCenter />
    </Suspense>
  );
}
