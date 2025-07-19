import { supabase } from './supabase'
import type { Message, SendMessageData, MessageStatus } from '../../types/messaging'

// Internal type for database response
type MessageWithSender = {
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
  sender: {
    id: string
    name: string
    avatar_url: string | null
    role: string
  }
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
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            name,
            avatar_url,
            role
          )
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
        (data || []).map(async (msg: MessageWithSender) => {
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
              id: msg.sender.id,
              name: msg.sender.name,
              avatar_url: msg.sender.avatar_url || undefined,
              role: msg.sender.role
            },
            replied_message: repliedMessage,
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
      // Insert the message
      const { data: message, error: messageError } = await supabase
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
          *,
          sender:sender_id (
            id,
            name,
            avatar_url,
            role
          )
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
      const { error } = await supabase
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
      const { error } = await supabase
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
      // Check if read status already exists
      const { data: existing } = await supabase
        .from('message_status')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('status', 'read')
        .single()

      if (existing) return // Already marked as read

      // Insert read status
      const { error } = await supabase
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
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            name,
            avatar_url,
            role
          )
        `)
        .eq('conversation_id', conversationId)
        .ilike('content', `%${query}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((msg: MessageWithSender) => ({
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
          id: msg.sender.id,
          name: msg.sender.name,
          avatar_url: msg.sender.avatar_url || undefined,
          role: msg.sender.role
        }
      }))
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  }

  // Helper methods
  private static async getMessageById(messageId: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .eq('id', messageId)
      .single()

    if (error) throw error

    const msg = data as MessageWithSender
    const statusArray = await this.getMessageStatus(messageId)
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
        id: msg.sender.id,
        name: msg.sender.name,
        avatar_url: msg.sender.avatar_url || undefined,
        role: msg.sender.role
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
    const { data } = await supabase
      .from('message_status')
      .select('*')
      .eq('message_id', messageId)
      .order('timestamp', { ascending: true })

    return data || []
  }

  private static async createMessageStatus(messageId: string, conversationId: string): Promise<void> {
    // Get all participants in the conversation
    const { data: participants } = await supabase
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

    await supabase
      .from('message_status')
      .insert(statusInserts)
  }
}
