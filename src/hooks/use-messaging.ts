'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMessaging } from '@/contexts/messaging-context';

export function useConversation(conversationId?: string) {
  const {
    state,
    setActiveConversation,
    loadMessages,
    markConversationAsRead,
  } = useMessaging();

  const conversation = state.conversations.find(c => c.id === conversationId);

  const setActive = useCallback(() => {
    if (conversation) {
      setActiveConversation(conversation);
      loadMessages(conversation.id);
      markConversationAsRead(conversation.id);
    }
  }, [conversation, setActiveConversation, loadMessages, markConversationAsRead]);

  return {
    conversation,
    setActive,
    isActive: state.activeConversation?.id === conversationId,
    messages: state.activeConversation?.id === conversationId ? state.messages : [],
    loading: state.isLoadingMessages,
  };
}

export function useConversations() {
  const { state, loadConversations } = useMessaging();

  const totalUnreadCount = state.conversations.reduce(
    (total, conv) => total + conv.unread_count,
    0
  );

  return {
    conversations: state.conversations,
    loading: state.isLoading,
    error: state.error,
    totalUnreadCount,
    refresh: loadConversations,
  };
}

export function useDirectConversation(userId: string) {
  const { state, createDirectConversation, setActiveConversation, loadMessages } = useMessaging();
  const [creating, setCreating] = useState(false);

  // Find existing direct conversation
  const existingConversation = state.conversations.find(conv => 
    conv.type === 'direct' && 
    conv.participants.some(p => p.user_id === userId)
  );

  const createOrOpen = useCallback(async () => {
    if (existingConversation) {
      setActiveConversation(existingConversation);
      loadMessages(existingConversation.id);
      return existingConversation;
    }

    try {
      setCreating(true);
      const conversation = await createDirectConversation(userId);
      setActiveConversation(conversation);
      loadMessages(conversation.id);
      return conversation;
    } catch (error) {
      console.error('Failed to create direct conversation:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [existingConversation, userId, createDirectConversation, setActiveConversation, loadMessages]);

  return {
    conversation: existingConversation,
    createOrOpen,
    creating,
  };
}

export function useTypingIndicator(conversationId?: string) {
  const { state, sendTypingIndicator } = useMessaging();
  const [isTyping, setIsTyping] = useState(false);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
  }, [isTyping, sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  }, [isTyping, sendTypingIndicator]);

  // Auto-stop typing after 3 seconds
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(stopTyping, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, stopTyping]);

  const typingUsers = state.typingUsers.filter(
    tu => tu.conversation_id === conversationId
  );

  return {
    isTyping,
    startTyping,
    stopTyping,
    typingUsers,
  };
}

export function useMessageActions() {
  const { sendMessage, editMessage, deleteMessage } = useMessaging();

  const send = useCallback(
    async (conversationId: string, content: string, files?: File[]) => {
      try {
        await sendMessage({
          conversation_id: conversationId,
          content,
          message_type: files && files.length > 0 ? 'file' : 'text',
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [sendMessage]
  );

  const edit = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        await editMessage(messageId, newContent);
      } catch (error) {
        console.error('Failed to edit message:', error);
        throw error;
      }
    },
    [editMessage]
  );

  const remove = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
        throw error;
      }
    },
    [deleteMessage]
  );

  return {
    send,
    edit,
    remove,
  };
}

export function useMessagingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    isMinimized,
    open,
    close,
    minimize,
    maximize,
    toggle,
  };
}
