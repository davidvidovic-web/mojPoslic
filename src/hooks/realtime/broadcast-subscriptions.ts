import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type MessageHandler = (payload: Record<string, unknown>) => void

export async function subscribeToMessages(conversationId: string, handlers: {
  onInsert?: MessageHandler
  onUpdate?: MessageHandler
  onTyping?: MessageHandler
}) : Promise<RealtimeChannel> {
  await supabase.realtime.setAuth()

  const channel = supabase.channel(`topic:${conversationId}`, {
    config: { broadcast: { self: false }, private: true }
  })

  if (handlers.onInsert) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('broadcast', { event: 'INSERT' }, (payload: any) => {
      if (handlers.onInsert) handlers.onInsert(payload.payload.new as Record<string, unknown>)
    })
  }

  if (handlers.onUpdate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('broadcast', { event: 'UPDATE' }, (payload: any) => {
      if (handlers.onUpdate) handlers.onUpdate(payload.payload.new as Record<string, unknown>)
    })
  }

  if (handlers.onTyping) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('broadcast', { event: 'typing' }, (payload: any) => {
      if (handlers.onTyping) handlers.onTyping(payload.payload as Record<string, unknown>)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channel.subscribe((status: any, err: any) => {
    if (status === 'SUBSCRIBED') {
      // console.log('Subscribed to messages topic', conversationId)
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Messages channel error', err)
    }
  })

  return channel
}

export async function subscribeToConversations(userId: string, handlers: {
  onConversationInsert?: MessageHandler
  onConversationUpdate?: MessageHandler
}) : Promise<RealtimeChannel> {
  await supabase.realtime.setAuth()

  const channel = supabase.channel(`topic:conversations:user:${userId}`, {
    config: { broadcast: { self: false }, private: true }
  })

  if (handlers.onConversationInsert) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('broadcast', { event: 'INSERT' }, (payload: any) => {
      if (handlers.onConversationInsert) handlers.onConversationInsert(payload.payload.new as Record<string, unknown>)
    })
  }

  if (handlers.onConversationUpdate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('broadcast', { event: 'UPDATE' }, (payload: any) => {
      if (handlers.onConversationUpdate) handlers.onConversationUpdate(payload.payload.new as Record<string, unknown>)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channel.subscribe((status: any, err: any) => {
    if (status === 'SUBSCRIBED') {
      // console.log('Subscribed to conversations topic for user', userId)
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Conversations channel error', err)
    }
  })

  return channel
}
