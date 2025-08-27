import React, { useState, useEffect, useRef } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
import { useDialogStore } from '@/stores/dialog-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, ArrowLeft, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface MessagingInterfaceProps {
  conversationId?: string
  onClose?: () => void
  className?: string
}

export function MessagingInterface({ conversationId, onClose, className }: MessagingInterfaceProps) {
  const { user } = useSupabaseAuth()
  const { currentConversationId, openMessagingDialog } = useDialogStore()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    conversations, 
    messages: hookMessages, 
    isLoading: loading, 
    totalUnreadCount,
    loadMessages,
    setMessagingActive
  } = useOptimizedMessaging()

  // Local messages state that includes realtime updates
  const [messages, setMessages] = useState<{
    id: string
    conversation_id: string
    sender_id: string
    content: string
    message_type: string
    sender_name: string
    created_at: string
  }[]>([])

  // Sync with hook messages when they change
  useEffect(() => {
    setMessages(hookMessages)
  }, [hookMessages])

  // Use conversationId from props or dialog store
  const activeConversationId = conversationId || currentConversationId
  const [showConversationList, setShowConversationList] = useState(!activeConversationId)
  
  // Reset to conversation list when back button is clicked
  const handleBackToList = () => {
    setShowConversationList(true)
    // If using dialog store, clear the conversation
    if (!conversationId && currentConversationId) {
      openMessagingDialog(undefined)
    }
  }

  // Set messaging as active when component mounts
  useEffect(() => {
    setMessagingActive(true)
    return () => setMessagingActive(false)
  }, [setMessagingActive])

  // Proper Supabase realtime subscription for messages
  useEffect(() => {
    if (!user?.id || !activeConversationId) return

    console.log('🔄 Setting up realtime subscription for conversation:', activeConversationId)

    // Create a unique channel for this conversation
    const channel = supabase
      .channel(`conversation:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          console.log('📨 New message received via realtime:', payload.new)
          const newMessage = payload.new as {
            id: string
            conversation_id: string
            sender_id: string
            content: string
            message_type: string
            sender_name: string
            created_at: string
          }

          // Only add if it's not from current user (to avoid duplicates from optimistic updates)
          if (newMessage.sender_id !== user.id) {
            console.log('✅ Adding message from another user')
            setMessages(prevMessages => {
              // Check if message already exists to prevent duplicates
              const exists = prevMessages.find(msg => msg.id === newMessage.id)
              if (exists) {
                console.log('⚠️ Message already exists, skipping')
                return prevMessages
              }
              
              console.log('✅ Adding new message to state')
              return [...prevMessages, newMessage]
            })

            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
              scrollToBottom()
            }, 100)
          } else {
            console.log('⚠️ Message from current user, skipping realtime update (handled by optimistic update)')
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to conversation updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error')
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Realtime subscription timed out')
        } else if (status === 'CLOSED') {
          console.log('🔒 Realtime subscription closed')
        }
      })

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [user?.id, activeConversationId])

  // Separate subscription for conversation list updates
  useEffect(() => {
    if (!user?.id) return

    console.log('🔄 Setting up conversation list realtime subscription')

    const channel = supabase
      .channel('conversation_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('📋 New conversation created:', payload.new)
          const newConversation = payload.new as {
            id: string
            participant_ids: string[]
          }
          
          // Check if user is participant
          if (newConversation.participant_ids?.includes(user.id)) {
            // Reload conversations to get the new one
            setTimeout(() => {
              setMessagingActive(false)
              setTimeout(() => setMessagingActive(true), 50)
            }, 100)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('📋 Conversation updated:', payload.new)
          // Refresh conversations list
          setTimeout(() => {
            setMessagingActive(false)
            setTimeout(() => setMessagingActive(true), 50)
          }, 100)
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversation list subscription status:', status)
      })

    return () => {
      console.log('🧹 Cleaning up conversation list subscription')
      supabase.removeChannel(channel)
    }
  }, [user?.id, setMessagingActive])

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId || !user) {
      setMessages([]) // Clear messages when no active conversation
      return
    }

    console.log('🔄 Loading messages for conversation:', activeConversationId)
    loadMessages(activeConversationId)
  }, [activeConversationId, user, loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(scrollToBottom, 100)
  }, [messages, activeConversationId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || !user) return

    const messageContent = newMessage.trim()
    setNewMessage('') // Clear input immediately for better UX

    try {
      // Optimistically add the message to local state first
      const tempMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        conversation_id: activeConversationId,
        sender_id: user.id,
        content: messageContent,
        message_type: 'text',
        sender_name: user.email || 'You',
        created_at: new Date().toISOString()
      }

      // Add to local state immediately
      setMessages(prev => [...prev, tempMessage])

      // Send to server
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: messageContent,
          message_type: 'text',
          sender_name: user.email || 'You'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to send message:', error)
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        setNewMessage(messageContent) // Restore message content
        toast.error('Failed to send message')
        return
      }

      // Replace temp message with real message
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...data, sender_name: user.email || 'You' } : msg
        ))
      }

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageContent) // Restore message content on error
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const renderConversationList = () => (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Conversations</span>
        </div>
        {totalUnreadCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {totalUnreadCount} unread
          </Badge>
        )}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
              <p className="text-muted-foreground">
                Start a conversation by messaging an applicant from your job applications.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-4">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-4 hover:bg-muted"
                  onClick={() => {
                    setShowConversationList(false)
                    // Open messaging dialog with this conversation
                    openMessagingDialog(conversation.id)
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.title || 'Job Application'}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(conversation.unread_count || 0) > 0 && (
                            <Badge variant="destructive" className="text-xs px-2 py-1">
                              {conversation.unread_count || 0}
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatDate(conversation.updated_at)}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Job application conversation
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )



  if (!activeConversationId || showConversationList) {
    return renderConversationList()
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {conversations.length > 0 && !showConversationList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Conversation</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === user?.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
