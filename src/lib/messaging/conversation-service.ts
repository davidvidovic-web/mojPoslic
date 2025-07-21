import { supabase } from './supabase'
import type { 
  Conversation, 
  ConversationParticipant, 
  CreateConversationData
} from '@/types/messaging'

// Internal types for database responses
type ConversationWithParticipants = {
  id: string
  type: string
  title: string | null
  job_id: string | null
  created_at: string
  updated_at: string
  last_message_at: string | null
  archived: boolean
  conversation_participants: Array<{
    id: string
    user_id: string
    role: string
    last_read_at: string
    joined_at: string
    left_at: string | null
  }>
}

type ParticipantWithUser = {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  left_at: string | null
  role: string
  last_read_at: string
  users: {
    id: string
    email: string
    name: string
    avatar_url: string | null
    role: string
  }
}

export class ConversationService {
  /**
   * Check if messaging tables exist in Supabase
   */
  private static async checkTablesExist(): Promise<boolean> {
    try {
      // Try a simple query to see if the conversations table exists
      const { error } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)

      // If error code indicates table doesn't exist, return false
      if (error && (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist'))) {
        console.warn('Messaging tables do not exist in Supabase. Messaging features will be disabled.')
        return false
      }

      return true
    } catch (error) {
      console.warn('Could not check if messaging tables exist:', error)
      return false
    }
  }

  /**
   * Get all conversations for the current user
   */
  static async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch('/api/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required')
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.conversations || []

    } catch (error) {
      console.error('Error in getConversations:', error)
      throw error
    }
  }

  /**
   * Get participants for a conversation
   */
  static async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    try {
      if (!conversationId) {
        console.warn('No conversation ID provided for getConversationParticipants')
        return []
      }

      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          *,
          users!user_id (
            id,
            email,
            name,
            avatar_url,
            role
          )
        `)
        .eq('conversation_id', conversationId)
        .is('left_at', null)

      if (error) {
        console.error('Supabase error in getConversationParticipants:', error)
        return []
      }

      return (data || []).map((participant: ParticipantWithUser) => ({
        id: participant.id,
        conversation_id: participant.conversation_id,
        user_id: participant.user_id,
        joined_at: participant.joined_at,
        left_at: participant.left_at || undefined,
        role: participant.role as 'admin' | 'member',
        last_read_at: participant.last_read_at,
        user: {
          id: participant.users.id,
          email: participant.users.email,
          name: participant.users.name,
          avatar_url: participant.users.avatar_url || undefined,
          role: participant.users.role
        }
      }))
    } catch (error) {
      console.error('Error fetching conversation participants:', {
        error,
        conversationId,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      return []
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(data: CreateConversationData, createdBy: string): Promise<Conversation> {
    try {
      console.log('Creating conversation with data:', { data, createdBy });

      // Start a transaction
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: data.type,
          title: data.title,
          job_id: data.job_id
        })
        .select()
        .single()

      console.log('Conversation insert result:', { conversation, convError });

      if (convError) throw convError

      // Add participants
      const participantInserts = data.participant_ids.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === createdBy ? 'admin' : 'member'
      }))

      console.log('Inserting participants:', participantInserts);

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts)

      console.log('Participants insert result:', { participantsError });

      if (participantsError) throw participantsError

      // Return the created conversation with participants
      const fullConversation = await this.getConversationById(conversation.id)
      console.log('Final conversation:', fullConversation);
      
      return fullConversation
    } catch (error) {
      console.error('Error creating conversation:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data: error && typeof error === 'object' ? JSON.stringify(error) : error
      })
      throw error
    }
  }

  /**
   * Create a direct conversation between two users
   */
  static async createDirectConversation(currentUserId: string, otherUserId: string): Promise<Conversation> {
    try {
      // Check if direct conversation already exists
      const existingConversation = await this.findDirectConversation(currentUserId, otherUserId)
      
      if (existingConversation) {
        return existingConversation
      }

      // Create new direct conversation
      return await this.createConversation({
        type: 'direct',
        participant_ids: [currentUserId, otherUserId]
      }, currentUserId)
    } catch (error) {
      console.error('Error creating direct conversation:', error)
      throw error
    }
  }

  /**
   * Create a job-related conversation
   */
  static async createJobConversation(
    jobId: string, 
    clientId: string, 
    taskerId: string, 
    jobTitle: string
  ): Promise<Conversation> {
    try {
      // Check if tables exist first
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        throw new Error('Messaging tables do not exist in Supabase. Please run the database migrations.')
      }

      // Check if job conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'job_related')
        .eq('job_id', jobId)
        .single()

      if (existing) {
        return await this.getConversationById(existing.id)
      }

      // Create new job-related conversation
      return await this.createConversation({
        type: 'job_related',
        title: `Prijava za posao: ${jobTitle}`,
        job_id: jobId,
        participant_ids: [clientId, taskerId]
      }, clientId)
    } catch (error) {
      console.error('Error creating job conversation:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        jobId,
        clientId,
        taskerId,
        jobTitle,
        data: error && typeof error === 'object' ? JSON.stringify(error) : error
      })
      throw error
    }
  }

  /**
   * Find existing direct conversation between two users
   */
  static async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner (user_id)
        `)
        .eq('type', 'direct')
        .eq('conversation_participants.user_id', userId1)

      if (error) throw error

      // Find conversation that has both users
      for (const conv of data || []) {
        const participants = await this.getConversationParticipants(conv.id)
        const userIds = participants.map(p => p.user_id)
        
        if (userIds.includes(userId1) && userIds.includes(userId2) && userIds.length === 2) {
          return await this.getConversationById(conv.id)
        }
      }

      return null
    } catch (error) {
      console.error('Error finding direct conversation:', error)
      return null
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(conversationId: string): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (error) throw error

      const participants = await this.getConversationParticipants(conversationId)
      const lastMessage = await this.getLastMessage(conversationId)
      const unreadCount = 0 // Will be calculated per user

      return {
        id: data.id,
        type: data.type,
        title: data.title,
        job_id: data.job_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_message_at: data.last_message_at,
        archived: data.archived,
        participants,
        last_message: lastMessage,
        unread_count: unreadCount
      }
    } catch (error) {
      console.error('Error fetching conversation by ID:', error)
      throw error
    }
  }

  /**
   * Mark conversation as read for user
   */
  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking conversation as read:', error)
      throw error
    }
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ archived: true })
        .eq('id', conversationId)

      if (error) throw error
    } catch (error) {
      console.error('Error archiving conversation:', error)
      throw error
    }
  }

  /**
   * Leave conversation
   */
  static async leaveConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error leaving conversation:', error)
      throw error
    }
  }

  // Helper methods
  private static async getLastMessage(conversationId: string) {
    try {
      if (!conversationId) return null

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching last message:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('Error in getLastMessage:', {
        error,
        conversationId,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  private static async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      if (!conversationId || !userId) return 0

      const { data: participant, error: participantError } = await supabase
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single()

      if (participantError) {
        console.error('Error fetching participant for unread count:', participantError)
        return 0
      }

      if (!participant?.last_read_at) return 0

      const { count, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .gt('created_at', participant.last_read_at)
        .is('deleted_at', null)

      if (countError) {
        console.error('Error counting unread messages:', countError)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', {
        error,
        conversationId,
        userId,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      return 0
    }
  }
}
