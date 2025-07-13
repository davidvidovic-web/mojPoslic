// Application-related TypeScript interfaces and types

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum ContractStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED'
}

export interface JobAssignment {
  id: string
  jobId: string
  selectedApplicationId: string
  contractStatus: ContractStatus
  assignedAt: Date
  startDate?: Date
  agreedSalary?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  
  // Relations
  job?: {
    id: string
    title: string
    company: string
  }
  selectedApplication?: JobApplication
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: ApplicationStatus
  message?: string // Cover letter/application message
  resume?: string // Resume URL/file path
  clientNotes?: string // Private client notes
  feedback?: string // Client feedback to applicant
  appliedAt: Date
  reviewedAt?: Date
  shortlistedAt?: Date
  selectedAt?: Date
  rejectedAt?: Date
  withdrawnAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  job?: {
    id: string
    title: string
    company: string
    type: string
    city?: {
      id: string
      nameEN: string
      nameBS: string
    }
    category?: {
      id: string
      nameEN: string
      nameBS: string
    }
    salary?: string
    salaryMin?: number
    salaryMax?: number
  }
  
  user?: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    bio?: string
    skills?: string
    experience?: string
    location?: string
    averageRating?: number
    totalReviews?: number
  }
}

export interface CreateApplicationRequest {
  message?: string
  resume?: File | string
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus
  clientNotes?: string
  feedback?: string
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  jobId?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface ApplicationStats {
  total: number
  pending: number
  reviewed: number
  shortlisted: number
  selected: number
  rejected: number
  withdrawn: number
}

// Application action types for bulk operations
export interface BulkApplicationAction {
  applicationIds: string[]
  action: 'review' | 'shortlist' | 'reject' | 'message'
  data?: {
    status?: ApplicationStatus
    feedback?: string
    clientNotes?: string
    messageTemplate?: string
  }
}

// Application timeline entry
export interface ApplicationTimelineEntry {
  id: string
  type: 'status_change' | 'note_added' | 'message_sent' | 'review_submitted'
  title: string
  description?: string
  timestamp: Date
  actor?: {
    id: string
    name: string
    role: string
  }
  metadata?: Record<string, unknown>
}
