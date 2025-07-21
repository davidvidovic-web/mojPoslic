import { ConversationService } from './conversation-service'
import { MessageService } from './message-service'
import { PrivacyService } from './privacy-service'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Create admin Supabase client that bypasses RLS
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Enhanced messaging integration service for job application workflow
 * Integrates Supabase messaging with privacy controls and notification system
 */
export class MessagingIntegrationService {
  /**
   * Create a job conversation with privacy checks and automatic welcome message
   */
  static async createJobConversationWithWelcome(
    jobId: string,
    clientId: string,
    taskerId: string,
    jobTitle: string,
    applicationStatus: string = 'SHORTLISTED'
  ) {
    try {
      console.log(`Creating job conversation for job ${jobId} between client ${clientId} and tasker ${taskerId}`)
      
      const supabase = createSupabaseAdmin()

      // Check if job conversation already exists
      const { data: existing, error: checkError } = await supabase
        .from('conversations')
        .select('id, title, job_id, type, created_at, updated_at, last_message_at, archived')
        .eq('type', 'job_related')
        .eq('job_id', jobId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // Not "no rows returned"
        console.error('Error checking existing conversation:', checkError)
        throw new Error('Database error while checking conversation')
      }

      let conversation
      if (existing) {
        console.log(`Found existing conversation ${existing.id} for job ${jobId}`)
        conversation = existing
      } else {
        // Create new job conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            type: 'job_related',
            title: `Prijava za posao: ${jobTitle}`,
            job_id: jobId
          })
          .select()
          .single()

        if (convError) {
          console.error('Error creating conversation:', convError)
          throw new Error('Failed to create conversation')
        }

        // Add participants
        const participants = [
          { conversation_id: newConversation.id, user_id: clientId, role: 'admin' },
          { conversation_id: newConversation.id, user_id: taskerId, role: 'member' }
        ]

        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participants)

        if (participantsError) {
          console.error('Error adding participants:', participantsError)
          // Try to clean up the conversation
          await supabase.from('conversations').delete().eq('id', newConversation.id)
          throw new Error('Failed to add participants')
        }

        conversation = newConversation
        console.log(`Created conversation ${conversation.id} for job ${jobId}`)
      }

      // Send automatic welcome message based on application status
      const welcomeMessage = this.getWelcomeMessage(applicationStatus, jobTitle)
      
      await MessageService.sendMessage(
        {
          conversation_id: conversation.id,
          content: welcomeMessage,
          message_type: 'system'
        },
        clientId // Sent by client
      )

      console.log(`Sent welcome message to conversation ${conversation.id}`)
      return conversation
    } catch (error) {
      console.error('Error creating job conversation with welcome:', error)
      
      // If the error is about missing tables, provide helpful guidance
      if (error instanceof Error && error.message.includes('do not exist')) {
        console.warn('Supabase messaging tables are not set up. Please run the database migrations. See docs/messaging-system-setup.md for details.')
      }
      
      throw error
    }
  }

  /**
   * Create a direct conversation with privacy checks
   */
  static async createDirectConversationSafely(
    currentUserId: string,
    otherUserId: string
  ) {
    try {
      return await PrivacyService.createConversationWithPrivacyCheck(
        currentUserId,
        otherUserId,
        'direct'
      )
    } catch (error) {
      console.error('Error creating direct conversation:', error)
      throw error
    }
  }

  /**
   * Send a message with privacy and notification integration
   */
  static async sendMessageWithNotification(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'system' = 'text',
    attachmentUrl?: string,
    attachmentFilename?: string,
    attachmentSize?: number
  ) {
    try {
      // Send message using Supabase real-time messaging
      const message = await MessageService.sendMessage(
        {
          conversation_id: conversationId,
          content,
          message_type: messageType,
          attachment_url: attachmentUrl,
          attachment_filename: attachmentFilename,
          attachment_size: attachmentSize
        },
        senderId
      )

      // Get conversation participants for notifications
      const participants = await ConversationService.getConversationParticipants(conversationId)
      const recipients = participants.filter(p => p.user_id !== senderId)

      // Send notifications to recipients (if they haven't disabled notifications)
      for (const recipient of recipients) {
        try {
          const privacySettings = await PrivacyService.getUserPrivacySettings(recipient.user_id)
          
          if (privacySettings.allowDirectMessages) {
            // Create in-app notification
            await this.createMessageNotification(
              recipient.user_id,
              senderId,
              conversationId,
              content,
              messageType
            )
          }
        } catch (notificationError) {
          console.error('Error sending message notification:', notificationError)
          // Continue with other recipients
        }
      }

      return message
    } catch (error) {
      console.error('Error sending message with notification:', error)
      throw error
    }
  }

  /**
   * Get filtered conversation list based on privacy settings
   */
  static async getFilteredConversations(userId: string) {
    try {
      // Get all conversations for user using Supabase
      const conversations = await ConversationService.getUserConversations(userId)

      // Filter based on privacy settings
      const filteredConversations = await Promise.all(
        conversations.map(async (conversation) => {
          const filteredParticipants = await Promise.all(
            conversation.participants.map(async (participant) => {
              if (participant.user_id === userId) {
                return participant // Always show self
              }

              // Get filtered profile for other participants
              const filteredProfile = await PrivacyService.getFilteredProfile(
                participant.user_id,
                userId
              )

              return {
                ...participant,
                user: filteredProfile || {
                  id: participant.user.id,
                  name: 'Hidden Profile',
                  email: '',
                  role: participant.user.role
                }
              }
            })
          )

          return {
            ...conversation,
            participants: filteredParticipants
          }
        })
      )

      return filteredConversations
    } catch (error) {
      console.error('Error getting filtered conversations:', error)
      return []
    }
  }

  /**
   * Check if user can message another user (for UI purposes)
   */
  static async canMessageUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      if (currentUserId === targetUserId) {
        return false // Can't message yourself
      }

      // Check if target user allows direct messages
      const canReceive = await PrivacyService.canReceiveDirectMessages(targetUserId)
      if (!canReceive) {
        return false
      }

      // Check if profile is visible
      const isVisible = await PrivacyService.isProfileVisible(targetUserId, currentUserId)
      return isVisible
    } catch (error) {
      console.error('Error checking if user can be messaged:', error)
      return false
    }
  }

  /**
   * Handle application status change messaging workflow
   */
  static async handleApplicationStatusChange(
    applicationId: string,
    newStatus: string,
    clientId: string,
    taskerId: string,
    jobId: string,
    jobTitle: string,
    feedback?: string
  ) {
    try {
      // Only create conversation for certain statuses
      if (['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(newStatus)) {
        // Create or get existing job conversation
        const conversation = await ConversationService.createJobConversation(
          jobId,
          clientId,
          taskerId,
          jobTitle
        )

        // Send status update message
        const statusMessage = this.getStatusUpdateMessage(newStatus, jobTitle, feedback)
        
        if (statusMessage) {
          await MessageService.sendMessage(
            {
              conversation_id: conversation.id,
              content: statusMessage,
              message_type: 'system'
            },
            clientId
          )
        }

        return conversation
      }

      return null
    } catch (error) {
      console.error('Error handling application status change messaging:', error)
      throw error
    }
  }

  /**
   * Generate welcome message based on application status
   */
  private static getWelcomeMessage(status: string, jobTitle: string): string {
    const messages = {
      SHORTLISTED: `Pozdrav! Vaša prijava za posao "${jobTitle}" je pregledana i shortlistovana. Želimo razgovarati s vama o ovoj prilici. Kako ste?`,
      INTERVIEW_SCHEDULED: `Pozdrav! Zakazali smo intervju za poziciju "${jobTitle}". Molimo potvrdite da li vam odgovara predloženo vrijeme.`,
      SELECTED: `Čestitamo! Odabrani ste za poziciju "${jobTitle}". Kontaktiraćemo vas s daljim instrukcijama uskoro.`,
      DEFAULT: `Pozdrav! Želimo razgovarati s vama o poslu "${jobTitle}". Javite se ako imate pitanja.`
    }

    return messages[status as keyof typeof messages] || messages.DEFAULT
  }

  /**
   * Generate status update message
   */
  private static getStatusUpdateMessage(status: string, jobTitle: string, feedback?: string): string | null {
    const messages = {
      SHORTLISTED: `Ažuriranje: Vaša prijava za "${jobTitle}" je shortlistovana.`,
      INTERVIEW_SCHEDULED: `Ažuriranje: Zakazan je intervju za poziciju "${jobTitle}".`,
      SELECTED: `Čestitamo! Odabrani ste za poziciju "${jobTitle}".`,
      REJECTED: feedback ? `Ažuriranje prijave: ${feedback}` : null
    }

    return messages[status as keyof typeof messages] || null
  }

  /**
   * Create in-app notification for new message
   */
  private static async createMessageNotification(
    recipientId: string,
    senderId: string,
    conversationId: string,
    messageContent: string,
    messageType: string
  ) {
    try {
      // Get sender info
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
      })

      const title = `Nova poruka od ${sender?.name || 'korisnika'}`
      const message = messageType === 'text' 
        ? messageContent.length > 50 
          ? `${messageContent.substring(0, 50)}...` 
          : messageContent
        : messageType === 'image' 
          ? 'Poslao/la je sliku' 
          : 'Poslao/la je fajl'

      // Create notification using existing notification system
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'NEW_MESSAGE',
          title,
          content: message,
          data: {
            conversationId,
            senderId,
            messageType
          }
        }
      })
    } catch (error) {
      console.error('Error creating message notification:', error)
      // Don't throw - notifications are not critical
    }
  }
}
