'use client'

import React from 'react'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useDialogStore } from '@/stores/dialog-store'
import { MessagingInterface } from '@/components/messaging/messaging-interface'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
import { cn } from '@/lib/utils'

function MessagingDialogContent() {
  const { user } = useSupabaseAuth()
  const { isMessagingDialogOpen, closeMessagingDialog, currentConversationId } = useDialogStore()
  const { setMessagingActive, totalUnreadCount } = useOptimizedMessaging()
  const t = useTranslations('messaging')

  // Notify optimized messaging when dialog opens/closes
  React.useEffect(() => {
    setMessagingActive(isMessagingDialogOpen)
  }, [isMessagingDialogOpen, setMessagingActive])

  const handleClose = () => {
    closeMessagingDialog()
  }

  if (!user) return null

  return (
    <Dialog open={isMessagingDialogOpen} onOpenChange={(open) => {
      if (!open) {
        closeMessagingDialog()
      }
    }}>
      <DialogContent className={cn(
        // Mobile: 100% viewport coverage
        "w-full h-full max-w-none max-h-none",
        "fixed inset-0 translate-x-0 translate-y-0",
        "rounded-none",
        // Desktop: Larger dialog with more space
        "sm:w-[90vw] sm:h-[85vh] sm:max-w-[800px] sm:max-h-[700px]",
        "sm:fixed sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
        "sm:rounded-lg",
        // Keep existing flex layout
        "p-0 gap-0 flex flex-col"
      )}>
        <DialogHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
          <DialogTitle className="flex items-center justify-center gap-2 h-10 relative">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.486 2 2 6.262 2 11.5c0 1.91.57 3.759 1.65 5.35L2.184 22l5.432-1.348C9.346 21.542 10.65 22 12 22c5.514 0 10-4.262 10-9.5S17.514 2 12 2z"/>
              </svg>
            </div>
            <span className="text-lg font-semibold">{t('title')}</span>
            {totalUnreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full px-2 py-1 text-xs min-w-[20px] h-5 flex items-center justify-center">
                {totalUnreadCount}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Messaging interface for conversations and direct messages
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessagingInterface 
            conversationId={currentConversationId || undefined}
            onClose={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MessagingDialog() {
  return <MessagingDialogContent />
}
