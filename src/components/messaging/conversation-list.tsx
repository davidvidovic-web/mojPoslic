'use client';

import React from 'react';
import { format } from 'date-fns';
import { bs, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Conversation } from '@/types/messaging';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, Archive, Users, Briefcase, Paperclip, ImageIcon } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  loading?: boolean;
  locale?: 'bs' | 'en';
  className?: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  locale?: 'bs' | 'en';
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
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
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== conversation.participants[0]?.user_id
    );
    
    return otherParticipant?.user.name || t('unknown');
  };

  const getConversationAvatar = () => {
    if (conversation.type === 'job_related') {
      return (
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
      );
    }
    
    if (conversation.type === 'group') {
      return (
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-green-600" />
        </div>
      );
    }
    
    // For direct conversations, show the other participant's avatar
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== conversation.participants[0]?.user_id
    );
    
    return (
      <Avatar className="w-10 h-10">
        {otherParticipant?.user.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={otherParticipant.user.avatar_url} alt={otherParticipant.user.name} />
        ) : (
          <div className="w-full h-full bg-muted dark:bg-muted flex items-center justify-center text-muted-foreground dark:text-muted-foreground text-sm">
            {otherParticipant?.user.name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </Avatar>
    );
  };

  const getLastMessagePreview = () => {
    if (!conversation.last_message) {
      return t('noMessages');
    }
    
    const message = conversation.last_message;
    
    if (message.message_type === 'file') {
      return (
        <span className="flex items-center gap-1">
          <Paperclip className="w-3 h-3" />
          {t('file')}
        </span>
      );
    }
    
    if (message.message_type === 'image') {
      return (
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          {t('image')}
        </span>
      );
    }
    
    return message.content || (locale === 'bs' ? 'Poruka' : 'Message');
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-accent dark:hover:bg-accent border-l-2",
        isSelected ? "bg-accent dark:bg-accent border-l-primary" : "border-l-transparent"
      )}
      onClick={onClick}
    >
      <div className="relative">
        {getConversationAvatar()}
        {conversation.archived && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted-foreground dark:bg-muted-foreground rounded-full flex items-center justify-center">
            <Archive className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-medium text-sm truncate",
            conversation.unread_count > 0 ? "font-semibold" : ""
          )}>
            {getConversationTitle()}
          </h3>
          <div className="flex items-center gap-1">
            {conversation.last_message_at && (
              <span className="text-xs text-gray-500">
                {formatLastMessageTime(conversation.last_message_at)}
              </span>
            )}
            {conversation.type === 'job_related' && (
              <Pin className="w-3 h-3 text-blue-500" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-xs text-gray-600 truncate",
            conversation.unread_count > 0 ? "font-medium text-gray-900" : ""
          )}>
            {getLastMessagePreview()}
          </p>
          
          {conversation.unread_count > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[18px] h-5">
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
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
            isSelected={selectedConversationId === conversation.id}
            onClick={() => onSelectConversation(conversation)}
            locale={locale}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
