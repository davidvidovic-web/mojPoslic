'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSupabaseRealtimeChat } from '@/hooks/use-supabase-realtime-chat-postgres'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDialogStore } from '@/stores/dialog-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, ArrowLeft, Users, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

// Hook to safely use translations with fallbacks
function useMessagingTranslations() {
  try {
    const t = useTranslations('messaging')
    return {
      t,
      hasTranslations: true
    }
  } catch {
    // Return a mock function with fallbacks when translations are not available
    return {
      t: (key: string) => {
        const fallbacks: Record<string, string> = {
          'title': 'Messages',
          'auth.signInRequired': 'Please sign in to access messaging',
          'error.general': 'An error occurred',
          'actions.close': 'Close',
          'actions.tryAgain': 'Try Again',
          'conversation.defaultTitle': 'Conversation',
          'conversations.noConversations': 'No conversations yet. Start messaging from your job applications.',
          'conversationTypes.jobChat': 'Razgovor o prijavi za posao',
          'messages.noMessages': 'No messages yet. Start the conversation!',
          'messages.typeMessage': 'Type your message...',
          'messages.typing.single': 'Someone is typing...',
          'messages.typing.multiple': '{count} people are typing...',
          'messages.justNow': 'Upravo sada',
          'messages.minutesAgo': 'prije {count}min',
          'messages.hoursAgo': 'prije {count}h',
          'messages.today': 'danas',
          'messages.yesterday': 'jučer'
        }
        return fallbacks[key] || key
      },
      hasTranslations: false
    }
  }
}

interface UnifiedMessagingInterfaceProps {
  conversationId?: string
  onClose?: () => void
  className?: string
}

export function UnifiedMessagingInterface({ 
  conversationId, 
  onClose, 
  className 
}: UnifiedMessagingInterfaceProps) {
  const { user } = useSupabaseAuth()
  const { currentConversationId, openMessagingDialog } = useDialogStore()
  const { t } = useMessagingTranslations()
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use conversationId from props or dialog store
  const activeConversationId = conversationId || currentConversationId
  const [showConversationList, setShowConversationList] = useState(!activeConversationId)

  // Hook for all conversations (to get totalUnreadCount and conversations list)
  const {
    conversations,
    totalUnreadCount,
    clearError: clearGlobalError
  } = useSupabaseRealtimeChat({
    conversationId: undefined, // Get all conversations
    enabled: !!user?.id
  })

  // Hook for specific conversation messages (when a conversation is active)
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    clearError: clearMessagesError
  } = useSupabaseRealtimeChat({
    conversationId: activeConversationId || undefined,
    enabled: !!user?.id && !!activeConversationId
  })

  // Combine loading states and errors
  const loading = messagesLoading
  const error = messagesError
  const clearError = () => {
    clearGlobalError()
    clearMessagesError()
  }

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Small delay to ensure DOM updates
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages])

  // Handle back to conversation list
  const handleBackToList = () => {
    setShowConversationList(true)
    if (!conversationId && currentConversationId) {
      openMessagingDialog(undefined)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (convId: string) => {
    setShowConversationList(false)
    if (!conversationId) {
      openMessagingDialog(convId)
    }
  }

  // Group messages by sender and date for better UI
  const messageGroups = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1]
      const showHeader = !prevMessage || 
        prevMessage.sender_id !== message.sender_id ||
        new Date(message.created_at).getDate() !== new Date(prevMessage.created_at).getDate()
      
      return {
        ...message,
        showHeader,
        isOwn: message.sender_id === user?.id
      }
    })
  }, [messages, user?.id])

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || loading || !activeConversationId) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsTyping(false)
    stopTyping()

    try {
      await sendMessage(messageContent)
      // Focus back on input
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore message on error
      setNewMessage(messageContent)
    }
  }

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)
    
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      startTyping()
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      stopTyping()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Format time for messages
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return t('messages.justNow')
    if (diffInMinutes < 60) return t('messages.minutesAgo', { count: diffInMinutes })
    if (diffInMinutes < 1440) return t('messages.hoursAgo', { count: Math.floor(diffInMinutes / 60) })
    
    return date.toLocaleDateString()
  }

  // Format date for conversation list
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffInDays === 1) return t('messages.yesterday')
    if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (!user) {
    return (
      <div className={cn('flex items-center justify-center h-96 border rounded-lg', className)}>
        <p className="text-muted-foreground">{t('auth.signInRequired')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-96 border rounded-lg gap-4', className)}>
        <p className="text-destructive">{t('error.general')}</p>
        <Button onClick={clearError} variant="outline">
          {t('actions.tryAgain')}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-96 border border-border rounded-[var(--radius)] overflow-hidden bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        {activeConversationId && !showConversationList ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="p-1 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium text-sm text-foreground">
                  {conversations.find(c => c.id === activeConversationId)?.title || t('conversation.defaultTitle')}
                </h3>
                {typingUsers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {typingUsers.length === 1 ? 
                      t('messages.typing.single') : 
                      t('messages.typing.multiple', { count: typingUsers.length })
                    }
                  </p>
                )}
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('actions.close')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">{t('title')}</h3>
              {totalUnreadCount > 0 && (
                <Badge variant="destructive" className="text-xs rounded-[var(--radius)]">
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('actions.close')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      {!activeConversationId || showConversationList ? (
        // Conversations List
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div>
                <div className="w-12 h-12 rounded-[var(--radius)] bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('conversations.noConversations')}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 hover:bg-muted/80 rounded-[var(--radius)]"
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-10 h-10 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate text-foreground">
                            {conversation.title || t('conversationTypes.jobChat')}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(conversation.unread_count || 0) > 0 && (
                              <Badge variant="destructive" className="text-xs px-2 py-1 rounded-[var(--radius)]">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {formatDate(conversation.updated_at)}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {t('conversationTypes.jobChat')}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      ) : (
        // Active Conversation
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : messageGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('messages.noMessages')}
              </div>
            ) : (
              <div className="space-y-4">
                {messageGroups.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {message.showHeader && (
                        <div className={`flex items-center gap-2 text-xs mb-1 px-3 ${
                          message.isOwn ? 'justify-end flex-row-reverse' : ''
                        }`}>
                          <span className="font-medium">{message.sender_name}</span>
                          <span className="text-muted-foreground">
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`rounded-[var(--radius)] px-3 py-2 text-sm ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground border border-border'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={t('messages.typeMessage')}
                disabled={loading}
                className="flex-1 rounded-[var(--radius)]"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || loading}
                size="sm"
                className="rounded-[var(--radius)]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
