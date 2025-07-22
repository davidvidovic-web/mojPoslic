'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MessagingProvider, useMessaging } from '@/contexts/messaging-context'
import { ConversationView } from '@/components/messaging/conversation-view'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import { MessageAttachment, Conversation } from '@/types/messaging'
import { useTranslations } from 'next-intl'

function MessagingDialogContent() {
  const { user } = useAuth()
  const t = useTranslations('messaging')
  const [open, setOpen] = useState(false)
  
  const {
    state,
    setActiveConversation,
    sendMessage,
    loadMessages,
    sendTypingIndicator,
    archiveConversation,
    markConversationAsRead,
  } = useMessaging()

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t('title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl sm:h-[600px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('title')}
            {unreadCount > 0 && (
              <Badge className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-0 rounded-xl px-2 py-1 text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
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
