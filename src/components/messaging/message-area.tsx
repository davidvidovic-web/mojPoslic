'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Message, MessageAttachment, TypingUser } from '@/types/messaging';
import { MessageBubble } from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, AlertCircle, MessageCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface MessageAreaProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAttachmentClick?: (attachment: MessageAttachment) => void;
  typingUsers?: TypingUser[];
  locale?: 'bs' | 'en';
  className?: string;
  error?: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
  currentUserId: string;
  locale?: 'bs' | 'en';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users, currentUserId, locale = 'bs' }) => {
  // Filter out current user - don't show typing indicator for ourselves
  const otherUsers = users.filter(user => user.user_id !== currentUserId);
  
  if (otherUsers.length === 0) return null;

  const typingText = locale === 'bs' ? 'kuca...' : 'typing...';
  
  let displayText = '';
  if (otherUsers.length === 1) {
    const userName = otherUsers[0].user?.name || otherUsers[0].user_id;
    displayText = `${userName} ${typingText}`;
  } else if (otherUsers.length === 2) {
    const user1Name = otherUsers[0].user?.name || otherUsers[0].user_id;
    const user2Name = otherUsers[1].user?.name || otherUsers[1].user_id;
    const andText = locale === 'bs' ? 'i' : 'and';
    displayText = `${user1Name} ${andText} ${user2Name} ${typingText}`;
  } else {
    displayText = locale === 'bs' 
      ? `${otherUsers.length} korisnika kuca...`
      : `${otherUsers.length} users typing...`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground dark:bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground dark:bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground dark:bg-muted-foreground rounded-full animate-bounce" />
      </div>
      <span>{displayText}</span>
    </div>
  );
};

const MessageSkeleton: React.FC = () => (
  <div className="flex items-start gap-3 p-4">
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-full max-w-md" />
    </div>
  </div>
);

const LoadMoreButton: React.FC<{ onClick: () => void; locale: 'bs' | 'en' }> = ({ 
  onClick, 
  locale 
}) => (
  <div className="flex justify-center py-4">
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className="text-blue-600 hover:text-blue-700"
    >
      {locale === 'bs' ? 'Učitaj starije poruke' : 'Load older messages'}
    </Button>
  </div>
);

export const MessageArea: React.FC<MessageAreaProps> = ({
  messages,
  currentUserId,
  loading = false,
  hasMore = false,
  onLoadMore,
  onAttachmentClick,
  typingUsers = [],
  locale = 'bs',
  className,
  error,
}) => {
  const t = useTranslations('messaging')
  const tErrors = useTranslations('errors');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Intersection observer for load more
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px 0px 0px 0px',
  });

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && shouldScrollToBottom) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, shouldScrollToBottom, scrollToBottom]);

  // Load more when intersection observer triggers
  useEffect(() => {
    if (inView && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore, loading]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollToBottom(!isAtBottom);
    setShouldScrollToBottom(isAtBottom);
  }, []);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.date === messageDate) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
    
    return groups;
  }, [messages]);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('dates.today');
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return t('dates.yesterday');
    }
    
    return date.toLocaleDateString(locale === 'bs' ? 'bs-BA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">
            {tErrors('failedToLoad.messages')}
          </h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className={cn("h-full", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <MessageSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">
            {locale === 'bs' ? 'Nema poruka' : 'No messages yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {locale === 'bs' 
              ? 'Pošaljite prvu poruku da započnete konverzaciju'
              : 'Send the first message to start the conversation'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full", className)}>
      <ScrollArea ref={scrollAreaRef} className="h-full" onScrollCapture={handleScroll}>
        <div className="p-4 space-y-6">
          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef}>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-sm">
                      {t('loading')}
                    </span>
                  </div>
                </div>
              ) : (
                <LoadMoreButton onClick={onLoadMore!} locale={locale} />
              )}
            </div>
          )}

          {/* Messages grouped by date */}
          {groupedMessages.map((group) => (
            <div key={group.date} className="space-y-4">
              {/* Date header */}
              <div className="flex justify-center">
                <div className="bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground text-xs px-3 py-1 rounded-full">
                  {formatDateHeader(group.date)}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {group.messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const prevMessage = group.messages[index - 1];
                  const nextMessage = group.messages[index + 1];
                  
                  // Show avatar if it's the first message from this sender or different from previous
                  const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                  
                  // Show timestamp if it's the last message from this sender or different from next
                  const showTimestamp = !nextMessage || nextMessage.senderId !== message.senderId;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      showTimestamp={showTimestamp}
                      locale={locale}
                      onAttachmentClick={onAttachmentClick}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <TypingIndicator users={typingUsers} currentUserId={currentUserId} locale={locale} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full w-10 h-10 p-0 shadow-lg"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
