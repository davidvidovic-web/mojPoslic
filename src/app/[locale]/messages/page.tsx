'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MessagingProvider, useMessaging } from '@/contexts/messaging-context'
import { ConversationView } from '@/components/messaging/conversation-view'
import { useRouter } from 'next/navigation'
import { getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { Conversation } from '@/types/messaging'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { 
  Sunrise, 
  Sun, 
  Moon,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Zap,
  DollarSign,
  BarChart3,
  Puzzle,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'

// Helper function to get full name display
const getFullNameDisplay = (name?: string | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  return name.trim()
}

export default function MessagesPage() {
  const t = useTranslations('navigation.tabs')
  const tGeneral = useTranslations()
  const { user } = useAuth()
  const router = useRouter()

  // Navigate to section
  const navigateToSection = (section: string) => {
    switch (section) {
      case 'overview':
        router.push('/dashboard')
        break
      case 'jobs':
        router.push('/dashboard?tab=jobs')
        break
      case 'messages':
        // Already on messages page
        break
      case 'connections':
        router.push('/connections')
        break
      case 'finances':
        toast.info('Finances feature coming soon!')
        break
      case 'analytics':
        toast.info('Analytics feature coming soon!')
        break
      case 'integrations':
        toast.info('Integrations feature coming soon!')
        break
    }
  }

  // Get time-based greeting with icon
  const { greeting, iconName } = getTimeBasedGreetingWithIcon()
  
  // Helper to render the appropriate icon
  const renderTimeIcon = () => {
    const iconProps = { className: "h-4 w-4" }
    switch (iconName) {
      case 'Sunrise': return <Sunrise {...iconProps} />
      case 'Sun': return <Sun {...iconProps} />
      case 'Moon': return <Moon {...iconProps} />
      default: return <Sun {...iconProps} />
    }
  }

  // Get role-specific theme colors and content
  const getRoleTheme = () => {
    switch (user?.role) {
      case 'client':
        return {
          gradientFrom: 'from-blue-50',
          gradientTo: 'to-indigo-50',
          darkGradientFrom: 'dark:from-blue-950/30',
          darkGradientTo: 'dark:to-indigo-950/30',
          borderColor: 'border-blue-100 dark:border-blue-900/30',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          iconBorder: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-600 dark:text-blue-300',
          titleColor: 'text-blue-900 dark:text-blue-100',
          tagline: 'Hiring Made Simple'
        }
      case 'company':
        return {
          gradientFrom: 'from-purple-50',
          gradientTo: 'to-indigo-50',
          darkGradientFrom: 'dark:from-purple-950/30',
          darkGradientTo: 'dark:to-indigo-950/30',
          borderColor: 'border-purple-100 dark:border-purple-900/30',
          iconBg: 'bg-purple-100 dark:bg-purple-900/40',
          iconBorder: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400',
          textColor: 'text-purple-600 dark:text-purple-300',
          titleColor: 'text-purple-900 dark:text-purple-100',
          tagline: 'Scaling with Top Talent'
        }
      default: // tasker
        return {
          gradientFrom: 'from-emerald-50',
          gradientTo: 'to-green-50',
          darkGradientFrom: 'dark:from-emerald-950/30',
          darkGradientTo: 'dark:to-green-950/30',
          borderColor: 'border-emerald-100 dark:border-emerald-900/30',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
          iconBorder: 'border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          textColor: 'text-emerald-600 dark:text-emerald-300',
          titleColor: 'text-emerald-900 dark:text-emerald-100',
          tagline: 'Ready to Work'
        }
    }
  }

  const theme = getRoleTheme()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} ${theme.darkGradientFrom} ${theme.darkGradientTo} rounded-lg p-6 border ${theme.borderColor}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${theme.iconBg} border ${theme.iconBorder}`}>
                <MessageSquare className={`h-6 w-6 ${theme.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {/* Greeting message */}
                  <div className={`flex items-center gap-2 ${theme.textColor}`}>
                    {renderTimeIcon()}
                    <span className="text-lg font-medium">{greeting}!</span>
                  </div>
                  
                  {/* Full name - bold and prominent */}
                  <h1 className={`text-xl sm:text-2xl font-bold ${theme.titleColor}`}>
                    {getFullNameDisplay(user?.name)}
                  </h1>
                  
                  {/* Page-specific tagline */}
                  <p className={`text-sm ${theme.textColor}`}>
                    {tGeneral('pageMessages.messagesAndConversations')}
                  </p>
                </div>
              </div>
            </div>
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm ${theme.textColor}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${theme.iconColor.replace('text-', 'bg-')} rounded-full`}></div>
                <span>{tGeneral('pageMessages.stayConnected')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{tGeneral('pageMessages.realTimeMessaging')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Responsive Navigation */}
        <div className="space-y-6">
          {/* Section Selector - Dropdown on mobile, Tabs on tablet+ */}
          <div className="block md:hidden">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label htmlFor="section-select" className="text-sm font-medium text-foreground whitespace-nowrap">
                  {tGeneral('dashboard.navigation.viewSection')}
                </label>
                <Select value="messages" onValueChange={navigateToSection}>
                  <SelectTrigger className="flex-1" id="section-select">
                    <SelectValue placeholder={tGeneral('dashboard.navigation.selectSection')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        {t('overview')}
                      </div>
                    </SelectItem>
                    <SelectItem value="jobs">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        {t('jobs')}
                      </div>
                    </SelectItem>
                    <SelectItem value="messages">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        {t('messages')}
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        {t('connections')}
                      </div>
                    </SelectItem>
                    <SelectItem value="finances" disabled>
                      <div className="flex items-center gap-2 opacity-50">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        {t('finances')}
                        <Lock className="h-3 w-3 ml-1" />
                      </div>
                    </SelectItem>
                    <SelectItem value="analytics" disabled>
                      <div className="flex items-center gap-2 opacity-50">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        {t('analytics')}
                        <Lock className="h-3 w-3 ml-1" />
                      </div>
                    </SelectItem>
                    <SelectItem value="integrations" disabled>
                      <div className="flex items-center gap-2 opacity-50">
                        <Puzzle className="h-4 w-4 text-orange-600" />
                        {t('integrations')}
                        <Lock className="h-3 w-3 ml-1" />
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs for tablet and desktop */}
          <div className="hidden md:block">
            <Tabs value="messages" onValueChange={navigateToSection} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  <span className="hidden lg:inline">{t('overview')}</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span className="hidden lg:inline">{t('jobs')}</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="hidden lg:inline">{t('messages')}</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="hidden lg:inline">{t('connections')}</span>
                </TabsTrigger>
                <TabsTrigger value="finances" disabled className="opacity-50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="hidden lg:inline">{t('finances')}</span>
                    <Lock className="h-3 w-3" />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="analytics" disabled className="opacity-50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    <span className="hidden lg:inline">{t('analytics')}</span>
                    <Lock className="h-3 w-3" />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="integrations" disabled className="opacity-50">
                  <div className="flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-orange-600" />
                    <span className="hidden lg:inline">{t('integrations')}</span>
                    <Lock className="h-3 w-3" />
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Messages Content */}
          <div className="h-[600px] border rounded-lg overflow-hidden">
            <MessagingProvider>
              <MessagesContent />
            </MessagingProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

// Messages content component that uses messaging context
function MessagesContent() {
  const { user } = useAuth()
  const router = useRouter()
  
  const {
    state,
    setActiveConversation,
    sendMessage,
    loadMessages,
    sendTypingIndicator,
    archiveConversation,
    markConversationAsRead,
  } = useMessaging()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, router])

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    markConversationAsRead(conversation.id)
    loadMessages(conversation.id)
  }

  // Handle sending messages
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!state.activeConversation) return
    
    try {
      await sendMessage({
        conversation_id: state.activeConversation.id,
        content,
        message_type: attachments && attachments.length > 0 ? 'file' : 'text',
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle typing indicators
  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator(isTyping)
  }

  // Handle various conversation actions
  const handleArchiveConversation = (conversationId: string) => {
    archiveConversation(conversationId)
  }

  const handleDeleteConversation = (conversationId: string) => {
    // Implement delete logic
    console.log('Delete conversation:', conversationId)
  }

  const handleLoadMoreMessages = () => {
    if (state.activeConversation) {
      loadMessages(state.activeConversation.id)
    }
  }

  return (
    <ConversationView
      conversations={state.conversations}
      selectedConversation={state.activeConversation}
      messages={state.messages}
      currentUserId={user?.id || ''}
      onSelectConversation={handleSelectConversation}
      onSendMessage={handleSendMessage}
      onLoadMoreMessages={handleLoadMoreMessages}
      onTyping={handleTyping}
      onArchiveConversation={handleArchiveConversation}
      onDeleteConversation={handleDeleteConversation}
      onLeaveConversation={handleDeleteConversation}
      typingUsers={state.typingUsers}
      loading={{
        conversations: state.isLoading,
        messages: state.isLoadingMessages,
      }}
      hasMoreMessages={state.messages.length > 0}
      locale="bs"
      isMobile={false}
      className="h-full"
    />
  )
}
