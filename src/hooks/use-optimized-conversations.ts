'use client'

// Temporary stub for conversation functionality  
// The original messaging system was removed during authentication cleanup
export function useOptimizedConversations() {
  return {
    conversations: [],
    isLoading: false,
    error: null,
    refreshConversations: async () => {},
    optimizedRefresh: async () => {}
  }
}
