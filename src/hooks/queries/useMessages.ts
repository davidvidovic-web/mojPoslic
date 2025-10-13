import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Message } from '@/types/messaging'

/**
 * Hook to delete a message from the user's view only
 * This creates a soft delete by tracking which users have deleted the message
 */
export function useDeleteMessageForUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, userId }: { messageId: string; userId: string }) => {
      console.log('🗑️ User deleting message from their view:', { messageId, userId })

      // First, get the current message to see who has already deleted it
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('deleted_by_users')
        .eq('id', messageId)
        .single() as { data: { deleted_by_users: string[] | null } | null; error: Error | null }

      if (fetchError) {
        console.error('❌ Error fetching message:', fetchError)
        throw new Error('Failed to fetch message')
      }

      // Add current user to the deleted_by_users array
      const currentDeletedBy = message?.deleted_by_users || []
      const updatedDeletedBy = [...new Set([...currentDeletedBy, userId])]

      // Update the message with the new deleted_by_users array
      // Note: Using type assertion because Supabase types haven't been regenerated after migration
      const { error: updateError } = await supabase
        .from('messages')
        .update({ deleted_by_users: updatedDeletedBy } as Record<string, unknown>)
        .eq('id', messageId)

      if (updateError) {
        console.error('❌ Error updating message:', updateError)
        throw new Error('Failed to delete message')
      }

      console.log('✅ Message deleted from user view')
      
      return { messageId, userId }
    },
    onSuccess: () => {
      // Invalidate conversation queries to refresh the message list
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      console.log('🔄 Invalidated conversation queries')
    },
  })
}

/**
 * Hook to check if a message is deleted for the current user
 * Use this in the UI to filter out deleted messages
 */
export function isMessageDeletedForUser(message: Message | { deletedByUsers?: string[] }, userId: string): boolean {
  if (!message.deletedByUsers) return false
  return message.deletedByUsers.includes(userId)
}

/**
 * Hook to delete all messages in a conversation for the current user
 * This allows users to "clear chat history" on their end only
 */
export function useDeleteConversationForUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      console.log('🗑️ User deleting all messages from conversation:', { conversationId, userId })

      // Get all messages in the conversation
      const { data: messages, error: fetchError } = await supabase
        .from('messages')
        .select('id, deleted_by_users')
        .eq('conversation_id', conversationId) as { 
          data: Array<{ id: string; deleted_by_users: string[] | null }> | null
          error: Error | null 
        }

      if (fetchError) {
        console.error('❌ Error fetching messages:', fetchError)
        throw new Error('Failed to fetch messages')
      }

      if (!messages || messages.length === 0) {
        console.log('ℹ️ No messages to delete')
        return { conversationId, userId, deletedCount: 0 }
      }

      // Update each message to include the user in deleted_by_users
      const updates = messages.map(message => {
        const currentDeletedBy = message.deleted_by_users || []
        const updatedDeletedBy = [...new Set([...currentDeletedBy, userId])]
        
        return supabase
          .from('messages')
          .update({ deleted_by_users: updatedDeletedBy } as Record<string, unknown>)
          .eq('id', message.id)
      })

      // Execute all updates in parallel
      const results = await Promise.all(updates)
      
      // Check for errors
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        console.error('❌ Some messages failed to delete:', errors)
        throw new Error(`Failed to delete ${errors.length} messages`)
      }

      console.log(`✅ Deleted ${messages.length} messages from user view`)
      
      return { conversationId, userId, deletedCount: messages.length }
    },
    onSuccess: () => {
      // Invalidate conversation queries to refresh the message list
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      console.log('🔄 Invalidated conversation queries')
    },
  })
}

/**
 * IMPORTANT NOTES:
 * 
 * 1. Database Schema Update Required:
 *    The 'messages' table needs a new column:
 *    ```sql
 *    ALTER TABLE messages ADD COLUMN deleted_by_users uuid[] DEFAULT ARRAY[]::uuid[];
 *    ```
 * 
 * 2. Message Filtering in UI:
 *    When displaying messages, filter out messages deleted by the current user:
 *    ```typescript
 *    const visibleMessages = messages.filter(msg => !isMessageDeletedForUser(msg, userId))
 *    ```
 * 
 * 3. Complete Deletion:
 *    Messages are only fully deleted from the database when all participants have deleted them.
 *    This can be done with a cleanup job or manual process.
 * 
 * 4. Privacy:
 *    - Users can only delete messages from their own view
 *    - Other users still see the messages
 *    - This is similar to WhatsApp's "Delete for me" feature
 */
