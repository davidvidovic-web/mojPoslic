/**
 * Example usage of the Supabase-compliant messaging system
 * 
 * This file demonstrates how to use the messaging components following
 * the official Supabase UI documentation patterns.
 */

import React from 'react'
import { RealtimeChat } from './realtime-chat'
import { ModernMessagingInterface } from './modern-messaging-interface'
import { MessagingButton } from './messaging-button'

// Example 1: Basic realtime chat (Supabase documentation pattern)
export function BasicChatExample() {
  return (
    <div className="max-w-md mx-auto">
      <h3 className="mb-4 font-semibold">Basic Realtime Chat</h3>
      <RealtimeChat 
        roomName="general-chat" 
        username="john_doe"
      />
    </div>
  )
}

// Example 2: Chat with initial messages (Supabase documentation pattern)
export function ChatWithInitialMessagesExample() {
  const initialMessages = [
    {
      id: '1',
      content: 'Hello! Welcome to the chat.',
      user: { name: 'System', id: 'system' },
      createdAt: new Date().toISOString()
    }
  ]

  return (
    <div className="max-w-md mx-auto">
      <h3 className="mb-4 font-semibold">Chat with Initial Messages</h3>
      <RealtimeChat 
        roomName="welcome-chat" 
        username="new_user"
        messages={initialMessages}
      />
    </div>
  )
}

// Example 3: Chat with message persistence (Supabase documentation pattern)
export function ChatWithPersistenceExample() {
  const handleMessage = async () => {
    // Store messages in your database
    // await storeMessages(messages)
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="mb-4 font-semibold">Chat with Persistence</h3>
      <RealtimeChat 
        roomName="persistent-chat" 
        username="user123"
        onMessage={handleMessage}
      />
    </div>
  )
}

// Example 4: Full messaging interface (your existing system enhanced)
export function FullMessagingExample() {
  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="mb-4 font-semibold">Full Messaging Interface</h3>
      <div className="h-[600px] border rounded-lg">
        <ModernMessagingInterface />
      </div>
    </div>
  )
}

// Example 5: Messaging button (modal trigger)
export function MessagingButtonExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Messaging Button Examples</h3>
      
      <div className="flex gap-4">
        <MessagingButton iconOnly />
        <MessagingButton />
        <MessagingButton conversationId="specific-conversation-id" />
      </div>
    </div>
  )
}

// Example 6: All features showcase
export function MessagingShowcase() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Messaging System Showcase</h2>
      <p className="text-muted-foreground">
        All messaging components now follow the official Supabase UI documentation patterns
        for realtime chat implementation.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BasicChatExample />
        <ChatWithInitialMessagesExample />
        <ChatWithPersistenceExample />
        <MessagingButtonExample />
      </div>
      
      <FullMessagingExample />
    </div>
  )
}
