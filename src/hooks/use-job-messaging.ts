'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface PrivacySettings {
  profileVisibility: 'public' | 'verified_only' | 'private'
  showApplicationHistory: boolean
  allowDirectMessages: boolean
  showOnlineStatus: boolean
  allowDataAnalytics: boolean
}

interface ConversationInfo {
  id: string
  type: 'direct' | 'group' | 'job_related'
  title?: string
  participants: Array<{
    user_id: string
    user: {
      name: string
      role: string
    }
  }>
}

export function useJobApplicationMessaging() {
  const { user } = useAuth()
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const t = useTranslations('messaging')

  /**
   * Create or open conversation for job application
   */
  const createJobConversation = useCallback(async (
    jobId: string,
    applicantId: string,
    jobTitle: string
  ): Promise<ConversationInfo | null> => {
    if (!user?.id) {
      toast.error(t('errors.notAuthenticated'))
      return null
    }

    setIsCreatingConversation(true)
    
    try {
      const response = await fetch('/api/messaging/job-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          applicantId,
          jobTitle
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create conversation')
      }

      toast.success(t('conversationCreated'))
      return data.conversation
    } catch (error) {
      console.error('Error creating job conversation:', error)
      toast.error(t('errors.conversationFailed'))
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }, [user?.id, t])

  /**
   * Check if current user can message another user
   */
  const canMessageUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id || user.id === targetUserId) {
      return false
    }

    try {
      const response = await fetch(`/api/messaging/can-message/${targetUserId}`)
      const data = await response.json()
      return data.canMessage || false
    } catch (error) {
      console.error('Error checking message permissions:', error)
      return false
    }
  }, [user?.id])

  /**
   * Open messaging interface for a specific user
   */
  const openDirectMessage = useCallback(async (targetUserId: string) => {
    if (!user?.id) {
      toast.error(t('errors.notAuthenticated'))
      return
    }

    try {
      const canMessage = await canMessageUser(targetUserId)
      if (!canMessage) {
        toast.error(t('errors.cannotMessage'))
        return
      }

      // Open messaging interface
      const messagingUrl = `/dashboard?user=${targetUserId}`
      window.open(messagingUrl, '_blank')
    } catch (error) {
      console.error('Error opening direct message:', error)
      toast.error(t('errors.openMessageFailed'))
    }
  }, [user?.id, canMessageUser, t])

  /**
   * Open job-related conversation
   */
  const openJobConversation = useCallback((jobId: string, applicantId: string) => {
    if (!user?.id) {
      toast.error(t('errors.notAuthenticated'))
      return
    }

    // Open messaging interface with job context
    const messagingUrl = `/dashboard?job=${jobId}&user=${applicantId}`
    window.open(messagingUrl, '_blank')
  }, [user?.id, t])

  return {
    createJobConversation,
    canMessageUser,
    openDirectMessage,
    openJobConversation,
    isCreatingConversation
  }
}

/**
 * Hook for privacy-aware messaging features
 */
export function useMessagingPrivacy() {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  /**
   * Load user's privacy settings
   */
  const loadPrivacySettings = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/privacy-settings')
      const data = await response.json()
      setPrivacySettings(data)
    } catch (error) {
      console.error('Error loading privacy settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  /**
   * Update privacy settings
   */
  const updatePrivacySettings = useCallback(async (newSettings: Partial<PrivacySettings>) => {
    if (!user?.id) return false

    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setPrivacySettings(prev => ({ ...prev, ...newSettings } as PrivacySettings))
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      return false
    }
  }, [user?.id])

  return {
    privacySettings,
    isLoading,
    loadPrivacySettings,
    updatePrivacySettings
  }
}
