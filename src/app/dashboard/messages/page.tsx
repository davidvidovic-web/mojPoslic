'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MessagingProvider, useMessaging } from '@/contexts/messaging-context';
import { ConversationView } from '@/components/messaging/conversation-view';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageAttachment, Conversation } from '@/types/messaging';
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils';
import { extractMessagingParams } from '@/lib/messaging/messaging-utils';

interface DashboardMessagesContentProps {
  locale?: 'bs' | 'en';
}

const DashboardMessagesContent: React.FC<DashboardMessagesContentProps> = ({ locale = 'bs' }) => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    state,
    setActiveConversation,
    sendMessage,
    loadMessages,
    sendTypingIndicator,
    archiveConversation,
    markConversationAsRead,
    createDirectConversation,
  } = useMessaging();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Handle conversation startup from URL parameters
  useEffect(() => {
    if (user && state.conversations.length > 0) {
      const { startConversationUserId } = extractMessagingParams(searchParams);
      
      if (startConversationUserId) {
        // Check if conversation already exists
        const existingConversation = state.conversations.find(conv => 
          conv.type === 'direct' && 
          conv.participants.some(p => p.user_id === startConversationUserId)
        );

        if (existingConversation) {
          setActiveConversation(existingConversation);
          loadMessages(existingConversation.id);
        } else {
          // Create new direct conversation
          createDirectConversation(startConversationUserId)
            .then((conversation) => {
              setActiveConversation(conversation);
              loadMessages(conversation.id);
            })
            .catch((error) => {
              console.error('Failed to create conversation:', error);
            });
        }

        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('startConversation');
        newUrl.searchParams.delete('userName');
        router.replace(newUrl.pathname + newUrl.search);
      }
    }
  }, [user, state.conversations, searchParams, setActiveConversation, loadMessages, createDirectConversation, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {locale === 'bs' ? 'Učitavanje...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!state.activeConversation) return;
    
    try {
      await sendMessage({
        conversation_id: state.activeConversation.id,
        content,
        message_type: attachments && attachments.length > 0 ? 'file' : 'text',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator(isTyping);
  };

  const handleAttachmentClick = (attachment: MessageAttachment) => {
    // Open attachment in new tab/window
    window.open(attachment.file_url, '_blank');
  };

  const handleLoadMoreMessages = () => {
    if (state.activeConversation) {
      const oldestMessage = state.messages[0];
      if (oldestMessage) {
        loadMessages(state.activeConversation.id, oldestMessage.id);
      }
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    if (conversation) {
      loadMessages(conversation.id);
      markConversationAsRead(conversation.id);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    // For now, just archive it
    try {
      await archiveConversation(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] bg-white border rounded-lg shadow-sm">
      <ConversationView
        conversations={state.conversations}
        selectedConversation={state.activeConversation}
        messages={state.messages}
        currentUserId={user.id}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
        onLoadMoreMessages={handleLoadMoreMessages}
        onTyping={handleTyping}
        onAttachmentClick={handleAttachmentClick}
        onArchiveConversation={archiveConversation}
        onDeleteConversation={handleDeleteConversation}
        onLeaveConversation={handleDeleteConversation}
        typingUsers={state.typingUsers}
        loading={{
          conversations: state.isLoading,
          messages: state.isLoadingMessages,
        }}
        hasMoreMessages={state.messages.length > 0}
        locale={locale}
        isMobile={false}
        className="h-full"
      />
    </div>
  );
};

export default function DashboardMessagesPage() {
  const { user } = useAuth();
  // In a real app, you'd get the locale from your i18n setup
  const locale = 'bs' as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {locale === 'bs' ? 'Poruke' : 'Messages'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! 
            {locale === 'bs' 
              ? ' Ostanite povezani sa svojim korisnicima.'
              : ' Stay connected with your clients.'
            }
          </p>
        </div>
        
        {/* Messages Content */}
        <MessagingProvider>
          <DashboardMessagesContent locale={locale} />
        </MessagingProvider>
      </div>
    </div>
  );
}
