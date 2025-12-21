'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useSupabaseRealtimeChat } from '@/hooks/use-supabase-realtime-chat-postgres'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDialogStore } from '@/stores/dialog-store'

interface OptimizedNotificationCenterProps {
  className?: string
  onClick?: () => void
}

export function OptimizedNotificationCenter({ className, onClick }: OptimizedNotificationCenterProps) {
  const { user } = useSupabaseAuth()
  const { openMessagingDialog } = useDialogStore()
  const { 
    totalUnreadCount,
    loading: isLoading
  } = useSupabaseRealtimeChat({
    conversationId: undefined, // Get all conversations for total unread count
    enabled: !!user?.id
  })
  
  const [isVisible, setIsVisible] = useState(false)

  // Show notification center when there are unread messages
  useEffect(() => {
    setIsVisible(totalUnreadCount > 0)
  }, [totalUnreadCount])

  const handleClick = () => {
    // Open the messaging dialog
    openMessagingDialog()
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
      <MessageCircle className="h-7 w-7" />
      
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
