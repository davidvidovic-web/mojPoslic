'use client'

// Temporary stub for messaging functionality
// The original messaging system was removed during authentication cleanup
export function useOptimizedMessaging() {
  return {
    conversations: [],
    totalUnreadCount: 0,
    unreadCounts: {},
    isLoading: false,
    error: null,
    refreshConversations: async () => {},
    markConversationAsRead: async () => {},
    setMessagingActive: () => {},
    sendMessage: async () => ({ success: false, error: 'Messaging temporarily disabled' }),
    messagingActive: false,
    optimizedRefresh: async () => {},
    clearError: () => {},
    retryFetch: async () => {}
  }
}
