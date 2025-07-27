'use client'

import React from 'react'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useDialogStore } from '@/stores/dialog-store'
import { ConversationView } from '@/components/messaging/conversation-view'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MessageAttachment, Conversation } from '@/types/messaging'
import { useTranslations } from 'next-intl'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
import { useOptimizedConversations } from '@/hooks/use-optimized-conversations'
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime'
import { cn } from '@/lib/utils'

function MessagingDialogContent() {
  const { user } = useSupabaseAuth()
  const { isMessagingDialogOpen, closeMessagingDialog } = useDialogStore()
  const { setMessagingActive, conversations, totalUnreadCount } = useOptimizedMessaging()
  const {
    activeConversation,
    setActiveConversation,
    messages,
    isLoadingMessages,
    canLoadMore,
    loadMoreMessages,
    sendMessage,
    addRealtimeMessage
  } = useOptimizedConversations()
  const t = useTranslations('messaging')
  const [isMobile, setIsMobile] = React.useState(false)
  
  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Notify optimized messaging when dialog opens/closes
  React.useEffect(() => {
    setMessagingActive(isMessagingDialogOpen)
  }, [isMessagingDialogOpen, setMessagingActive])

  // Set up real-time messaging
  useOptimizedRealtime({
    onNewMessage: (message) => {
      addRealtimeMessage(message)
    },
    activeConversationId: activeConversation?.id || null,
    isMessagingActive: isMessagingDialogOpen
  })

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeConversation) return
    
    try {
      await sendMessage({
        conversationId: activeConversation.id,
        content,
        messageType: attachments && attachments.length > 0 ? 'file' : 'text',
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
  }

  const handleTyping = (isTyping: boolean) => {
    // TODO: Implement optimized typing indicator
  }

  const handleLoadMoreMessages = () => {
    if (canLoadMore) {
      loadMoreMessages()
    }
  }

  const handleAttachmentClick = (attachment: MessageAttachment) => {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank')
    }
  }

  const handleArchiveConversation = () => {
    // TODO: Implement archive with optimized system
  }

  // Use total unread count from optimized messaging
  const unreadCount = totalUnreadCount

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
            {unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full px-2 py-1 text-xs min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Messaging interface for conversations and direct messages
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <ConversationView
            conversations={conversations}
            selectedConversation={activeConversation}
            messages={messages}
            currentUserId={user.id}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onLoadMoreMessages={handleLoadMoreMessages}
            onTyping={handleTyping}
            onAttachmentClick={handleAttachmentClick}
            onArchiveConversation={handleArchiveConversation}
            typingUsers={[]} // TODO: Implement with optimized system
            loading={{
              conversations: false, // Handled by optimized messaging
              messages: isLoadingMessages,
            }}
            hasMoreMessages={canLoadMore}
            locale="en"
            className="h-full"
            isMobile={isMobile}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MessagingDialog() {
  return <MessagingDialogContent />
}
