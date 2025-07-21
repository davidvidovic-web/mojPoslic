import { createAuthenticatedSupabaseClient } from '../supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { 
  Message, 
  SendMessageData, 
  MessageStatus 
} from '../../types/messaging'

// Helper function to get authenticated client with user context
async function getAuthenticatedSupabaseClient() {
  return await createAuthenticatedSupabaseClient()
}

// Admin client for specific operations that require bypassing RLS
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

// Internal type for database responses
type MessageRecord = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  message_type: string
  attachment_url: string | null
  attachment_filename: string | null
  attachment_size: number | null
  reply_to_message_id: string | null
  edited_at: string | null
  deleted_at: string | null
  created_at: string
}

export class MessageService {
  /**
   * Get messages for a conversation with pagination
   */
  static async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<Message[]> {
    try {
      // Use authenticated client for reading messages
      const client = await getAuthenticatedSupabaseClient()
      
      let query = client
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachment_url,
          attachment_filename,
          attachment_size,
          reply_to_message_id,
          edited_at,
          deleted_at,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (cursor) {
        query = query.lt('created_at', cursor)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform and get additional data for each message
      const messages: Message[] = await Promise.all(
        (data || []).map(async (msg: MessageRecord) => {
          // Get sender information from users table
          const { data: senderData } = await client
            .from('users')
            .select('id, name, avatar_url, role')
            .eq('id', msg.sender_id)
            .single()

          const sender = senderData || {
            id: msg.sender_id,
            name: 'Unknown User',
            avatar_url: null,
            role: 'user'
          }

          // Get replied message if this is a reply
          let repliedMessage = undefined
          if (msg.reply_to_message_id) {
            repliedMessage = await this.getMessageById(msg.reply_to_message_id)
          }

          // Get message status
          const statusArray = await this.getMessageStatus(msg.id)
          const status = this.extractMessageStatus(statusArray)

          return {
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            content: msg.content || undefined,
            message_type: msg.message_type as 'text' | 'image' | 'file' | 'system',
            attachment_url: msg.attachment_url || undefined,
            attachment_filename: msg.attachment_filename || undefined,
            attachment_size: msg.attachment_size || undefined,
            reply_to_message_id: msg.reply_to_message_id || undefined,
            edited_at: msg.edited_at || undefined,
            deleted_at: msg.deleted_at || undefined,
            created_at: msg.created_at,
            sender: {
              id: sender.id,
              name: sender.name,
              avatar_url: sender.avatar_url || undefined,
              role: sender.role
            },
            reply_to: repliedMessage,
            status
          }
        })
      )

      return messages.reverse() // Return in chronological order
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  /**
   * Send a new message
   */
  static async sendMessage(data: SendMessageData, senderId: string): Promise<Message> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      
      // Insert the message using admin client to bypass RLS
      const { data: message, error: messageError } = await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: data.conversation_id,
          sender_id: senderId,
          content: data.content,
          message_type: data.message_type,
          attachment_url: data.attachment_url,
          attachment_filename: data.attachment_filename,
          attachment_size: data.attachment_size,
          reply_to_message_id: data.reply_to_message_id
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachment_url,
          attachment_filename,
          attachment_size,
          reply_to_message_id,
          edited_at,
          deleted_at,
          created_at
        `)
        .single()

      if (messageError) throw messageError

      // Create message status for all conversation participants
      await this.createMessageStatus(message.id, data.conversation_id)

      // Return the complete message
      return await this.getMessageById(message.id)
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Edit a message
   */
  static async editMessage(messageId: string, newContent: string, userId: string): Promise<Message> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ 
          content: newContent, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .eq('sender_id', userId) // Ensure user can only edit their own messages
        .select()
        .single()

      if (error) throw error

      return await this.getMessageById(messageId)
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  }

  /**
   * Soft delete a message
   */
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', userId) // Ensure user can only delete their own messages

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  /**
   * Mark message as read for a user
   */
  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      
      // Check if read status already exists
      const { data: existing } = await supabaseAdmin
        .from('message_status')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('status', 'read')
        .single()

      if (existing) return // Already marked as read

      // Insert read status
      const { error } = await supabaseAdmin
        .from('message_status')
        .insert({
          message_id: messageId,
          user_id: userId,
          status: 'read'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  /**
   * Search messages in a conversation
   */
  static async searchMessages(
    conversationId: string,
    query: string,
    limit: number = 20
  ): Promise<Message[]> {
    try {
      // Use authenticated client for searching messages
      const client = await getAuthenticatedSupabaseClient()
      
      const { data, error } = await client
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachment_url,
          attachment_filename,
          attachment_size,
          reply_to_message_id,
          edited_at,
          deleted_at,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .ilike('content', `%${query}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((msg: MessageRecord) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content || undefined,
        message_type: msg.message_type as 'text' | 'image' | 'file' | 'system',
        attachment_url: msg.attachment_url || undefined,
        attachment_filename: msg.attachment_filename || undefined,
        attachment_size: msg.attachment_size || undefined,
        reply_to_message_id: msg.reply_to_message_id || undefined,
        edited_at: msg.edited_at || undefined,
        deleted_at: msg.deleted_at || undefined,
        created_at: msg.created_at,
        sender: {
          id: msg.sender_id,
          name: 'User',
          avatar_url: undefined,
          role: 'user'
        }
      }))
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  }

  // Helper methods
  private static async getMessageById(messageId: string): Promise<Message> {
    // Use authenticated client for reading message
    const client = await getAuthenticatedSupabaseClient()
    
    const { data, error } = await client
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        attachment_filename,
        attachment_size,
        reply_to_message_id,
        edited_at,
        deleted_at,
        created_at
      `)
      .eq('id', messageId)
      .single()

    if (error) throw error

    // Get sender information from users table
    const { data: senderData } = await client
      .from('users')
      .select('id, name, avatar_url, role')
      .eq('id', data.sender_id)
      .single()

    const sender = senderData || {
      id: data.sender_id,
      name: 'Unknown User',
      avatar_url: null,
      role: 'user'
    }

    const statusArray = await this.getMessageStatus(messageId)
    const status = this.extractMessageStatus(statusArray)

    return {
      id: data.id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      content: data.content || undefined,
      message_type: data.message_type as 'text' | 'image' | 'file' | 'system',
      attachment_url: data.attachment_url || undefined,
      attachment_filename: data.attachment_filename || undefined,
      attachment_size: data.attachment_size || undefined,
      reply_to_message_id: data.reply_to_message_id || undefined,
      edited_at: data.edited_at || undefined,
      deleted_at: data.deleted_at || undefined,
      created_at: data.created_at,
      sender: {
        id: sender.id,
        name: sender.name,
        avatar_url: sender.avatar_url || undefined,
        role: sender.role
      },
      status
    }
  }

  // Helper method to extract the most relevant status from MessageStatus array
  private static extractMessageStatus(statusArray: MessageStatus[]): 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | undefined {
    if (!statusArray || statusArray.length === 0) {
      return 'sent' // Default status
    }

    // If there are read statuses, use 'read'
    if (statusArray.some(s => s.status === 'read')) {
      return 'read'
    }

    // If there are delivered statuses, use 'delivered'
    if (statusArray.some(s => s.status === 'delivered')) {
      return 'delivered'
    }

    // Otherwise use 'sent'
    return 'sent'
  }

  private static async getMessageStatus(messageId: string): Promise<MessageStatus[]> {
    // Use authenticated client for reading message status
    const client = await getAuthenticatedSupabaseClient()
    
    const { data } = await client
      .from('message_status')
      .select('*')
      .eq('message_id', messageId)
      .order('timestamp', { ascending: true })

    return data || []
  }

  private static async createMessageStatus(messageId: string, conversationId: string): Promise<void> {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get all participants in the conversation
    const { data: participants } = await supabaseAdmin
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .is('left_at', null)

    if (!participants) return

    // Create 'sent' status for all participants
    const statusInserts = participants.map(participant => ({
      message_id: messageId,
      user_id: participant.user_id,
      status: 'sent' as const
    }))

    await supabaseAdmin
      .from('message_status')
      .insert(statusInserts)
  }
}
