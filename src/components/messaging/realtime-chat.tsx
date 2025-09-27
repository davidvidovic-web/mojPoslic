'use client'

import React, { useState, useMemo } from 'react'
import { useRealtimeChat, type ChatMessage } from '@/hooks/use-realtime-chat'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { ChatMessageItem } from './chat-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealtimeChatProps {
  roomName: string
  username: string
  messages?: ChatMessage[]
  onMessage?: (messages: ChatMessage[]) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function RealtimeChat({
  roomName,
  username,
  messages: initialMessages = [],
  onMessage,
  className,
  placeholder = 'Type a message...',
  disabled = false
}: RealtimeChatProps) {
  const [newMessage, setNewMessage] = useState('')
  
  const { 
    messages, 
    sendMessage, 
    loading 
  } = useRealtimeChat({
    roomName,
    username,
    initialMessages,
    onMessage
  })

  const { ref: scrollRef, scrollToBottom } = useChatScroll(messages, {
    behavior: 'smooth',
    threshold: 100
  })

  // Group messages by sender to show headers appropriately
  const messageGroups = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1]
      const showHeader = !prevMessage || prevMessage.user.id !== message.user.id
      
      return {
        ...message,
        showHeader
      }
    })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || loading || disabled) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    
    try {
      await sendMessage(messageContent)
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore the message on error
      setNewMessage(messageContent)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <div className={cn('flex flex-col h-full max-h-[600px] border border-border bg-card rounded-[var(--radius)]', className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1">
          {messageGroups.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messageGroups.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.user.id === username || message.user.name === username}
                showHeader={message.showHeader}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={loading || disabled}
            className="flex-1 rounded-[var(--radius)]"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || loading || disabled}
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
  )
}
