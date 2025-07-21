'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Conversation, Message, MessageAttachment, TypingUser } from '@/types/messaging';
import { ConversationList } from './conversation-list';
import { MessageArea } from './message-area';
import { MessageInput } from './message-input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Phone, 
  Video, 
  Users, 
  Archive, 
  Search,
  ArrowLeft,
  Settings,
  MessageCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ConversationViewProps {
  conversations: Conversation[];
  selectedConversation?: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSelectConversation: (conversation: Conversation) => void;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onLoadMoreMessages?: () => void;
  onTyping?: (isTyping: boolean) => void;
  onAttachmentClick?: (attachment: MessageAttachment) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onLeaveConversation?: (conversationId: string) => void;
  onStartCall?: (conversationId: string, type: 'audio' | 'video') => void;
  onViewParticipants?: (conversationId: string) => void;
  typingUsers?: TypingUser[];
  loading?: {
    conversations?: boolean;
    messages?: boolean;
  };
  hasMoreMessages?: boolean;
  locale?: 'bs' | 'en';
  isMobile?: boolean;
  className?: string;
}

interface ConversationHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
  onCall?: (type: 'audio' | 'video') => void;
  onViewParticipants?: () => void;
  isMobile?: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  currentUserId,
  onBack,
  onArchive,
  onDelete,
  onLeave,
  onCall,
  onViewParticipants,
  isMobile = false,
}) => {
  const getConversationTitle = () => {
    if (conversation.title) {
      return conversation.title;
    }
    
    if (conversation.type === 'job_related') {
      // Use job title if available, otherwise fallback to generic text
      return conversation.jobTitle || t('jobChat');
    }
    
    if (conversation.type === 'group') {
      return t('groupChat');
    }
    
    // Add safety check for participants
    if (!conversation.participants || conversation.participants.length === 0) {
      return t('unknown');
    }
    
    // For direct conversations, show the other participant's name
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    );
    
    return otherParticipant?.user?.name || t('unknown');
  };

  const renderConversationTitle = () => {
    const title = getConversationTitle();
    
    // If it's a job-related conversation and we have a job_id, make it a link
    if (conversation.type === 'job_related' && conversation.job_id) {
      return (
        <a 
          href={`/jobs/${conversation.job_id}`}
          className="font-semibold text-foreground dark:text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}
        </a>
      );
    }
    
    return <h2 className="font-semibold text-foreground dark:text-foreground">{title}</h2>;
  };

  const getParticipantCount = () => {
    const activeParticipants = conversation.participants.filter(p => !p.left_at);
    return activeParticipants.length;
  };

  const t = useTranslations('messaging');

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background dark:bg-background">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          {conversation.type === 'direct' ? (
            conversation.participants
              .filter(p => !p.left_at)
              .slice(0, 1)
              .map(participant => (
                <Avatar key={participant.id} className="w-10 h-10">
                  {participant.user.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={participant.user.avatar_url} alt={participant.user.name} />
                  ) : (
                    <div className="w-full h-full bg-muted dark:bg-muted flex items-center justify-center text-muted-foreground dark:text-muted-foreground">
                      {participant.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
              ))
          ) : (
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          )}
          
          <div>
            {renderConversationTitle()}
            <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
              {conversation.type === 'group' && (
                <span>{getParticipantCount()} {t('actions.participants')}</span>
              )}
              {conversation.type === 'direct' && (
                <span>{t('status.online')}</span>
              )}
              {conversation.archived && (
                <Badge variant="secondary" className="text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  {t('actions.archived')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {conversation.type === 'direct' && onCall && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCall('audio')}
              title={t('actions.audioCall')}
              className="p-2"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCall('video')}
              title={t('actions.videoCall')}
              className="p-2"
            >
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {conversation.type === 'group' && (
              <>
                <DropdownMenuItem onClick={onViewParticipants}>
                  <Users className="w-4 h-4 mr-2" />
                  {t('actions.viewParticipants')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              {t('archive')}
            </DropdownMenuItem>
            
            {conversation.type === 'group' && (
              <DropdownMenuItem onClick={onLeave} className="text-orange-600">
                {t('actions.leave')}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversations,
  selectedConversation,
  messages,
  currentUserId,
  onSelectConversation,
  onSendMessage,
  onLoadMoreMessages,
  onTyping,
  onAttachmentClick,
  onArchiveConversation,
  onDeleteConversation,
  onLeaveConversation,
  onStartCall,
  onViewParticipants,
  typingUsers = [],
  loading = {},
  hasMoreMessages = false,
  locale = 'bs',
  isMobile = false,
  className,
}) => {
  const t = useTranslations('messaging');
  const [showConversationList, setShowConversationList] = useState(!isMobile);

  // On mobile, show conversation list when no conversation is selected
  useEffect(() => {
    if (isMobile) {
      setShowConversationList(!selectedConversation);
    }
  }, [isMobile, selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const handleArchive = () => {
    if (selectedConversation && onArchiveConversation) {
      onArchiveConversation(selectedConversation.id);
    }
  };

  const handleDelete = () => {
    if (selectedConversation && onDeleteConversation) {
      onDeleteConversation(selectedConversation.id);
      if (isMobile) {
        handleBackToList();
      }
    }
  };

  const handleLeave = () => {
    if (selectedConversation && onLeaveConversation) {
      onLeaveConversation(selectedConversation.id);
      if (isMobile) {
        handleBackToList();
      }
    }
  };

  const handleCall = (type: 'audio' | 'video') => {
    if (selectedConversation && onStartCall) {
      onStartCall(selectedConversation.id, type);
    }
  };

  const handleViewParticipants = () => {
    if (selectedConversation && onViewParticipants) {
      onViewParticipants(selectedConversation.id);
    }
  };

  if (isMobile) {
    if (showConversationList || !selectedConversation) {
      return (
        <div className={cn("h-full bg-background dark:bg-background", className)}>
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-semibold">
              {t('title')}
            </h1>
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            currentUserId={currentUserId}
            onSelectConversation={handleSelectConversation}
            loading={loading.conversations}
            locale={locale}
            className="flex-1"
          />
        </div>
      );
    }

    return (
      <div className={cn("h-full bg-background dark:bg-background flex flex-col min-h-0", className)}>
        <ConversationHeader
          conversation={selectedConversation}
          currentUserId={currentUserId}
          onBack={handleBackToList}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onLeave={handleLeave}
          onCall={handleCall}
          onViewParticipants={handleViewParticipants}
          isMobile={isMobile}
        />
        <MessageArea
          messages={messages}
          currentUserId={currentUserId}
          loading={loading.messages}
          hasMore={hasMoreMessages}
          onLoadMore={onLoadMoreMessages}
          onAttachmentClick={onAttachmentClick}
          typingUsers={typingUsers}
          className="flex-1 min-h-0 overflow-hidden"
        />
        <div className="flex-shrink-0 border-t bg-background">
          <MessageInput
            onSendMessage={onSendMessage}
            onTyping={onTyping}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-background dark:bg-background flex", className)}>
      {/* Conversation List */}
      <div className="w-80 border-r flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold">
            {t('title')}
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          currentUserId={currentUserId}
          onSelectConversation={onSelectConversation}
          loading={loading.conversations}
          locale={locale}
          className="flex-1"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            <ConversationHeader
              conversation={selectedConversation}
              currentUserId={currentUserId}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onLeave={handleLeave}
              onCall={handleCall}
              onViewParticipants={handleViewParticipants}
              isMobile={false}
            />
            <MessageArea
              messages={messages}
              currentUserId={currentUserId}
              loading={loading.messages}
              hasMore={hasMoreMessages}
              onLoadMore={onLoadMoreMessages}
              onAttachmentClick={onAttachmentClick}
              typingUsers={typingUsers}
              className="flex-1 min-h-0 overflow-hidden"
            />
            <div className="flex-shrink-0 border-t bg-background">
              <MessageInput
                onSendMessage={onSendMessage}
                onTyping={onTyping}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">
                {t('selectConversation')}
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                {t('startConversation')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
