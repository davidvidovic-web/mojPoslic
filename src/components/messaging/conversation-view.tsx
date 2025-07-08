'use client';

import React, { useState, useEffect } from 'react';
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
  onBack?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
  onCall?: (type: 'audio' | 'video') => void;
  onViewParticipants?: () => void;
  locale?: 'bs' | 'en';
  isMobile?: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onBack,
  onArchive,
  onDelete,
  onLeave,
  onCall,
  onViewParticipants,
  locale = 'bs',
  isMobile = false,
}) => {
  const getConversationTitle = () => {
    if (conversation.title) {
      return conversation.title;
    }
    
    if (conversation.type === 'job_related') {
      return locale === 'bs' ? 'Posao chat' : 'Job chat';
    }
    
    if (conversation.type === 'group') {
      return locale === 'bs' ? 'Grupni chat' : 'Group chat';
    }
    
    // For direct conversations, show the other participant's name
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== conversation.participants[0]?.user_id
    );
    
    return otherParticipant?.user.name || (locale === 'bs' ? 'Nepoznato' : 'Unknown');
  };

  const getParticipantCount = () => {
    const activeParticipants = conversation.participants.filter(p => !p.left_at);
    return activeParticipants.length;
  };

  const translations = {
    bs: {
      archive: 'Arhiviraj',
      delete: 'Obriši',
      leave: 'Napusti',
      audioCall: 'Audio poziv',
      videoCall: 'Video poziv',
      viewParticipants: 'Pogledaj učesnike',
      participants: 'učesnika',
      online: 'online',
    },
    en: {
      archive: 'Archive',
      delete: 'Delete',
      leave: 'Leave',
      audioCall: 'Audio call',
      videoCall: 'Video call',
      viewParticipants: 'View participants',
      participants: 'participants',
      online: 'online',
    },
  };

  const t = translations[locale];

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
            <h2 className="font-semibold text-foreground dark:text-foreground">{getConversationTitle()}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
              {conversation.type === 'group' && (
                <span>{getParticipantCount()} {t.participants}</span>
              )}
              {conversation.type === 'direct' && (
                <span>{t.online}</span>
              )}
              {conversation.archived && (
                <Badge variant="secondary" className="text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  {locale === 'bs' ? 'Arhivirano' : 'Archived'}
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
              title={t.audioCall}
              className="p-2"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCall('video')}
              title={t.videoCall}
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
                  {t.viewParticipants}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              {t.archive}
            </DropdownMenuItem>
            
            {conversation.type === 'group' && (
              <DropdownMenuItem onClick={onLeave} className="text-orange-600">
                {t.leave}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              {t.delete}
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
              {locale === 'bs' ? 'Poruke' : 'Messages'}
            </h1>
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
            loading={loading.conversations}
            locale={locale}
            className="flex-1"
          />
        </div>
      );
    }

    return (
      <div className={cn("h-full bg-background dark:bg-background flex flex-col", className)}>
        <ConversationHeader
          conversation={selectedConversation}
          onBack={handleBackToList}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onLeave={handleLeave}
          onCall={handleCall}
          onViewParticipants={handleViewParticipants}
          locale={locale}
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
          locale={locale}
          className="flex-1"
        />
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-background dark:bg-background flex", className)}>
      {/* Conversation List */}
      <div className="w-80 border-r flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold">
            {locale === 'bs' ? 'Poruke' : 'Messages'}
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
          onSelectConversation={onSelectConversation}
          loading={loading.conversations}
          locale={locale}
          className="flex-1"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ConversationHeader
              conversation={selectedConversation}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onLeave={handleLeave}
              onCall={handleCall}
              onViewParticipants={handleViewParticipants}
              locale={locale}
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
              locale={locale}
              className="flex-1"
            />
            <MessageInput
              onSendMessage={onSendMessage}
              onTyping={onTyping}
              locale={locale}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">
                {locale === 'bs' ? 'Izaberite konverzaciju' : 'Select a conversation'}
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                {locale === 'bs' 
                  ? 'Izaberite postojeću konverzaciju ili započnite novu'
                  : 'Choose an existing conversation or start a new one'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
