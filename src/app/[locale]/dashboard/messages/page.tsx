'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MessagingProvider, useMessaging } from '@/contexts/messaging-context';
import { ConversationView } from '@/components/messaging/conversation-view';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageAttachment, Conversation } from '@/types/messaging';
import { extractMessagingParams } from '@/lib/messaging/messaging-utils';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useTranslations } from 'next-intl';

interface DashboardMessagesContentProps {
  locale?: 'bs' | 'en';
}

const DashboardMessagesContent: React.FC<DashboardMessagesContentProps> = ({ locale = 'bs' }) => {
  const t = useTranslations('common');
  const { user, loading } = useAuth();
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
    createJobConversation,
  } = useMessaging();

  // Track which URLs we've already processed to prevent infinite loops
  const processedParamsRef = useRef<string>('');

  useEffect(() => {
    // Don't redirect immediately - let the middleware handle authentication
    // This component will only render if the user is authenticated (due to middleware)
    if (!loading && !user) {
      console.log('No user found after loading, redirecting to sign in');
      router.push('/auth/signin');
      return;
    }
  }, [user, loading, router]);

  // Handle conversation startup from URL parameters
  useEffect(() => {
    if (user && !loading) {
      const { startConversationUserId, jobId, userId } = extractMessagingParams(searchParams);
      
      // Create a unique key for current params to prevent duplicate processing
      const currentParams = `${jobId || ''}-${userId || ''}-${startConversationUserId || ''}`;
      
      // Skip if we've already processed these exact parameters
      if (processedParamsRef.current === currentParams) {
        return;
      }
      
      // Handle job-related conversation creation
      if (jobId && userId) {
        console.log('Creating job conversation for job:', jobId, 'user:', userId);
        
        // Mark these params as processed immediately to prevent re-runs
        processedParamsRef.current = currentParams;
        
        // Check if job conversation already exists
        const existingConversation = state.conversations.find(conv => 
          conv.type === 'job_related' && 
          conv.job_id === jobId &&
          conv.participants && 
          conv.participants.some(p => p.user_id === userId)
        );

        if (existingConversation) {
          console.log('Found existing job conversation:', existingConversation.id);
          setActiveConversation(existingConversation);
          loadMessages(existingConversation.id);
          
          // Clean up URL parameters
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('job');
          newUrl.searchParams.delete('user');
          router.replace(newUrl.pathname + newUrl.search);
        } else {
          console.log('Creating new job conversation...');
          // Fetch job details to get the real title
          (async () => {
            try {
              const response = await fetch(`/api/jobs/${jobId}`);
              if (response.ok) {
                const jobData = await response.json();
                const jobTitle = jobData.title || 'Job Application Discussion';
              
              createJobConversation(jobId, userId, jobTitle)
                .then((conversation) => {
                  console.log('Job conversation created:', conversation.id);
                  setActiveConversation(conversation);
                  loadMessages(conversation.id);
                  
                  // Clean up URL parameters
                  const newUrl = new URL(window.location.href);
                  newUrl.searchParams.delete('job');
                  newUrl.searchParams.delete('user');
                  router.replace(newUrl.pathname + newUrl.search);
                })
                .catch((error) => {
                  console.error('Failed to create job conversation:', error);
                  // Reset the processed flag on error so user can retry
                  processedParamsRef.current = '';
                });
            } else {
              // Fallback to placeholder title if job fetch fails
              createJobConversation(jobId, userId, 'Job Application Discussion')
                .then((conversation) => {
                  console.log('Job conversation created:', conversation.id);
                  setActiveConversation(conversation);
                  loadMessages(conversation.id);
                  
                  // Clean up URL parameters
                  const newUrl = new URL(window.location.href);
                  newUrl.searchParams.delete('job');
                  newUrl.searchParams.delete('user');
                  router.replace(newUrl.pathname + newUrl.search);
                })
                .catch((error) => {
                  console.error('Failed to create job conversation:', error);
                  // Reset the processed flag on error so user can retry
                  processedParamsRef.current = '';
                });
            }
          } catch (error) {
            console.error('Error fetching job details:', error);
            // Fallback to placeholder title if fetch fails
            createJobConversation(jobId, userId, 'Job Application Discussion')
              .then((conversation) => {
                console.log('Job conversation created:', conversation.id);
                setActiveConversation(conversation);
                loadMessages(conversation.id);
                
                // Clean up URL parameters
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('job');
                newUrl.searchParams.delete('user');
                router.replace(newUrl.pathname + newUrl.search);
              })
              .catch((error) => {
                console.error('Failed to create job conversation:', error);
                // Reset the processed flag on error so user can retry
                processedParamsRef.current = '';
              });
            }
          })();
        }
      }
      // Handle direct conversation creation
      else if (startConversationUserId) {
        console.log('Creating direct conversation with user:', startConversationUserId);
        
        // Mark these params as processed immediately to prevent re-runs
        processedParamsRef.current = currentParams;
        
        // Check if conversation already exists
        const existingConversation = state.conversations.find(conv => 
          conv.type === 'direct' && 
          conv.participants && 
          conv.participants.some(p => p.user_id === startConversationUserId)
        );

        if (existingConversation) {
          console.log('Found existing direct conversation:', existingConversation.id);
          setActiveConversation(existingConversation);
          loadMessages(existingConversation.id);
          
          // Clean up URL parameters
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('startConversation');
          newUrl.searchParams.delete('userName');
          router.replace(newUrl.pathname + newUrl.search);
        } else {
          console.log('Creating new direct conversation...');
          // Create new direct conversation
          createDirectConversation(startConversationUserId)
            .then((conversation) => {
              console.log('Direct conversation created:', conversation.id);
              setActiveConversation(conversation);
              loadMessages(conversation.id);
              
              // Clean up URL parameters
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('startConversation');
              newUrl.searchParams.delete('userName');
              router.replace(newUrl.pathname + newUrl.search);
            })
            .catch((error) => {
              console.error('Failed to create conversation:', error);
              // Reset the processed flag on error so user can retry
              processedParamsRef.current = '';
            });
        }
      } else if (currentParams !== processedParamsRef.current) {
        // No special params, just mark as processed to prevent unnecessary re-runs
        processedParamsRef.current = currentParams;
      }
    }
  }, [user, loading, state.conversations, searchParams, setActiveConversation, loadMessages, createDirectConversation, createJobConversation, router]);

  // Show loading state while authentication is loading
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t('ui.loading')}
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!state.activeConversation) return;
    
    try {
      await sendMessage({
        conversationId: state.activeConversation.id,
        content,
        messageType: attachments && attachments.length > 0 ? 'file' : 'text',
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
    if (state.activeConversation && state.hasMoreMessages && !state.isLoadingMessages) {
      const oldestMessage = state.messages[0];
      console.log('Loading more messages. Current oldest message:', oldestMessage?.createdAt, 'Has more:', state.hasMoreMessages, 'Loading:', state.isLoadingMessages);
      if (oldestMessage) {
        loadMessages(state.activeConversation.id, oldestMessage.createdAt);
      }
    } else {
      console.log('Not loading more messages:', {
        hasConversation: !!state.activeConversation,
        hasMore: state.hasMoreMessages,
        isLoading: state.isLoadingMessages
      });
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
        hasMoreMessages={state.hasMoreMessages}
        locale={locale}
        isMobile={false}
        className="h-full"
      />
    </div>
  );
};

export default function DashboardMessagesPage() {
  const { user } = useAuth();
  const t = useTranslations('messaging');
  // In a real app, you'd get the locale from your i18n setup
  const locale = 'bs' as const;

  return (
    <DashboardLayout 
      activeTab="messages" 
      title={t('title')} 
      subtitle={t('subtitle')}
      userRole={user?.role}
    >
      <MessagingProvider>
        <DashboardMessagesContent locale={locale} />
      </MessagingProvider>
    </DashboardLayout>
  );
}
