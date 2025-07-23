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
  const tHeader = useTranslations('messaging');
  
  const getConversationTitle = () => {
    console.log('Getting conversation title for:', conversation);
    console.log('Conversation type:', conversation.type);
    console.log('Conversation jobTitle:', conversation.jobTitle);
    console.log('Conversation title:', conversation.title);
    console.log('Conversation participants:', conversation.participants);
    
    if (conversation.title) {
      return conversation.title;
    }
    
    if (conversation.type === 'job_related') {
      // Use jobTitle if available, otherwise fallback to generic text
      const jobTitle = conversation.jobTitle || tHeader('jobChat');
      console.log('Returning job title:', jobTitle);
      return jobTitle;
    }
    
    if (conversation.type === 'group') {
      return tHeader('groupChat');
    }
    
    // Add safety check for participants
    if (!conversation.participants || conversation.participants.length === 0) {
      console.log('No participants found, returning unknown');
      return tHeader('unknown');
    }
    
    // For direct conversations, show the other participant's name
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    );
    
    console.log('Other participant:', otherParticipant);
    const participantName = otherParticipant?.user?.name || tHeader('unknown');
    console.log('Returning participant name:', participantName);
    return participantName;
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

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 flex-1">
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          {conversation.type === 'direct' ? (
            conversation.participants
              .filter(p => !p.left_at && p.user_id !== currentUserId)
              .slice(0, 1)
              .map(participant => (
                <div key={participant.id} className="relative">
                  <Avatar className="w-10 h-10">
                    {participant.user.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={participant.user.avatar_url} alt={participant.user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {participant.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full"></div>
                </div>
              ))
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {renderConversationTitle()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {conversation.type === 'group' && (
                <span>{getParticipantCount()} members</span>
              )}
              {conversation.type === 'direct' && (
                <span>Active now</span>
              )}
              {conversation.archived && (
                <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {conversation.type === 'direct' && onCall && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCall('audio')}
              title="Audio call"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Phone className="w-5 h-5 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCall('video')}
              title="Video call"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Video className="w-5 h-5 text-blue-600" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {conversation.type === 'group' && (
              <>
                <DropdownMenuItem onClick={onViewParticipants} className="flex items-center gap-3 p-3">
                  <Users className="w-4 h-4" />
                  View participants
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem onClick={onArchive} className="flex items-center gap-3 p-3">
              <Archive className="w-4 h-4" />
              Archive conversation
            </DropdownMenuItem>
            
            {conversation.type === 'group' && (
              <DropdownMenuItem onClick={onLeave} className="flex items-center gap-3 p-3 text-orange-600">
                Leave conversation
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onDelete} className="flex items-center gap-3 p-3 text-red-600">
              Delete conversation
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
    <div className={cn("h-full bg-gray-50 dark:bg-gray-900 flex", className)}>
      {/* Conversation List - Meta Messenger Style */}
      <div className={cn(
        "border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-950",
        isMobile ? "w-full" : "w-80 lg:w-96"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Chats
          </h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Messenger"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          currentUserId={currentUserId}
          onSelectConversation={onSelectConversation}
          loading={loading.conversations}
          locale={locale}
          className="flex-1 overflow-y-auto"
        />
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-950",
        isMobile && selectedConversation ? "w-full" : "",
        isMobile && !selectedConversation ? "hidden" : ""
      )}>
        {selectedConversation ? (
          <>
            <ConversationHeader
              conversation={selectedConversation}
              currentUserId={currentUserId}
              onBack={isMobile ? handleBackToList : undefined}
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
              className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-950"
            />
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <MessageInput
                onSendMessage={onSendMessage}
                onTyping={onTyping}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-sm mx-auto p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Your Messages
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Send a message to start a conversation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
