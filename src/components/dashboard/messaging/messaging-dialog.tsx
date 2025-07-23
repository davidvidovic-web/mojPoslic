'use client'

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useDialogStore } from '@/stores/dialog-store'
import { MessagingProvider, useMessaging } from '@/contexts/messaging-context'
import { ConversationView } from '@/components/messaging/conversation-view'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MessageAttachment, Conversation } from '@/types/messaging'
import { useTranslations } from 'next-intl'

function MessagingDialogContent() {
  const { user } = useAuth()
  const { isMessagingDialogOpen, closeMessagingDialog } = useDialogStore()
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
  
  const {
    state,
    setActiveConversation,
    sendMessage,
    loadMessages,
    sendTypingIndicator,
    archiveConversation,
    markConversationAsRead,
    loadConversations,
  } = useMessaging()

  // Load conversations when dialog opens
  React.useEffect(() => {
    if (isMessagingDialogOpen && user) {
      loadConversations()
    }
  }, [isMessagingDialogOpen, user, loadConversations])

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!state.activeConversation) return
    
    try {
      await sendMessage({
        conversationId: state.activeConversation.id,
        content,
        messageType: attachments && attachments.length > 0 ? 'file' : 'text',
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    markConversationAsRead(conversation.id)
    // Load messages immediately when conversation is selected
    loadMessages(conversation.id)
  }

  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator(isTyping)
  }

  const handleLoadMoreMessages = () => {
    if (state.activeConversation) {
      loadMessages(state.activeConversation.id)
    }
  }

  const handleAttachmentClick = (attachment: MessageAttachment) => {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank')
    }
  }

  const handleArchiveConversation = (conversationId: string) => {
    archiveConversation(conversationId)
  }

  // Calculate total unread count
  const unreadCount = state.conversations.reduce((total, conversation) => {
    return total + (conversation.unread_count || 0)
  }, 0)

  if (!user) return null

  return (
    <Dialog open={isMessagingDialogOpen} onOpenChange={(open) => {
      if (!open) {
        closeMessagingDialog()
      }
    }}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[98vw] xl:max-w-[98vw] 2xl:max-w-[95vw] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] p-0 gap-0 max-w-full w-full h-full sm:w-auto sm:h-auto flex flex-col">
        <DialogHeader className="px-3 py-1 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 h-8">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.486 2 2 6.262 2 11.5c0 1.91.57 3.759 1.65 5.35L2.184 22l5.432-1.348C9.346 21.542 10.65 22 12 22c5.514 0 10-4.262 10-9.5S17.514 2 12 2z"/>
              </svg>
            </div>
            <span className="text-base font-semibold">{t('title')}</span>
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
            conversations={state.conversations}
            selectedConversation={state.activeConversation}
            messages={state.messages}
            currentUserId={user.id}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onLoadMoreMessages={handleLoadMoreMessages}
            onTyping={handleTyping}
            onAttachmentClick={handleAttachmentClick}
            onArchiveConversation={handleArchiveConversation}
            typingUsers={state.typingUsers}
            loading={{
              conversations: state.isLoading,
              messages: state.isLoadingMessages,
            }}
            hasMoreMessages={state.hasMoreMessages}
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
  return (
    <MessagingProvider>
      <MessagingDialogContent />
    </MessagingProvider>
  )
}
