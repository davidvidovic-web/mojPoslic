import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
import { useDialogStore } from '@/stores/dialog-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, ArrowLeft, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  message_type?: string
  attachment_url?: string
  read_by?: string[]
}

interface MessagingInterfaceProps {
  conversationId?: string
  onClose?: () => void
}

export function MessagingInterface({ conversationId, onClose }: MessagingInterfaceProps) {
  const { user, session } = useSupabaseAuth()
  const { currentConversationId, openMessagingDialog } = useDialogStore()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    conversations, 
    messages, 
    isLoading: loading, 
    totalUnreadCount,
    loadMessages,
    sendMessage: sendMessageHook
  } = useOptimizedMessaging()

  // Use conversationId from props or dialog store
  const activeConversationId = conversationId || currentConversationId
  const [showConversationList, setShowConversationList] = useState(!activeConversationId)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversation and messages
  const loadMessagesForConversation = useCallback(async (convId: string) => {
    if (!convId) return
    await loadMessages(convId)
  }, [loadMessages])

  useEffect(() => {
    if (!activeConversationId || !user) return

    loadMessages(activeConversationId)
  }, [activeConversationId, user, loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || !user) return

    try {
      await sendMessageHook(activeConversationId, newMessage.trim(), 'text')
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations
          </CardTitle>
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnreadCount} unread
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
            <p className="text-muted-foreground">
              Start a conversation by messaging an applicant from your job applications.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
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
      </CardContent>
    </Card>
  )



  if (!activeConversationId && !showConversationList) {
    return renderConversationList()
  }

  if (!activeConversationId) {
    return renderConversationList()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conversations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationList(true)}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversation
            </CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-96 p-4">
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
      </CardContent>
    </Card>
  )
}
