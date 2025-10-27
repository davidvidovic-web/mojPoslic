'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSupabaseRealtimeChat } from '@/hooks/use-supabase-realtime-chat-postgres'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDialogStore } from '@/stores/dialog-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, MessageCircle, ArrowLeft, Users, Loader2, X, Trash2, MoreVertical, AlertCircle, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useDeleteMessageForUserMutation, useDeleteConversationForUserMutation, useHideConversationMutation } from '@/hooks/queries/useMessages'
import { toast } from 'sonner'

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [clearConversationDialogOpen, setClearConversationDialogOpen] = useState(false)
  const [deleteConversationDialogOpen, setDeleteConversationDialogOpen] = useState(false)
  
  // Use conversationId from props or dialog store
  const activeConversationId = conversationId || currentConversationId
  const [showConversationList, setShowConversationList] = useState(!activeConversationId)
  
  // Delete message mutation
  const deleteMessageMutation = useDeleteMessageForUserMutation()
  const clearConversationMutation = useDeleteConversationForUserMutation()
  const hideConversationMutation = useHideConversationMutation()

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

  // Helper function to get conversation display name (participant name only)
  const getConversationDisplayName = (conversation: typeof conversations[0]) => {
    // If we have participant_names and participant_ids, show the OTHER participant's name
    if (conversation.participant_ids && conversation.participant_names && user?.id) {
      const otherParticipantIndex = conversation.participant_ids.findIndex(id => id !== user.id)
      if (otherParticipantIndex !== -1 && conversation.participant_names[otherParticipantIndex]) {
        const otherName = conversation.participant_names[otherParticipantIndex]
        // Don't show generic "Client" or "Tasker" labels
        if (otherName !== 'Client' && otherName !== 'Tasker') {
          return otherName
        }
      }
    }
    
    // Try to extract name from title (format: "Name - Job Title")
    if (conversation.title) {
      const parts = conversation.title.split(' - ')
      if (parts.length > 0 && parts[0] !== 'Applicant' && parts[0] !== 'Client' && parts[0] !== 'Tasker') {
        return parts[0]
      }
    }
    
    // Fall back to default
    return t('conversationTypes.jobChat')
  }

  // Helper function to get job title from conversation
  const getJobTitle = (conversation: typeof conversations[0]) => {
    // Try to extract job title from conversation title (format: "Name - Job Title")
    if (conversation.title) {
      const parts = conversation.title.split(' - ')
      if (parts.length > 1) {
        return parts.slice(1).join(' - ') // Join back in case job title has " - " in it
      }
    }
    return null
  }

  // Helper function to get participant avatar URL
  const getParticipantAvatar = (conversation: typeof conversations[0]) => {
    // If we have participant_avatars and participant_ids, get the OTHER participant's avatar
    if (conversation.participant_ids && conversation.participant_avatars && user?.id) {
      const otherParticipantIndex = conversation.participant_ids.findIndex(id => id !== user.id)
      if (otherParticipantIndex !== -1 && conversation.participant_avatars[otherParticipantIndex]) {
        return conversation.participant_avatars[otherParticipantIndex]
      }
    }
    return null
  }

  // Helper function to get participant initials for fallback avatar
  const getParticipantInitials = (conversation: typeof conversations[0]) => {
    const name = getConversationDisplayName(conversation)
    if (name && name !== 'conversationTypes.jobChat') {
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    return '?'
  }

  // Helper function to get all participant names for header
  const getAllParticipantNames = (conversation: typeof conversations[0]) => {
    if (conversation.participant_ids && conversation.participant_names && user?.id) {
      return conversation.participant_names
        .filter(name => name !== 'Client' && name !== 'Tasker')
        .join(', ')
    }
    return null
  }

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

  // Filter and group messages by sender and date for better UI
  const messageGroups = useMemo(() => {
    if (!user?.id) return []
    
    // Check if user has deleted any messages in this conversation
    const userHasDeletedMessages = messages.some(msg => 
      msg.deleted_by_users?.includes(user.id)
    )
    
    // Check if there's a new message from the other person (not deleted yet)
    const hasUnseenMessageFromOther = messages.some(msg => 
      msg.sender_id !== user.id && 
      (!msg.deleted_by_users || !msg.deleted_by_users.includes(user.id))
    )
    
    // If user cleared conversation but received a new message, restore ALL messages
    // This "restarts" the conversation when the other person replies
    const shouldRestoreConversation = userHasDeletedMessages && hasUnseenMessageFromOther
    
    const visibleMessages = shouldRestoreConversation
      ? messages // Show all messages to restart conversation
      : messages.filter(msg => { // Otherwise, respect deleted status
          if (!msg.deleted_by_users) return true
          return !msg.deleted_by_users.includes(user.id)
        })
    
    return visibleMessages.map((message, index) => {
      const prevMessage = visibleMessages[index - 1]
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

  // Handle message deletion
  const handleDeleteMessage = async () => {
    if (!messageToDelete || !user?.id) return

    try {
      await deleteMessageMutation.mutateAsync({
        messageId: messageToDelete,
        userId: user.id
      })
      toast.success(t('deleteMessageDialog.success'))
      setDeleteDialogOpen(false)
      setMessageToDelete(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
      toast.error(t('deleteMessageDialog.error'))
    }
  }

  // Handle clearing entire conversation (delete all messages for user)
  const handleClearConversation = async () => {
    if (!activeConversationId || !user?.id) return

    try {
      await clearConversationMutation.mutateAsync({
        conversationId: activeConversationId,
        userId: user.id
      })
      toast.success(t('clearConversationDialog.success'))
      setClearConversationDialogOpen(false)
    } catch (error) {
      console.error('Failed to clear conversation:', error)
      toast.error(t('clearConversationDialog.error'))
    }
  }

  // Handle deleting/hiding conversation (conversation stays, messages stay, just hidden from list)
  const handleDeleteConversation = async () => {
    if (!activeConversationId || !user?.id) return

    try {
      await hideConversationMutation.mutateAsync({
        conversationId: activeConversationId,
        userId: user.id
      })
      toast.success(t('deleteConversationDialog.success'))
      setDeleteConversationDialogOpen(false)
      
      // Return to conversation list
      handleBackToList()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      toast.error(t('deleteConversationDialog.error'))
    }
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
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back button to return to conversation list */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="p-1 h-auto flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {/* Title and participants in one line */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="font-medium text-sm text-foreground truncate">
                  {(() => {
                    const conv = conversations.find(c => c.id === activeConversationId)
                    const jobTitle = conv ? getJobTitle(conv) : null
                    return jobTitle || t('conversation.defaultTitle')
                  })()}
                </h3>
                {(() => {
                  const conv = conversations.find(c => c.id === activeConversationId)
                  const participants = conv ? getAllParticipantNames(conv) : null
                  if (participants) {
                    return (
                      <>
                        <span className="text-muted-foreground flex-shrink-0">•</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {participants}
                        </span>
                      </>
                    )
                  }
                  return null
                })()}
                
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <>
                    <span className="text-muted-foreground flex-shrink-0">•</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {typingUsers.length === 1 ? 
                        t('messages.typing.single') : 
                        t('messages.typing.multiple', { count: typingUsers.length })
                      }
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {/* Conversation options dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDeleteConversationDialogOpen(true)}
                    className="cursor-pointer focus:bg-muted focus:text-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('actions.deleteConversation')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setClearConversationDialogOpen(true)}
                    className="cursor-pointer focus:bg-muted focus:text-foreground"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('actions.clearMessages')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Close button - matches style and height of options button */}
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onClose} 
                  aria-label={t('actions.close')}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose} 
                aria-label={t('actions.close')}
                className="h-9 w-9"
              >
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
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={getParticipantAvatar(conversation) || undefined} alt={getConversationDisplayName(conversation)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getParticipantInitials(conversation)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <h4 className="font-medium text-sm text-foreground shrink-0">
                              {getConversationDisplayName(conversation)}
                            </h4>
                            {getJobTitle(conversation) && (
                              <>
                                <span className="text-muted-foreground shrink-0">•</span>
                                <span className="text-sm text-muted-foreground truncate">
                                  {getJobTitle(conversation)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
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
                        
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message_preview || t('conversationTypes.jobChat')}
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
                    className={`flex group ${message.isOwn ? 'justify-end' : 'justify-start'}`}
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
                      
                      <div className="relative flex items-start gap-1">
                        <div
                          className={`rounded-[var(--radius)] px-3 py-2 text-sm ${
                            message.isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground border border-border'
                          }`}
                        >
                          {message.content}
                        </div>
                        
                        {/* Delete button - shows on hover */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setMessageToDelete(message.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="focus:bg-muted focus:text-foreground cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('actions.deleteMessageForMe')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Delete Message Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t('deleteMessageDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('deleteMessageDialog.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Warning box */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>{t('deleteMessageDialog.warning').split('.')[0]}:</strong> {t('deleteMessageDialog.description')}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMessageMutation.isPending}
            >
              {t('deleteMessageDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteMessage}
              disabled={deleteMessageMutation.isPending}
            >
              {deleteMessageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('status.sending')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('deleteMessageDialog.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Conversation Confirmation Dialog */}
      <Dialog open={clearConversationDialogOpen} onOpenChange={setClearConversationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t('clearConversationDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('clearConversationDialog.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Warning box */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>{t('deleteMessageDialog.warning') || 'Warning:'}</strong>{' '}
              {t('clearConversationDialog.warning')}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearConversationDialogOpen(false)}
              disabled={clearConversationMutation.isPending}
            >
              {t('clearConversationDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearConversation}
              disabled={clearConversationMutation.isPending}
            >
              {clearConversationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('clearConversationDialog.clearing')}
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('clearConversationDialog.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Confirmation Dialog */}
      <Dialog open={deleteConversationDialogOpen} onOpenChange={setDeleteConversationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t('deleteConversationDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('deleteConversationDialog.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Warning box */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>{t('deleteMessageDialog.warning') || 'Warning:'}</strong>{' '}
              {t('deleteConversationDialog.warning')}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConversationDialogOpen(false)}
              disabled={hideConversationMutation.isPending}
            >
              {t('deleteConversationDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={hideConversationMutation.isPending}
            >
              {hideConversationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('deleteConversationDialog.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('deleteConversationDialog.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
