'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
import { useDialogStore } from '@/stores/dialog-store'

interface OptimizedNotificationCenterProps {
  className?: string
}

export function OptimizedNotificationCenter({ className }: OptimizedNotificationCenterProps) {
  const { 
    totalUnreadCount, 
    isLoading, 
    setMessagingActive,
    hasNotifications
  } = useOptimizedMessaging()
  
  const { openMessagingDialog } = useDialogStore()
  const [isVisible, setIsVisible] = useState(false)

  // Show notification center when there are unread messages
  useEffect(() => {
    setIsVisible(totalUnreadCount > 0 || hasNotifications)
  }, [totalUnreadCount, hasNotifications])

  const handleClick = () => {
    // Tell the messaging system that messaging is now active
    setMessagingActive(true)
    openMessagingDialog()
  }

  if (!isVisible && !isLoading) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative h-9 w-9 rounded-full ${className}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <MessageSquare className="h-7 w-7" />
      
      {/* Unread count badge */}
      {totalUnreadCount > 0 && (
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        </div>
      )}
      
      {/* Notification indicator for non-unread but pending notifications */}
      {totalUnreadCount === 0 && hasNotifications && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
      )}
    </Button>
  )
}

// Hook for components that want to know when messaging is active
export function useMessagingActivity() {
  const { setMessagingActive } = useOptimizedMessaging()
  
  return {
    setMessagingActive
  }
}
