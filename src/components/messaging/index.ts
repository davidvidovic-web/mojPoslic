// Modern Supabase Realtime Messaging System
// Following latest Supabase documentation patterns

// Main components
export { UnifiedMessagingInterface } from './unified-messaging-interface'
export { ModernMessagingButton } from './modern-messaging-button'

// Main hook
export { useSupabaseRealtimeChat } from '@/hooks/use-supabase-realtime-chat'

// Legacy components (deprecated but maintained for compatibility)
export { MessagingInterface } from './messaging-interface'
export { ModernMessagingInterface } from './modern-messaging-interface'
export { MessagingButton } from './messaging-button'
export { RealtimeChat } from './realtime-chat'
export { ChatMessageItem } from './chat-message'

// Legacy hooks (deprecated) - commented out missing hook
// export { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
export { useRealtimeChat } from '@/hooks/use-realtime-chat'

// Types
export type { Message, Conversation } from '@/hooks/use-supabase-realtime-chat'
export type { ChatMessage } from '@/hooks/use-realtime-chat'
