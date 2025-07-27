'use client'

// Temporary stub for job messaging functionality
// The original messaging system was removed during authentication cleanup
export function useOptimizedJobMessaging() {
  return {
    isLoading: false,
    error: null,
    refreshConversations: async () => {},
    canMessage: () => false,
    createJobConversation: async () => ({ success: false, error: 'Messaging temporarily disabled' })
  }
}
