# Messaging System Documentation

The messaging system has been completely refactored to use a single, comprehensive `MessagingInterface` component with full Supabase realtime functionality.

## Key Features

✅ **Full Realtime Support**
- Real-time message delivery using Supabase postgres_changes
- Live typing indicators using Supabase broadcast
- Instant read status updates
- Auto-reconnection handling

✅ **Optimistic Updates**
- Messages appear instantly for sender
- Graceful error handling with rollback
- No flickering or loading states for sent messages

✅ **Modern UI/UX**
- Clean, WhatsApp-like message bubbles
- Animated typing indicators
- Connection status indicators
- Responsive design (mobile-first)

✅ **Performance Optimized**
- Efficient database queries
- Minimal re-renders
- Smart conversation loading
- Proper cleanup on unmount

## Usage

### Basic Usage

```tsx
import { MessagingInterface } from '@/components/messaging/messaging-interface'

// Show all conversations
<MessagingInterface />

// Open specific conversation
<MessagingInterface conversationId="conversation-uuid" />

// With close handler
<MessagingInterface 
  conversationId="conversation-uuid"
  onClose={() => setOpen(false)} 
/>
```

### Components

```tsx
// For modal popup messaging button
import { MessagingButton } from '@/components/messaging/messaging-button'
<MessagingButton conversationId="conversation-uuid" />

// For direct embedding (use MessagingInterface directly)
import { MessagingInterface } from '@/components/messaging/messaging-interface'
<MessagingInterface conversationId="conversation-uuid" onClose={() => {}} />
```

### Integration Examples

#### In a Job Application

```tsx
function JobApplicationCard({ application }) {
  return (
    <Card>
      <CardContent>
        <h3>{application.job_title}</h3>
        <p>Applicant: {application.applicant_name}</p>
        
        {/* Quick message button */}
        <MessagingButton conversationId={application.conversation_id} />
      </CardContent>
    </Card>
  )
}
```

#### In a Dashboard

```tsx
function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        {/* Main content */}
      </div>
      
      <div className="col-span-4">
        {/* Embedded messaging */}
        <MessagingInterface className="h-96" />
      </div>
    </div>
  )
}
```

#### Full-Screen Messaging

```tsx
function MessagingPage() {
  return (
    <div className="h-screen p-4">
      <MessagingInterface className="h-full max-w-none" />
    </div>
  )
}
```

## Migration from Old System

The old dialog-based messaging system has been replaced. Here's how to migrate:

### Before (Old)
```tsx
import { MessagingDialog } from '@/components/dashboard/messaging/messaging-dialog'
import { useDialogStore } from '@/stores/dialog-store'

function OldWay() {
  const { openMessagingDialog } = useDialogStore()
  
  return (
    <>
      <button onClick={() => openMessagingDialog('conv-id')}>
        Open Messages
      </button>
      <MessagingDialog />
    </>
  )
}
```

### After (New)
```tsx
import { MessagingButton } from '@/components/messaging/messaging-button'

function NewWay() {
  return (
    <MessagingButton conversationId="conv-id" />
  )
}
```

## Database Schema

The messaging system uses these Supabase tables:

### `conversations`
```sql
- id: uuid (primary key)
- job_id: uuid (optional)
- application_id: uuid (optional)
- created_by_id: uuid
- title: text
- is_active: boolean
- participant_ids: uuid[]
- participant_names: text[]
- participant_avatars: text[]
- message_count: integer
- last_message_at: timestamptz
- last_message_preview: text
- last_sender_id: uuid
- read_status: jsonb
- created_at: timestamptz
- updated_at: timestamptz
```

### `messages`
```sql
- id: uuid (primary key)
- conversation_id: uuid (foreign key)
- sender_id: uuid
- content: text
- message_type: text ('text', 'file', etc.)
- attachment_url: text (optional)
- sender_name: text
- sender_avatar_url: text (optional)
- read_by: uuid[]
- created_at: timestamptz
```

## Realtime Features

### Postgres Changes
The system listens for:
- `INSERT` on `messages` - New messages
- `UPDATE` on `messages` - Read status changes
- `UPDATE` on `conversations` - Conversation metadata

### Broadcast Events
- `typing` - Real-time typing indicators with auto-cleanup

### Connection Management
- Auto-reconnection on network issues
- Connection status indicators
- Graceful degradation when offline

## Performance Notes

### Optimizations
- Only active conversations load messages
- Unread counts calculated efficiently
- Typing indicators auto-expire
- Smart re-render prevention

### Best Practices
- Use `conversationId` prop for direct conversation access
- Implement proper loading states in parent components
- Handle user authentication before rendering
- Use `className` prop for responsive layouts

## Troubleshooting

### Common Issues

1. **Messages not appearing in real-time**
   - Check Supabase realtime is enabled
   - Verify user permissions on tables
   - Check browser network tab for WebSocket connection

2. **Typing indicators not working**
   - Ensure broadcast is enabled in Supabase
   - Check that channels are properly subscribed
   - Verify user authentication

3. **Performance issues**
   - Limit conversation list size
   - Implement pagination for large message histories
   - Use `React.memo` for conversation list items

### Debug Mode
Set environment variable for detailed logging:
```bash
NEXT_PUBLIC_DEBUG_MESSAGING=true
```

## Future Enhancements

- [ ] File attachments support
- [ ] Message search functionality
- [ ] Message reactions
- [ ] Thread/reply support
- [ ] Voice messages
- [ ] Message encryption
- [ ] Push notifications
- [ ] Message scheduling
