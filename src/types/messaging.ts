export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'job_related'
  title?: string
  job_id?: string
  jobTitle?: string // Added for job-related conversations
  created_at: string
  updated_at: string
  last_message_at?: string
  archived: boolean
  participants: ConversationParticipant[]
  last_message?: Message
  unread_count: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  left_at?: string
  role: 'admin' | 'member'
  last_read_at: string
  user: {
    id: string
    email: string
    name: string
    avatar_url?: string
    role: string
  }
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content?: string
  messageType: 'text' | 'image' | 'file' | 'system'
  attachmentUrl?: string
  attachmentFilename?: string
  attachmentSize?: number
  replyToMessageId?: string
  editedAt?: string
  deletedAt?: string
  deletedByUsers?: string[] // Array of user IDs who deleted this message from their view
  createdAt: string
  updatedAt?: string
  isRead?: boolean
  sender?: {
    id: string
    name: string
    avatarUrl?: string
    role: string
  }
  replyTo?: Message
  attachments?: MessageAttachment[]
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
}

export interface MessageStatus {
  id: string
  message_id: string
  user_id: string
  status: 'sent' | 'delivered' | 'read'
  timestamp: string
}

export interface TypingUser {
  user_id: string
  conversation_id: string
  is_typing: boolean
  timestamp: string
  user?: {
    id: string
    name: string
    avatarUrl?: string
  }
}

export interface UserPresence {
  user_id: string
  status: 'online' | 'away' | 'busy' | 'offline'
  last_seen: string
  updated_at: string
}

export interface CreateConversationData {
  type: 'direct' | 'group' | 'job_related'
  title?: string
  job_id?: string
  participant_ids: string[]
}

export interface SendMessageData {
  conversationId: string
  content?: string
  messageType?: 'text' | 'image' | 'file' | 'system'
  attachmentUrl?: string
  attachmentFilename?: string
  attachmentSize?: number
  replyToMessageId?: string
}

export interface MessagingTranslations {
  title: string
  newMessage: string
  send: string
  search: string
  edit: string
  delete: string
  reply: string
  typing: string
  placeholder: string
  file: string
  image: string
  upload: string
  download: string
  clear: string
  cancel: string
  confirm: string
  loading: string
  noMessages: string
  startConversation: string
  status: {
    sent: string
    delivered: string
    read: string
    online: string
    offline: string
  }
  conversation: {
    archive: string
    block: string
    report: string
    jobApplication: string
    participants: string
    addParticipant: string
    removeParticipant: string
    leaveConversation: string
  }
  time: {
    justNow: string
    minuteAgo: string
    minutesAgo: string
    hourAgo: string
    hoursAgo: string
    dayAgo: string
    daysAgo: string
    weekAgo: string
    weeksAgo: string
    monthAgo: string
    monthsAgo: string
    yearAgo: string
    yearsAgo: string
  }
  errors: {
    uploadFailed: string
    connectionLost: string
    messageNotSent: string
    fileTooLarge: string
    invalidFileType: string
    networkError: string
  }
}
