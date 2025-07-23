# Messaging System Performance Optimization

## Problem Analysis

The original messaging system was making excessive API calls and had performance issues:

1. **Over-subscribing to real-time events** - subscribing to ALL conversations even when not active
2. **Frequent API calls** - calling `loadConversations()` multiple times in different useEffects
3. **No intelligent caching** - reloading entire conversation list for any change
4. **Continuous polling** - checking for updates even when messaging UI is not active

## Optimization Strategy

### 1. Smart Caching with Event-Driven Updates

**Before:** Full conversation list reload on any change
**After:** Selective updates with intelligent caching

- Cache conversations for 5 minutes
- Only do full refresh when cache is stale
- Use targeted updates for single conversation changes

### 2. Activity-Aware Sync

**Before:** Constant real-time subscriptions and API calls
**After:** Adaptive sync based on user activity

- **Messaging Active**: Immediate processing of notifications, frequent updates
- **Messaging Inactive**: Queue notifications, longer sync intervals
- **Page Hidden**: Background sync with minimal frequency

### 3. Notification Queuing System

Instead of processing every real-time event immediately:

- Queue notifications when messaging is not active
- Batch process when messaging becomes active
- Prevent duplicate API calls for same events

### 4. Optimized API Endpoints

**New endpoints:**
- `/api/conversations/summary` - Lightweight conversation list
- `/api/conversations/[id]/summary` - Single conversation updates

**Features:**
- Minimal data transfer
- Efficient database queries
- Proper caching headers

## Implementation Details

### Core Hook: `useOptimizedMessaging`

```typescript
const {
  conversations,           // Cached conversation list
  totalUnreadCount,       // Aggregated unread count
  setMessagingActive,     // Tell system messaging is active
  markConversationAsRead, // Optimistic updates
  refreshConversations    // Force refresh when needed
} = useOptimizedMessaging()
```

### Activity Detection

Components can inform the system when messaging is active:

```typescript
// In messaging dialog
React.useEffect(() => {
  setMessagingActive(isMessagingDialogOpen)
}, [isMessagingDialogOpen, setMessagingActive])
```

### Background Sync Intelligence

The system automatically adjusts sync frequency:

- **Page visible + messaging active**: 10 second intervals
- **Page visible + messaging inactive**: 30 second intervals  
- **Page hidden**: Minimal background sync
- **Immediate sync**: When page regains focus

### Real-time Event Optimization

Instead of subscribing to all conversations:
- Subscribe to global conversation updates only
- Queue events for batch processing
- Process immediately only when messaging is active

## Performance Benefits

### Before Optimization:
- ❌ 10+ API calls per minute regardless of activity
- ❌ Real-time subscriptions to all conversations
- ❌ Full conversation reloads on every change
- ❌ No caching strategy

### After Optimization:
- ✅ Event-driven updates only when needed
- ✅ Smart caching with 5-minute TTL
- ✅ Activity-aware sync intervals
- ✅ Selective conversation updates
- ✅ Notification queuing and batching
- ✅ Page visibility detection

## Usage Examples

### For Header Notification Center

```typescript
export function OptimizedNotificationCenter() {
  const { 
    totalUnreadCount, 
    setMessagingActive,
    hasNotifications 
  } = useOptimizedMessaging()
  
  const handleClick = () => {
    setMessagingActive(true) // Tell system messaging is now active
    openMessagingDialog()
  }

  return (
    <Button onClick={handleClick}>
      <MessageSquare />
      {totalUnreadCount > 0 && (
        <Badge>{totalUnreadCount}</Badge>
      )}
    </Button>
  )
}
```

### For Messaging Components

```typescript
export function MessagingDialog() {
  const { setMessagingActive } = useOptimizedMessaging()
  
  // Notify when messaging becomes active/inactive
  React.useEffect(() => {
    setMessagingActive(isOpen)
  }, [isOpen, setMessagingActive])
  
  return <Dialog>...</Dialog>
}
```

## Future Enhancements

1. **WebSocket connection management** - Close connections when not needed
2. **Service Worker integration** - Background sync even when page is closed
3. **Push notifications** - Browser notifications for important messages
4. **Conversation-level caching** - Cache individual conversation messages
5. **Database query optimization** - Add SQL functions for efficient unread counts

## Migration Guide

To migrate from the old messaging system:

1. Replace `useMessaging()` with `useOptimizedMessaging()` in notification components
2. Add `setMessagingActive(true)` when messaging UI opens
3. Update notification center to use the optimized version
4. Remove direct calls to `loadConversations()` in favor of automatic sync

The optimized system is backward compatible and can run alongside the existing messaging context during migration.
