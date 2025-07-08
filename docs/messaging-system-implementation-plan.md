# Messaging System Implementation Plan
*Date: January 7, 2025*

## Overview
This document outlines the complete implementation plan for a global messaging component that will enable real-time communication between all users and roles (Taskers, Clients, Companies, Admins) on the mojPoslić platform using Supabase and shadcn/ui.

## System Architecture

### Technology Stack
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **UI Components**: shadcn/ui components
- **Real-time**: Supabase Realtime
- **Authentication**: Next-Auth.js (existing)
- **Framework**: Next.js 14 (existing)

### Core Features
1. **Direct Messaging**: One-on-one conversations
2. **Group Conversations**: Multiple participants
3. **Job-Related Messaging**: Conversations linked to specific job postings
4. **Real-time Updates**: Live message delivery and status updates
5. **Message Status**: Sent, delivered, read indicators
6. **File Attachments**: Support for images and documents
7. **Message Search**: Search within conversations
8. **Notifications**: In-app and push notifications
9. **Bosnian Localization**: Primary language interface in Bosnian with English fallback

### Localization Requirements

#### Primary Language: Bosnian (BS)
All user-facing text, buttons, labels, placeholders, and messages must be in Bosnian:

**Common UI Elements:**
- "Poruke" (Messages)
- "Nova poruka" (New Message)
- "Pošalji" (Send)
- "Pretraži" (Search)
- "Uredi" (Edit)
- "Obriši" (Delete)
- "Odgovori" (Reply)
- "Kucaj poruku..." (Type a message...)
- "Datoteka" (File)
- "Slika" (Image)
- "Učitaj" (Upload)
- "Preuzmi" (Download)
- "Očisti" (Clear)
- "Arhiviraj" (Archive)
- "Blokiraj" (Block)
- "Prijavi" (Report)

**Message Status in Bosnian:**
- "Poslano" (Sent)
- "Dostavljeno" (Delivered)
- "Pročitano" (Read)
- "Kuca..." (Typing...)
- "Online" (Online)
- "Offline" (Offline)

**Time/Date Formats:**
- Use Bosnian date format: DD.MM.YYYY
- Use 24-hour time format: HH:mm
- Relative time: "prije 5 minuta", "danas", "juče", "prošle sedmice"

#### Technical Implementation:
- API endpoints, function names, and database fields remain in English
- Error messages and logs in English for debugging
- Use i18n library for string management
- Fallback to English if Bosnian translation missing

## Phase 1: Database Schema Design

### 1.1 Supabase Tables

#### conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'job_related')),
  title VARCHAR(255), -- For group chats or job-related conversations
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE, -- NULL for non-job conversations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_job_id ON conversations(job_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
```

#### conversation_participants
```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_active ON conversation_participants(user_id, left_at) WHERE left_at IS NULL;
```

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  attachment_filename TEXT,
  attachment_size INTEGER,
  reply_to_message_id UUID REFERENCES messages(id),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_reply_to ON messages(reply_to_message_id);
```

#### message_status
```sql
CREATE TABLE message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'read')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, status)
);

-- Indexes
CREATE INDEX idx_message_status_message_id ON message_status(message_id);
CREATE INDEX idx_message_status_user_id ON message_status(user_id);
```

### 1.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see conversations they participate in
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL
  )
);

-- Messages: Users can only see messages from conversations they participate in
CREATE POLICY "Users can view messages from their conversations" ON messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL
  )
);

-- Similar policies for other tables...
```

## Phase 2: Backend API Development

### 2.1 Supabase Functions

#### Create Conversation
```typescript
// supabase/functions/create-conversation/index.ts
export const createConversation = async (
  type: 'direct' | 'group' | 'job_related',
  participants: string[],
  title?: string,
  jobId?: string
) => {
  // Implementation
};
```

#### Send Message
```typescript
// supabase/functions/send-message/index.ts
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' | 'file',
  attachmentUrl?: string
) => {
  // Implementation
};
```

### 2.2 Next.js API Routes

#### /api/conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get conversation details
- `DELETE /api/conversations/[id]` - Archive conversation

#### /api/conversations/[id]/messages
- `GET /api/conversations/[id]/messages` - Get conversation messages
- `POST /api/conversations/[id]/messages` - Send new message
- `PUT /api/conversations/[id]/messages/[messageId]` - Edit message
- `DELETE /api/conversations/[id]/messages/[messageId]` - Delete message

#### /api/conversations/[id]/participants
- `GET /api/conversations/[id]/participants` - Get participants
- `POST /api/conversations/[id]/participants` - Add participant
- `DELETE /api/conversations/[id]/participants/[userId]` - Remove participant

## Phase 3: Frontend Component Development

### 3.1 Core Components Structure

```
src/components/messaging/
├── messaging-layout.tsx          # Main messaging layout
├── conversation-list.tsx         # List of conversations
├── conversation-item.tsx         # Individual conversation item
├── message-area.tsx             # Main message display area
├── message-bubble.tsx           # Individual message component
├── message-input.tsx            # Message composition area
├── participant-list.tsx         # Conversation participants
├── conversation-header.tsx      # Conversation title/info
├── message-status-indicator.tsx # Read/delivered indicators
├── file-upload-area.tsx         # File attachment handling
├── search-messages.tsx          # Message search functionality
└── typing-indicator.tsx         # Real-time typing status
```

### 3.2 Component Specifications

**Note**: All components must use Bosnian translations via the localization system (next-intl) with English fallback.

#### MessagingLayout
```tsx
interface MessagingLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
  locale: 'bs' | 'en'; // Bosnian primary, English fallback
}
```

#### ConversationList
```tsx
interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversationId: string) => void;
  loading: boolean;
  translations: MessagingTranslations; // Bosnian translations object
}
```

#### MessageArea
```tsx
interface MessageAreaProps {
  conversationId: string;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type: MessageType) => void;
  loading: boolean;
  locale: 'bs' | 'en';
}
```

### 3.3 shadcn/ui Components to Use

- **Dialog**: For new conversation creation
- **Card**: For conversation items and message bubbles
- **Input/Textarea**: For message composition
- **Button**: For send, attach, and action buttons
- **Avatar**: For user profile pictures
- **Badge**: For unread message counts
- **DropdownMenu**: For message actions (edit, delete, reply)
- **ScrollArea**: For message lists
- **Separator**: For conversation dividers
- **Skeleton**: For loading states
- **Popover**: For emoji picker and quick actions
- **Sheet**: For mobile conversation list

## Phase 4: Real-time Integration

### 4.1 Supabase Realtime Setup

```typescript
// lib/supabase-realtime.ts
export const subscribeToConversation = (
  conversationId: string,
  onNewMessage: (message: Message) => void,
  onMessageUpdate: (message: Message) => void,
  onTyping: (userId: string, isTyping: boolean) => void
) => {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, onNewMessage)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, onMessageUpdate)
    .subscribe();

  return () => supabase.removeChannel(channel);
};
```

### 4.2 Real-time Features Implementation

- **Live message delivery**
- **Typing indicators**
- **Online status**
- **Message read receipts**
- **Participant join/leave notifications**

## Phase 5: File Upload and Attachments

### 5.1 Supabase Storage Setup

```typescript
// lib/file-upload.ts
export const uploadMessageAttachment = async (
  file: File,
  conversationId: string,
  messageId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${messageId}.${fileExt}`;
  const filePath = `conversations/${conversationId}/attachments/${fileName}`;

  const { data, error } = await supabase.storage
    .from('message-attachments')
    .upload(filePath, file);

  if (error) throw error;
  return data.path;
};
```

### 5.2 File Types Support

- **Images**: jpg, png, gif, webp
- **Documents**: pdf, doc, docx, txt
- **Size Limits**: 10MB per file
- **Preview**: Image thumbnails, document icons

## Phase 6: Integration with Existing Systems

### 6.1 Job-Related Messaging

```typescript
// Automatic conversation creation when job application is made
export const createJobConversation = async (
  jobId: string,
  clientId: string,
  taskerId: string,
  jobTitle: string
) => {
  return await createConversation(
    'job_related',
    [clientId, taskerId],
    `Prijava za posao: ${jobTitle}`, // Bosnian: "Job Application: ${jobTitle}"
    jobId
  );
};
```

### 6.2 Dashboard Integration

- **Message center widget** in all dashboards
- **Unread message indicators** in navigation
- **Quick message actions** from job application cards
- **Notification integration** with existing toast system

### 6.3 Header Integration

```tsx
// Update existing header component
<Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
  <MessageSquare className="h-7 w-7" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</Button>
```

## Phase 7: Mobile Responsiveness

### 7.1 Mobile Layout Strategy

- **Sheet component** for conversation list on mobile
- **Full-screen message view** on conversation selection
- **Swipe gestures** for quick actions
- **Touch-optimized** message input area

### 7.2 Responsive Breakpoints

```css
/* Mobile First */
@media (max-width: 768px) {
  .messaging-layout {
    grid-template-columns: 1fr;
  }
  
  .conversation-list {
    position: fixed;
    transform: translateX(-100%);
  }
  
  .conversation-list.active {
    transform: translateX(0);
  }
}

/* Desktop */
@media (min-width: 769px) {
  .messaging-layout {
    grid-template-columns: 320px 1fr;
  }
}
```

## Phase 8: Performance Optimization

### 8.1 Message Pagination

```typescript
// Implement cursor-based pagination for large conversations
export const getMessages = async (
  conversationId: string,
  cursor?: string,
  limit: number = 50
) => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  return query;
};
```

### 8.2 Caching Strategy

- **React Query** for server state management
- **Local storage** for draft messages
- **IndexedDB** for offline message storage
- **Optimistic updates** for sent messages

## Phase 9: Testing Strategy

### 9.1 Unit Tests

```typescript
// components/messaging/__tests__/message-bubble.test.tsx
describe('MessageBubble', () => {
  it('renders sent message correctly', () => {
    // Test implementation
  });
  
  it('renders received message correctly', () => {
    // Test implementation
  });
  
  it('handles file attachments', () => {
    // Test implementation
  });
});
```

### 9.2 Integration Tests

- **Real-time message delivery**
- **File upload functionality**
- **Conversation creation flow**
- **Cross-browser compatibility**

### 9.3 E2E Tests

```typescript
// e2e/messaging.spec.ts
test('complete messaging flow', async ({ page }) => {
  // Test user can create conversation
  // Test user can send messages
  // Test real-time delivery
  // Test file attachments
});
```

## Phase 10: Security and Privacy

### 10.1 Data Protection

- **Message encryption** at rest
- **Secure file uploads** with virus scanning
- **Rate limiting** for message sending
- **Spam detection** and filtering

### 10.2 Privacy Controls

- **Block/unblock users**
- **Report inappropriate messages**
- **Message deletion** (for sender only)
- **Conversation archiving**

## Implementation Timeline

### Week 1: Foundation
- [ ] Database schema creation
- [ ] RLS policies setup
- [ ] Basic API routes
- [ ] **Localization setup (BS/EN)**
- [ ] **Translation files creation**

### Week 2: Core Components
- [ ] Messaging layout
- [ ] Conversation list
- [ ] Message area
- [ ] Message input
- [ ] **Bosnian text integration**

### Week 3: Real-time Features
- [ ] Supabase realtime integration
- [ ] Live message delivery
- [ ] Typing indicators
- [ ] Online status
- [ ] **Bosnian status messages**

### Week 4: File Handling
- [ ] File upload system
- [ ] Image preview
- [ ] Document handling
- [ ] Storage management
- [ ] **Bosnian file handling UI**

### Week 5: Integration
- [ ] Dashboard integration
- [ ] Header notifications
- [ ] Job-related messaging
- [ ] Existing system connections
- [ ] **Bosnian notification texts**

### Week 6: Polish & Testing
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Testing implementation
- [ ] Bug fixes and refinements
- [ ] **Bosnian language testing**
- [ ] **Date/time format validation**

## Dependencies

### New Packages to Install

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@tanstack/react-query": "^5.17.0",
  "react-dropzone": "^14.2.3",
  "emoji-picker-react": "^4.6.0",
  "date-fns": "^3.2.0",
  "react-intersection-observer": "^9.5.3",
  "next-intl": "^3.4.0",
  "date-fns-tz": "^2.0.0"
}
```

### Localization Dependencies
- **next-intl**: For internationalization support (BS/EN)
- **date-fns with BS locale**: For Bosnian date formatting
- **Custom translation files**: BS and EN JSON files

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## File Structure

```
src/
├── components/messaging/          # All messaging components
├── lib/messaging/                # Messaging utilities and hooks
├── types/messaging.ts            # TypeScript interfaces
├── hooks/use-messaging.ts        # Custom messaging hooks
├── contexts/messaging-context.tsx # Global messaging state
├── locales/                      # Localization files
│   ├── bs.json                   # Bosnian translations
│   └── en.json                   # English translations (fallback)
└── app/messages/                 # Dedicated messages page
    ├── page.tsx
    └── layout.tsx

docs/
└── messaging-system-implementation-plan.md # This document

supabase/
├── migrations/                   # Database migrations
├── functions/                    # Edge functions
└── storage/                     # Storage bucket configs
```

### Sample Localization Files

#### src/locales/bs.json (Bosnian - Primary)
```json
{
  "messaging": {
    "title": "Poruke",
    "newMessage": "Nova poruka",
    "send": "Pošalji",
    "search": "Pretraži",
    "edit": "Uredi",
    "delete": "Obriši",
    "reply": "Odgovori",
    "typing": "Kuca...",
    "placeholder": "Kucaj poruku...",
    "file": "Datoteka",
    "image": "Slika",
    "upload": "Učitaj",
    "download": "Preuzmi",
    "status": {
      "sent": "Poslano",
      "delivered": "Dostavljeno",
      "read": "Pročitano",
      "online": "Online",
      "offline": "Offline"
    },
    "conversation": {
      "archive": "Arhiviraj",
      "block": "Blokiraj",
      "report": "Prijavi",
      "jobApplication": "Prijava za posao"
    },
    "errors": {
      "uploadFailed": "Učitavanje datoteke neuspješno",
      "connectionLost": "Veza izgubljena",
      "messageNotSent": "Poruka nije poslana"
    }
  }
}
```

#### src/locales/en.json (English - Fallback)
```json
{
  "messaging": {
    "title": "Messages",
    "newMessage": "New Message",
    "send": "Send",
    "search": "Search",
    "edit": "Edit",
    "delete": "Delete",
    "reply": "Reply",
    "typing": "Typing...",
    "placeholder": "Type a message...",
    "file": "File",
    "image": "Image",
    "upload": "Upload",
    "download": "Download",
    "status": {
      "sent": "Sent",
      "delivered": "Delivered",
      "read": "Read",
      "online": "Online",
      "offline": "Offline"
    },
    "conversation": {
      "archive": "Archive",
      "block": "Block",
      "report": "Report",
      "jobApplication": "Job Application"
    },
    "errors": {
      "uploadFailed": "File upload failed",
      "connectionLost": "Connection lost",
      "messageNotSent": "Message not sent"
    }
  }
}
```

## Success Metrics

- **Message delivery time**: < 500ms
- **File upload success rate**: > 99%
- **Real-time sync accuracy**: 100%
- **Mobile responsiveness**: All breakpoints
- **User engagement**: Measured through message frequency
- **System performance**: No impact on existing features

## Future Enhancements

- **Voice messages**
- **Video calling integration**
- **Message reactions (emoji)**
- **Message threading**
- **Advanced search with filters**
- **Message templates**
- **Chatbot integration**
- **Multi-language support**

---

This comprehensive plan provides a roadmap for implementing a robust, scalable messaging system that integrates seamlessly with the existing mojPoslić platform while providing modern real-time communication features.
