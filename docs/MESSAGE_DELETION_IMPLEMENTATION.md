# Message Deletion Implementation Guide

## Overview
This guide explains how to implement per-user message deletion in the messaging UI. Messages are soft-deleted, meaning they're only hidden from the user who deleted them while remaining visible to other participants.

### Key Features
- ✅ **Delete Individual Messages** - Remove specific messages from your view
- ✅ **Clear Entire Conversations** - Remove all messages in a conversation from your view
- ✅ **Auto-Restore on Reply** - Conversations automatically restart when the other person sends a new message
- ✅ **Private Deletion** - Other participants still see all messages normally

## Database Setup

### 1. Run the Migration
First, apply the database migration that adds the `deleted_by_users` column:

```bash
# The migration file is located at:
# supabase/migrations/20240101000000_add_message_deletion_tracking.sql

# If using Supabase CLI:
supabase db push

# If using SQL directly, run the migration manually in the Supabase SQL editor
```

### 2. Verify the Schema
The `messages` table should now have:
- `deleted_by_users` column (uuid[] array)
- Index on `deleted_by_users` for efficient filtering

## Backend Hooks

### Available Hooks

#### `useDeleteMessageForUserMutation`
Deletes a single message from the current user's view.

```typescript
import { useDeleteMessageForUserMutation } from '@/hooks/queries/useMessages'

const deleteMessageMutation = useDeleteMessageForUserMutation()

const handleDeleteMessage = async (messageId: string) => {
  try {
    await deleteMessageMutation.mutateAsync({
      messageId,
      userId: currentUser.id
    })
    toast.success(t('messaging.deleteMessageDialog.success'))
  } catch (error) {
    toast.error(t('messaging.deleteMessageDialog.error'))
  }
}
```

#### `useDeleteConversationForUserMutation`
Clears all messages in a conversation from the current user's view.

```typescript
import { useDeleteConversationForUserMutation } from '@/hooks/queries/useMessages'

const clearConversationMutation = useDeleteConversationForUserMutation()

const handleClearConversation = async (conversationId: string) => {
  try {
    await clearConversationMutation.mutateAsync({
      conversationId,
      userId: currentUser.id
    })
    toast.success(t('messaging.clearConversationDialog.success'))
  } catch (error) {
    toast.error(t('messaging.clearConversationDialog.error'))
  }
}
```

#### `isMessageDeletedForUser`
Helper function to check if a message is deleted for the current user.

```typescript
import { isMessageDeletedForUser } from '@/hooks/queries/useMessages'

// Filter messages before rendering
const visibleMessages = messages.filter(
  msg => !isMessageDeletedForUser(msg, currentUser.id)
)
```

## Auto-Restore Conversation Feature

When a user clears a conversation, it will automatically be restored when the other person sends a new message. This creates a natural "restart" behavior:

```typescript
// Example logic from unified-messaging-interface.tsx
const messageGroups = useMemo(() => {
  // Check if user has deleted any messages
  const userHasDeletedMessages = messages.some(msg => 
    msg.deleted_by_users?.includes(user.id)
  )
  
  // Check if there's a new message from the other person
  const hasUnseenMessageFromOther = messages.some(msg => 
    msg.sender_id !== user.id && 
    (!msg.deleted_by_users || !msg.deleted_by_users.includes(user.id))
  )
  
  // If user cleared conversation but received a new message, restore ALL messages
  const shouldRestoreConversation = userHasDeletedMessages && hasUnseenMessageFromOther
  
  return shouldRestoreConversation
    ? messages // Show all messages to restart conversation
    : messages.filter(msg => !msg.deleted_by_users?.includes(user.id)) // Filter deleted
}, [messages, user?.id])
```

### How It Works:
1. User clears conversation → All messages hidden from their view
2. Other person sends a new message
3. System detects: "User cleared conversation BUT there's a new unread message"
4. All messages are automatically restored → Conversation restarts
5. User sees full conversation history again with the new message

### Benefits:
- Natural conversation flow
- No messages permanently lost
- Context preserved when conversation continues
- Works automatically without user action

## Frontend Implementation

### Step 1: Filter Messages in the UI

When displaying messages, filter out deleted messages (with auto-restore logic):

```typescript
// In your message list component
const { data: conversation } = useConversation(conversationId)
const { user } = useAuth()

// Filter out messages deleted by current user
const visibleMessages = conversation?.messages.filter(
  message => !isMessageDeletedForUser(message, user.id)
) || []

return (
  <div>
    {visibleMessages.map(message => (
      <MessageItem 
        key={message.id} 
        message={message}
        onDelete={handleDeleteMessage}
      />
    ))}
  </div>
)
```

### Step 2: Add Delete Button to Messages

Add a delete button to each message (typically in a dropdown menu):

```typescript
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function MessageItem({ message, onDelete }) {
  const { t } = useTranslations('messaging')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <div className="message-item">
      <div className="message-content">{message.content}</div>
      
      {/* Message actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('actions.deleteMessageForMe')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteMessageDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteMessageDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteMessageDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(message.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('deleteMessageDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```

### Step 3: Add "Clear Conversation" Action

Add an option to clear entire conversations (typically in conversation header):

```typescript
import { Trash2 } from 'lucide-react'

function ConversationHeader({ conversationId, onClearConversation }) {
  const { t } = useTranslations('messaging')
  const [showClearDialog, setShowClearDialog] = useState(false)

  return (
    <div className="conversation-header">
      <h2>Conversation Title</h2>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            onClick={() => setShowClearDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('actions.clearConversation')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear conversation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clearConversationDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clearConversationDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('clearConversationDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearConversation(conversationId)
                setShowClearDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('clearConversationDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```

## Translation Keys

All required translations are already added to:
- `/translations/en/messaging.json`
- `/translations/bs/messaging.json`

### Available Translation Keys:
- `messaging.actions.deleteMessageForMe` - "Delete for me"
- `messaging.actions.clearConversation` - "Clear conversation for me"
- `messaging.deleteMessageDialog.title` - Dialog title
- `messaging.deleteMessageDialog.description` - Dialog description
- `messaging.deleteMessageDialog.confirm` - Confirm button text
- `messaging.deleteMessageDialog.cancel` - Cancel button text
- `messaging.deleteMessageDialog.success` - Success toast message
- `messaging.deleteMessageDialog.error` - Error toast message
- `messaging.clearConversationDialog.*` - Similar keys for conversation clearing

## Best Practices

### 1. User Experience
- **Confirmation**: Always show a confirmation dialog before deleting
- **Clear Communication**: Explain that deletion is only for the user's view
- **Feedback**: Show success/error toasts after operations
- **Undo Option**: Consider adding an undo feature (would need additional implementation)

### 2. Performance
- **Batch Operations**: When clearing conversations, all deletions happen in parallel
- **Query Invalidation**: Mutations automatically invalidate relevant queries
- **Optimistic Updates**: Consider implementing optimistic UI updates for instant feedback

### 3. Privacy
- **Single User Only**: Users can only delete messages from their own view
- **No Cascade**: Deleting for one user doesn't affect others
- **Historical Record**: Messages remain in database for accountability

## Complete Example Component

```typescript
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteMessageForUserMutation, isMessageDeletedForUser } from '@/hooks/queries/useMessages'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function MessagesList({ messages, conversationId }) {
  const { t } = useTranslations('messaging')
  const { user } = useAuth()
  const deleteMessageMutation = useDeleteMessageForUserMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)

  // Filter out messages deleted by current user
  const visibleMessages = messages.filter(
    msg => !isMessageDeletedForUser(msg, user.id)
  )

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return

    try {
      await deleteMessageMutation.mutateAsync({
        messageId: messageToDelete,
        userId: user.id
      })
      toast.success(t('deleteMessageDialog.success'))
      setDeleteDialogOpen(false)
      setMessageToDelete(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
      toast.error(t('deleteMessageDialog.error'))
    }
  }

  return (
    <>
      <div className="messages-list">
        {visibleMessages.map(message => (
          <div key={message.id} className="message-item group">
            <div className="message-content">
              <p>{message.content}</p>
            </div>
            
            {/* Show delete option for all messages */}
            <div className="message-actions opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setMessageToDelete(message.id)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('actions.deleteMessageForMe')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteMessageDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteMessageDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteMessageDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMessageMutation.isPending}
            >
              {deleteMessageMutation.isPending ? 'Deleting...' : t('deleteMessageDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] `deleted_by_users` column exists in `messages` table
- [ ] Delete button appears on messages
- [ ] Delete confirmation dialog shows
- [ ] Message disappears after deletion (for current user only)
- [ ] Other users still see the message
- [ ] Clear conversation works for all messages
- [ ] Translations display correctly in EN and BS
- [ ] Success/error toasts show appropriately
- [ ] Query invalidation updates UI automatically

## Future Enhancements

1. **Undo Feature**: Allow users to undo message deletion within a time window
2. **Cleanup Job**: Periodically delete messages that all participants have deleted
3. **Bulk Selection**: Allow selecting multiple messages to delete at once
4. **Archive vs Delete**: Add option to archive messages instead of deleting
5. **Search Filtering**: Exclude deleted messages from search results
6. **Analytics**: Track deletion patterns for abuse detection

## Troubleshooting

### Messages not filtering after deletion
- Check if `isMessageDeletedForUser` is being called correctly
- Verify the user ID matches the authenticated user
- Ensure query invalidation is working (check React Query DevTools)

### Delete button not showing
- Verify the dropdown menu is properly imported
- Check if user has permission to see the button
- Ensure the button is not hidden by CSS

### TypeScript errors about `deleted_by_users`
- The migration adds the column to the database
- TypeScript types may need manual update or Supabase type regeneration
- Use type assertions as shown in the hooks until types are regenerated

### Performance issues with large conversations
- Consider pagination for message lists
- Implement virtual scrolling for very long conversations
- Add database indexes if queries are slow

## Related Files

- Hook: `/src/hooks/queries/useMessages.ts`
- Types: `/src/types/messaging.ts`
- Migration: `/supabase/migrations/20240101000000_add_message_deletion_tracking.sql`
- Translations EN: `/translations/en/messaging.json`
- Translations BS: `/translations/bs/messaging.json`
