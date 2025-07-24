'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ConversationView } from './conversation-view';
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging';
import { useOptimizedConversations } from '@/hooks/use-optimized-conversations';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MessageAttachment, Conversation } from '@/types/messaging';
import { useTranslations } from 'next-intl';

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  locale?: 'bs' | 'en';
  className?: string;
}

interface MessagingToggleProps {
  onClick: () => void;
  unreadCount: number;
  locale?: 'bs' | 'en';
  className?: string;
}

export const MessagingToggle: React.FC<MessagingToggleProps> = ({
  onClick,
  unreadCount,
  className,
}) => {
  const t = useTranslations('messaging');
  const title = t('title');

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("relative p-2", className)}
      title={title}
    >
      <MessageCircle className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export const MessagingModal: React.FC<MessagingModalProps> = ({
  open,
  onOpenChange,
  currentUserId,
  locale = 'bs',
  className,
}) => {
  const t = useTranslations('messaging');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { 
    conversations, 
    totalUnreadCount, 
    isLoading,
    markConversationAsRead,
    archiveConversation,
    sendTypingIndicator,
    getTypingUsers,
    setMessagingActive,
    handleIncomingTyping
  } = useOptimizedMessaging();  const {
    activeConversation,
    setActiveConversation,
    messages,
    isLoadingMessages,
    canLoadMore,
    loadMoreMessages,
    sendMessage,
    addRealtimeMessage
  } = useOptimizedConversations();

  // Set up optimized real-time integration
  useOptimizedRealtime({
    onNewMessage: (message) => {
      addRealtimeMessage(message)
    },
    onTypingIndicator: (conversationId, userId, isTyping, userName) => {
      handleIncomingTyping(conversationId, userId, isTyping, userName)
    },
    activeConversationId: activeConversation?.id || null,
    isMessagingActive: open
  });

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set messaging activity when dialog opens/closes
  useEffect(() => {
    setMessagingActive(open);
  }, [open, setMessagingActive]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeConversation) return;
    
    try {
      await sendMessage({
        conversationId: activeConversation.id,
        content,
        messageType: attachments && attachments.length > 0 ? 'file' : 'text',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (activeConversation) {
      sendTypingIndicator(activeConversation.id, isTyping);
    }
  };

  const handleAttachmentClick = (attachment: MessageAttachment) => {
    // Open attachment in new tab/window
    window.open(attachment.file_url, '_blank');
  };

  const handleLoadMoreMessages = () => {
    if (activeConversation && canLoadMore) {
      loadMoreMessages();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    if (conversation) {
      markConversationAsRead(conversation.id);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await archiveConversation(conversationId);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-full max-w-none max-h-none p-0 rounded-none">
          <DialogDescription className="sr-only">
            Messaging interface for conversations and messages
          </DialogDescription>
          <ConversationView
            conversations={conversations}
            selectedConversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onLoadMoreMessages={handleLoadMoreMessages}
            onTyping={handleTyping}
            onAttachmentClick={handleAttachmentClick}
            onArchiveConversation={handleDeleteConversation}
            onDeleteConversation={handleDeleteConversation}
            onLeaveConversation={handleDeleteConversation}
            typingUsers={getTypingUsers(activeConversation?.id || '')} // Get typing users for active conversation
            loading={{
              conversations: isLoading,
              messages: isLoadingMessages,
            }}
            hasMoreMessages={canLoadMore}
            isMobile={true}
            className="h-full"
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (isMinimized) {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50 bg-white border rounded-lg shadow-lg",
        className
      )}>
        <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">
              {t('title')}
            </span>
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className="bg-white text-blue-500">
                {totalUnreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="p-1 h-auto text-white hover:bg-blue-600"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-1 h-auto text-white hover:bg-blue-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 bg-white border rounded-lg shadow-lg",
      "w-[800px] h-[600px] flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">
            {locale === 'bs' ? 'Poruke' : 'Messages'}
          </span>
          {totalUnreadCount > 0 && (
            <Badge variant="secondary" className="bg-white text-blue-500">
              {totalUnreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="p-1 h-auto text-white hover:bg-blue-600"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="p-1 h-auto text-white hover:bg-blue-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ConversationView
          conversations={conversations}
          selectedConversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId}
          onSelectConversation={handleSelectConversation}
          onSendMessage={handleSendMessage}
          onLoadMoreMessages={handleLoadMoreMessages}
          onTyping={handleTyping}
          onAttachmentClick={handleAttachmentClick}
          onArchiveConversation={handleDeleteConversation}
          onDeleteConversation={handleDeleteConversation}
          onLeaveConversation={handleDeleteConversation}
          typingUsers={[]} // TODO: Implement typing users in optimized hooks
          loading={{
            conversations: isLoading,
            messages: isLoadingMessages,
          }}
          hasMoreMessages={canLoadMore}
          isMobile={false}
          className="h-full"
        />
      </div>
    </div>
  );
};

// Combined component for easy integration
interface MessagingIntegrationProps {
  currentUserId: string;
  locale?: 'bs' | 'en';
  className?: string;
}

export const MessagingIntegration: React.FC<MessagingIntegrationProps> = ({
  currentUserId,
  locale = 'bs',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalUnreadCount } = useOptimizedMessaging();

  return (
    <>
      <MessagingToggle
        onClick={() => setIsOpen(true)}
        unreadCount={totalUnreadCount}
        locale={locale}
        className={className}
      />
      <MessagingModal
        open={isOpen}
        onOpenChange={setIsOpen}
        currentUserId={currentUserId}
        locale={locale}
      />
    </>
  );
};
