/**
 * Messaging utility functions for integration across the app
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook to provide messaging utilities for other components
 */
export function useMessagingUtils() {
  const router = useRouter();

  /**
   * Navigate to messages and optionally start a conversation with a specific user
   */
  const goToMessages = useCallback((userId?: string) => {
    if (userId) {
      // For now, just go to messages. In the future, we could pass the userId
      // as a query parameter to auto-start a conversation
      router.push(`/dashboard/messages?startConversation=${userId}`);
    } else {
      router.push('/dashboard/messages');
    }
  }, [router]);

  /**
   * Start a conversation with a specific user
   * This will navigate to messages and trigger conversation creation
   */
  const startConversationWith = useCallback((userId: string, userName?: string) => {
    const params = new URLSearchParams();
    params.set('startConversation', userId);
    if (userName) {
      params.set('userName', userName);
    }
    
    router.push(`/dashboard/messages?${params.toString()}`);
  }, [router]);

  return {
    goToMessages,
    startConversationWith,
  };
}

/**
 * Simple utility to generate a message link for a user
 */
export function createMessageUserLink(userId: string, userName?: string): string {
  const params = new URLSearchParams();
  params.set('startConversation', userId);
  if (userName) {
    params.set('userName', userName);
  }
  
  return `/dashboard/messages?${params.toString()}`;
}

/**
 * Helper to extract messaging parameters from URL search params
 */
export function extractMessagingParams(searchParams: URLSearchParams) {
  const startConversationUserId = searchParams.get('startConversation');
  const userName = searchParams.get('userName');
  
  return {
    startConversationUserId,
    userName,
  };
}
