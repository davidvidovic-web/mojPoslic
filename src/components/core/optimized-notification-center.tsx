'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'

interface OptimizedNotificationCenterProps {
  className?: string
  onClick?: () => void
}

export function OptimizedNotificationCenter({ className, onClick }: OptimizedNotificationCenterProps) {
  const { 
    totalUnreadCount, 
    isLoading, 
    setMessagingActive
  } = useOptimizedMessaging()
  
  const [isVisible, setIsVisible] = useState(false)

  // Show notification center when there are unread messages
  useEffect(() => {
    setIsVisible(totalUnreadCount > 0)
  }, [totalUnreadCount])

  const handleClick = () => {
    // Tell the messaging system that messaging is now active
    setMessagingActive(true)
    // Call custom onClick handler if provided
    onClick?.()
  }

  if (!isVisible && !isLoading) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative h-9 w-9 rounded-full ${className || ''}`}
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
