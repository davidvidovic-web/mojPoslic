'use client';

import React from 'react';
import { format } from 'date-fns';
import { bs, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Conversation } from '@/types/messaging';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, Archive, Users, Briefcase, Paperclip, ImageIcon } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  currentUserId: string;
  onSelectConversation: (conversation: Conversation) => void;
  loading?: boolean;
  locale?: 'bs' | 'en';
  className?: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
  locale?: 'bs' | 'en';
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  isSelected,
  onClick,
  locale = 'bs',
}) => {
  const t = useTranslations('messaging')
  const dateLocale = locale === 'bs' ? bs : enUS;

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return format(date, 'HH:mm', { locale: dateLocale });
    } else if (diffInDays === 1) {
      return locale === 'bs' ? 'juče' : 'yesterday';
    } else if (diffInDays < 7) {
      return format(date, 'EEEE', { locale: dateLocale });
    } else {
      return format(date, 'dd.MM.yyyy', { locale: dateLocale });
    }
  };

  const getConversationTitle = () => {
    if (conversation.title) {
      return conversation.title;
    }
    
    if (conversation.type === 'job_related') {
      return t('jobChat');
    }
    
    if (conversation.type === 'group') {
      return t('groupChat');
    }
    
    // For direct conversations, show the other participant's name
    // Add safety check for participants
    if (!conversation.participants || conversation.participants.length === 0) {
      return t('unknown');
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    );
    
    return otherParticipant?.user.name || t('unknown');
  };

  const getConversationAvatar = () => {
    if (conversation.type === 'job_related') {
      return (
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
      );
    }
    
    if (conversation.type === 'group') {
      return (
        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
      );
    }
    
    // For direct conversations, show the other participant's avatar
    if (!conversation.participants || conversation.participants.length === 0) {
      return (
        <div className="w-14 h-14 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-lg">?</span>
        </div>
      )
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    );
    
    return (
      <div className="relative">
        <Avatar className="w-14 h-14">
          {otherParticipant?.user.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={otherParticipant.user.avatar_url} alt={otherParticipant.user.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {otherParticipant?.user.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </Avatar>
        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full"></div>
      </div>
    );
  };

  const getLastMessagePreview = () => {
    if (!conversation.last_message) {
      return t('messages.noMessages');
    }
    
    const message = conversation.last_message;
    const isCurrentUser = message.senderId === currentUserId;
    const senderName = isCurrentUser ? (locale === 'bs' ? 'Vi' : 'You') : message.sender?.name || 'User';
    
    if (message.messageType === 'file') {
      return (
        <span className="flex items-center gap-1">
          <Paperclip className="w-3 h-3" />
          <span className="font-medium">{senderName}:</span>
          {t('attachments.file')}
        </span>
      );
    }
    
    if (message.messageType === 'image') {
      return (
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          <span className="font-medium">{senderName}:</span>
          {t('attachments.image')}
        </span>
      );
    }
    
    const content = message.content || (locale === 'bs' ? 'Poruka' : 'Message');
    return (
      <span>
        <span className="font-medium">{senderName}:</span> {content}
      </span>
    );
  };

  return (
    <div
      className={cn(
        // NEW: Improved hover and selected states
        "flex items-center gap-3 p-3 cursor-pointer transition-all duration-200",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        "border-l-4 border-transparent", // Space for selection indicator
        isSelected 
          ? "bg-blue-50 dark:bg-blue-950/20 border-l-blue-500 shadow-sm" 
          : "hover:border-l-gray-200"
      )}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        {getConversationAvatar()}
        {conversation.archived && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
            <Archive className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-medium text-base truncate text-gray-900 dark:text-gray-100",
            conversation.unread_count > 0 ? "font-semibold" : ""
          )}>
            {getConversationTitle()}
          </h3>
          <div className="flex items-center gap-2">
            {conversation.last_message_at && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatLastMessageTime(conversation.last_message_at)}
              </span>
            )}
            {conversation.type === 'job_related' && (
              <Pin className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]",
            conversation.unread_count > 0 ? "font-medium text-gray-900 dark:text-gray-100" : ""
          )}>
            {getLastMessagePreview()}
          </p>
          
          {conversation.unread_count > 0 && (
            <div className="flex-shrink-0 ml-2">
              <div className="bg-blue-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton className="w-14 h-14 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  </div>
);

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  currentUserId,
  onSelectConversation,
  loading = false,
  locale = 'bs',
  className,
}) => {
  const t = useTranslations('messaging')
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ConversationItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 px-4 text-center", className)}>
        <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">
          {t('noConversations')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('startConversation')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="space-y-0">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            currentUserId={currentUserId}
            isSelected={selectedConversationId === conversation.id}
            onClick={() => onSelectConversation(conversation)}
            locale={locale}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
