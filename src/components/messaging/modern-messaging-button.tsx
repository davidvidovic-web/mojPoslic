'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import { useSupabaseRealtimeChat } from '@/hooks/use-supabase-realtime-chat'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDialogStore } from '@/stores/dialog-store'

interface ModernMessagingButtonProps {
  conversationId?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  children?: React.ReactNode
  iconOnly?: boolean
}

export function ModernMessagingButton({
  conversationId,
  variant = 'default',
  size = 'default',
  className,
  children,
  iconOnly = false
}: ModernMessagingButtonProps) {
  const { user } = useSupabaseAuth()
  const { openMessagingDialog } = useDialogStore()
  
  const { totalUnreadCount } = useSupabaseRealtimeChat({
    conversationId,
    enabled: !!user?.id
  })

  const handleClick = () => {
    openMessagingDialog(conversationId)
  }

  if (!user) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`relative ${className || ''}`}
    >
      {iconOnly ? (
        <>
          <MessageCircle className="h-4 w-4" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 text-xs h-5 min-w-[20px] px-1 flex items-center justify-center"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {children || 'Message'}
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-xs h-5 min-w-[20px] px-1">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </div>
      )}
    </Button>
  )
}
