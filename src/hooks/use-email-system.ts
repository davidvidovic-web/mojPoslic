'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'

export type EmailTemplate = 
  | 'application-received'
  | 'application-status-update'
  | 'new-message'
  | 'job-matched'
  | 'welcome'
  | 'job-posted'
  | 'connection-update'

export interface EmailData {
  // Common fields
  recipientName?: string
  senderName?: string
  
  // Job-related
  jobTitle?: string
  jobId?: string
  jobOwnerName?: string
  applicationDate?: string
  applicationUrl?: string
  
  // Application-related
  applicantName?: string
  newStatus?: string
  statusColor?: string
  message?: string
  
  // Connection-related
  connectionAmount?: number
  connectionBalance?: number
  
  // URLs
  dashboardUrl?: string
  jobUrl?: string
  profileUrl?: string
  
  [key: string]: string | number | boolean | undefined
}

interface UseEmailSystemProps {
  enabled?: boolean
}

export function useEmailSystem() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([])
  const { user } = useSupabaseAuth()

  // Send email using Edge Function
  const sendEmail = useCallback(async (
    to: string,
    template: EmailTemplate,
    data: EmailData,
    customSubject?: string
  ) => {
    if (!enabled) {
      console.warn('Email system is disabled')
      return { success: false, error: 'Email system disabled' }
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          template,
          data,
          customSubject
        }
      })

      if (error) throw error

      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      }
    }
  }, [enabled, supabase])

  // Send application received notification
  const sendApplicationReceivedEmail = useCallback(async (
    jobOwnerEmail: string,
    jobOwnerName: string,
    jobTitle: string,
    applicantName: string,
    jobId: string,
    applicationId: string
  ) => {
    return sendEmail(jobOwnerEmail, 'application-received', {
      jobOwnerName,
      jobTitle,
      applicantName,
      applicationDate: new Date().toLocaleDateString(),
      applicationUrl: `${window.location.origin}/dashboard/jobs/${jobId}/applications/${applicationId}`,
      jobUrl: `${window.location.origin}/jobs/${jobId}`
    })
  }, [sendEmail])

  // Send application status update
  const sendApplicationStatusEmail = useCallback(async (
    applicantEmail: string,
    applicantName: string,
    jobTitle: string,
    newStatus: string,
    message?: string,
    jobId?: string
  ) => {
    const statusColors: Record<string, string> = {
      'REVIEWED': '#3b82f6',
      'SHORTLISTED': '#10b981',
      'SELECTED': '#059669',
      'REJECTED': '#ef4444',
      'WITHDRAWN': '#6b7280'
    }

    return sendEmail(applicantEmail, 'application-status-update', {
      applicantName,
      jobTitle,
      newStatus,
      statusColor: statusColors[newStatus] || '#6b7280',
      message,
      dashboardUrl: `${window.location.origin}/dashboard`,
      jobUrl: jobId ? `${window.location.origin}/jobs/${jobId}` : undefined
    })
  }, [sendEmail])

  // Send new message notification
  const sendNewMessageEmail = useCallback(async (
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ) => {
    return sendEmail(recipientEmail, 'new-message', {
      recipientName,
      senderName,
      messagePreview,
      conversationUrl: `${window.location.origin}/dashboard/messages?conversation=${conversationId}`,
      dashboardUrl: `${window.location.origin}/dashboard`
    })
  }, [sendEmail])

  // Send job match notification
  const sendJobMatchEmail = useCallback(async (
    userEmail: string,
    userName: string,
    jobTitle: string,
    jobId: string,
    matchScore: number
  ) => {
    return sendEmail(userEmail, 'job-matched', {
      recipientName: userName,
      jobTitle,
      matchScore: Math.round(matchScore * 100),
      jobUrl: `${window.location.origin}/jobs/${jobId}`,
      dashboardUrl: `${window.location.origin}/dashboard`
    })
  }, [sendEmail])

  // Send welcome email
  const sendWelcomeEmail = useCallback(async (
    userEmail: string,
    userName: string,
    userRole: string
  ) => {
    return sendEmail(userEmail, 'welcome', {
      recipientName: userName,
      userRole,
      dashboardUrl: `${window.location.origin}/dashboard`,
      profileUrl: `${window.location.origin}/dashboard/profile`,
      jobsUrl: `${window.location.origin}/jobs`
    })
  }, [sendEmail])

  // Send job posted confirmation
  const sendJobPostedEmail = useCallback(async (
    posterEmail: string,
    posterName: string,
    jobTitle: string,
    jobId: string
  ) => {
    return sendEmail(posterEmail, 'job-posted', {
      recipientName: posterName,
      jobTitle,
      jobUrl: `${window.location.origin}/jobs/${jobId}`,
      dashboardUrl: `${window.location.origin}/dashboard`,
      editJobUrl: `${window.location.origin}/dashboard/jobs/${jobId}/edit`
    })
  }, [sendEmail])

  // Send connection update notification
  const sendConnectionUpdateEmail = useCallback(async (
    userEmail: string,
    userName: string,
    connectionAmount: number,
    connectionBalance: number,
    reason: string
  ) => {
    return sendEmail(userEmail, 'connection-update', {
      recipientName: userName,
      connectionAmount: Math.abs(connectionAmount),
      connectionBalance,
      reason,
      isDeduction: connectionAmount < 0,
      dashboardUrl: `${window.location.origin}/dashboard`,
      connectionHistoryUrl: `${window.location.origin}/dashboard/connections`
    })
  }, [sendEmail])

  // Bulk email sending (for system notifications)
  const sendBulkEmail = useCallback(async (
    recipients: Array<{ email: string; data: EmailData }>,
    template: EmailTemplate,
    customSubject?: string
  ) => {
    const results = await Promise.allSettled(
      recipients.map(recipient =>
        sendEmail(recipient.email, template, recipient.data, customSubject)
      )
    )

    const successes = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length

    const failures = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.success)
    ).length

    return {
      total: recipients.length,
      successes,
      failures,
      results
    }
  }, [sendEmail])

  // Test email functionality
  const sendTestEmail = useCallback(async (
    testEmail: string,
    template: EmailTemplate = 'welcome'
  ) => {
    const testData: EmailData = {
      recipientName: 'Test User',
      senderName: 'MojPoslic System',
      jobTitle: 'Test Job Position',
      jobId: 'test-job-id',
      applicantName: 'Test Applicant',
      newStatus: 'REVIEWED',
      statusColor: '#3b82f6',
      connectionAmount: 5,
      connectionBalance: 15,
      dashboardUrl: `${window.location.origin}/dashboard`,
      jobUrl: `${window.location.origin}/jobs/test-job`,
      applicationUrl: `${window.location.origin}/dashboard/applications/test`
    }

    return sendEmail(testEmail, template, testData, 'Test Email - MojPoslic System')
  }, [sendEmail])

  return {
    // Core functionality
    sendEmail,
    
    // Specific email types
    sendApplicationReceivedEmail,
    sendApplicationStatusEmail,
    sendNewMessageEmail,
    sendJobMatchEmail,
    sendWelcomeEmail,
    sendJobPostedEmail,
    sendConnectionUpdateEmail,
    
    // Utility functions
    sendBulkEmail,
    sendTestEmail,
    
    // State
    isEnabled: enabled
  }
}
