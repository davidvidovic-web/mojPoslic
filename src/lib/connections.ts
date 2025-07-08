/**
 * Format connection action for display
 */
export function formatConnectionAction(action: string): string {
  switch (action) {
    case 'MONTHLY_REFRESH':
      return 'Monthly Refresh'
    case 'INITIAL_SIGNUP':
      return 'Initial Signup'
    case 'JOB_APPLICATION':
      return 'Job Application'
    case 'JOB_POST_CLIENT':
      return 'Job Post (Client)'
    case 'JOB_POST_COMPANY':
      return 'Job Post (Company)'
    case 'JOB_POST_FREE':
      return 'Job Post (Free)'
    case 'ADMIN_ADJUSTMENT':
      return 'Admin Adjustment'
    case 'PURCHASE':
      return 'Purchased'
    // Legacy values for backwards compatibility
    case 'purchase':
      return 'Purchased'
    case 'used':
      return 'Used'
    case 'refund':
      return 'Refunded'
    case 'bonus':
      return 'Bonus'
    case 'monthly_refresh':
      return 'Monthly Refresh'
    default:
      return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

/**
 * Get connection cost for a package
 */
export function getConnectionCost(packageType: string): number {
  switch (packageType) {
    case 'basic':
      return 5
    case 'premium':
      return 15
    case 'pro':
      return 25
    default:
      return 5
  }
}

/**
 * Monthly connections refresh amount
 */
export const MONTHLY_CONNECTIONS = 10

/**
 * Check if it's time for monthly refresh (1st of the month)
 */
export function isTimeForMonthlyRefresh(lastRefreshDate?: Date | string | null): boolean {
  // If no last refresh date, it's time for refresh
  if (!lastRefreshDate) return true
  
  const lastRefresh = typeof lastRefreshDate === 'string' ? new Date(lastRefreshDate) : lastRefreshDate
  const now = new Date()
  
  // Check if it's been more than 30 days since last refresh
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(now.getDate() - 30)
  
  return lastRefresh < thirtyDaysAgo
}

/**
 * Check if user is eligible for monthly refresh
 */
export function isEligibleForMonthlyRefresh(lastRefreshDate?: Date | string | null): boolean {
  if (!lastRefreshDate) return true
  
  const lastRefresh = typeof lastRefreshDate === 'string' ? new Date(lastRefreshDate) : lastRefreshDate
  const now = new Date()
  
  // Check if it's a new month
  return lastRefresh.getMonth() !== now.getMonth() || lastRefresh.getFullYear() !== now.getFullYear()
}