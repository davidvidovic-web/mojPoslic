'use client'

import { useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useOptimizedMessaging } from './use-optimized-messaging'
import { useOptimizedConversations } from './use-optimized-conversations'

export function useOptimizedJobMessaging() {
  const { user } = useAuth()
  const { refreshConversations } = useOptimizedMessaging()
  const { setActiveConversation } = useOptimizedConversations()

  // Create a job-related conversation optimized
  const createJobConversation = useCallback(async (
    jobId: string,
    otherUserId: string,
    jobTitle: string
  ) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/messaging/job-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId,
          otherUserId,
          jobTitle
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create job conversation: ${response.status}`)
      }

      const { conversation } = await response.json()
      
      // Refresh conversations to include the new one
      refreshConversations()
      
      return conversation
    } catch (error) {
      console.error('Error creating job conversation:', error)
      throw error
    }
  }, [user, refreshConversations])

  // Start messaging for a job with optimized flow
  const startJobMessaging = useCallback(async (
    jobId: string,
    otherUserId: string,
    jobTitle: string
  ) => {
    try {
      const conversation = await createJobConversation(jobId, otherUserId, jobTitle)
      
      // Set as active conversation in optimized system
      setActiveConversation(conversation)
      
      return conversation
    } catch (error) {
      console.error('Error starting job messaging:', error)
      throw error
    }
  }, [createJobConversation, setActiveConversation])

  // Check if user can message another user about a job
  const canMessageUser = useCallback(async (targetUserId: string) => {
    if (!user) return false

    try {
      const response = await fetch(`/api/messaging/can-message/${targetUserId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        return false
      }

      const { canMessage } = await response.json()
      return canMessage
    } catch (error) {
      console.error('Error checking messaging permission:', error)
      return false
    }
  }, [user])

  return {
    createJobConversation,
    startJobMessaging,
    canMessageUser
  }
}
