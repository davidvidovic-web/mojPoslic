/**
 * Connection utility functions for costs and formatting
 */

import { 
  ConnectionAction, 
  CONNECTION_COSTS, 
  JOB_POSTING_COSTS, 
  JOB_APPLICATION_COST 
} from './types'

/**
 * Gets the connection cost for a specific action
 */
export function getConnectionCost(action: keyof typeof CONNECTION_COSTS): number {
  const config = CONNECTION_COSTS[action]
  return config ? config.cost : 0
}

/**
 * Checks if user has enough connections for an action
 */
export function hasEnoughConnections(
  currentConnections: number,
  action: keyof typeof CONNECTION_COSTS
): boolean {
  const cost = getConnectionCost(action)
  return currentConnections >= cost
}

/**
 * Gets the connection cost for a job posting based on job type
 */
export function getJobPostingCost(jobType: string): number {
  return JOB_POSTING_COSTS[jobType] || JOB_POSTING_COSTS['full_time'] || 5
}

/**
 * Gets the connection action for job posting based on job type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getJobPostingAction(_jobType: string): ConnectionAction {
  // Map all job types to either CLIENT or COMPANY posting actions
  // For now, default to CLIENT posting
  return 'JOB_POST_CLIENT'
}

/**
 * Gets the connection cost for job application (always 2)
 */
export function getJobApplicationCost(): number {
  return JOB_APPLICATION_COST
}

/**
 * Formats connection action for display
 */
export function formatConnectionAction(action: ConnectionAction): string {
  switch (action) {
    case 'MONTHLY_REFRESH':
      return 'Monthly Refresh'
    case 'INITIAL_SIGNUP':
      return 'Welcome Bonus'
    case 'JOB_APPLICATION':
      return 'Job Application'
    case 'JOB_POST_CLIENT':
      return 'Client Job Posting'
    case 'JOB_POST_COMPANY':
      return 'Company Job Posting'
    case 'ADMIN_ADJUSTMENT':
      return 'Admin Adjustment'
    case 'PURCHASE':
      return 'Purchase'
    default:
      return action
  }
}

/**
 * Checks if it's time for a monthly refresh (once per month)
 */
export function isTimeForMonthlyRefresh(lastRefresh: Date | null): boolean {
  if (!lastRefresh) return true // If no refresh date, allow refresh
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const lastRefreshMonth = lastRefresh.getMonth()
  const lastRefreshYear = lastRefresh.getFullYear()
  
  // Allow refresh if it's a different month or year
  return currentMonth !== lastRefreshMonth || currentYear !== lastRefreshYear
}
