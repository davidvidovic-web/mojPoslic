/**
 * Connection system types and constants
 */

export type ConnectionAction = 
  | 'MONTHLY_REFRESH'
  | 'INITIAL_SIGNUP'
  | 'ROLE_CHANGE'
  | 'JOB_APPLICATION'
  | 'JOB_POST_CLIENT'
  | 'JOB_POST_COMPANY'
  | 'ADMIN_ADJUSTMENT'
  | 'PURCHASE'

export interface ConnectionCost {
  action: ConnectionAction
  cost: number
  description: string
}

// Connection amounts
export const INITIAL_CONNECTIONS = 20
export const MONTHLY_CONNECTIONS = 10

// Initial connections for different user roles
export const INITIAL_CONNECTIONS_TASKER = 10 // Monthly refresh eligible
export const INITIAL_CONNECTIONS_CLIENT = 10 // One-time only
export const INITIAL_CONNECTIONS_COMPANY = 10 // One-time only
export const INITIAL_CONNECTIONS_ADMIN = 50 // Admin gets more

// Job application costs (always 3 connections for professional jobs)
export const JOB_APPLICATION_COST = 3

// Job posting costs based on job type
export const JOB_POSTING_COSTS: Record<string, number> = {
  'quick-job': 3,
  'quick_job': 3,
  'part-time': 4,
  'part_time': 4,
  'full-time': 5,
  'full_time': 5,
  'remote': 7
}

// Connection costs configuration
export const CONNECTION_COSTS: Record<string, ConnectionCost> = {
  JOB_APPLICATION: {
    action: 'JOB_APPLICATION',
    cost: JOB_APPLICATION_COST,
    description: 'Apply for a professional job'
  },
  JOB_POST_CLIENT: {
    action: 'JOB_POST_CLIENT',
    cost: 4,
    description: 'Post a client job'
  },
  JOB_POST_COMPANY: {
    action: 'JOB_POST_COMPANY',
    cost: 6,
    description: 'Post a company job'
  },
  ADMIN_ADJUSTMENT: {
    action: 'ADMIN_ADJUSTMENT',
    cost: 0,
    description: 'Admin connection adjustment'
  },
  PURCHASE: {
    action: 'PURCHASE',
    cost: 0,
    description: 'Purchased connections'
  }
}
