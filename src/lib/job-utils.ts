/**
 * Utility functions for formatting job-related data
 */

/**
 * Formats job type strings to human-readable format
 * @param type - The job type string (e.g., 'full_time', 'part-time', 'quick_job')
 * @returns Human-readable job type (e.g., 'Full Time', 'Part Time', 'Quick Job')
 */
export function formatJobType(type: string): string {
  switch (type) {
    case 'full-time':
    case 'full_time':
      return 'Full Time'
    case 'part-time':
    case 'part_time':
      return 'Part Time'
    case 'contract':
      return 'Contract'
    case 'remote':
      return 'Remote'
    case 'quick-job':
    case 'quick_job':
      return 'Quick Job'
    default:
      // Fallback: capitalize first letter and replace hyphens/underscores with spaces
      return type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' ')
  }
}

/**
 * Gets the badge variant for a job type
 * @param type - The job type string
 * @returns Badge variant for consistent styling
 */
export function getJobTypeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case 'full-time':
    case 'full_time':
      return 'default'
    case 'part-time':
    case 'part_time':
      return 'secondary'
    case 'contract':
      return 'outline'
    case 'remote':
      return 'default'
    case 'quick-job':
    case 'quick_job':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Formats salary information to human-readable format
 * @param salary - The salary string
 * @returns Formatted salary string or null if not provided
 */
export function formatSalary(salary?: string): string | null {
  if (!salary) return null
  return salary
}

/**
 * Formats date to relative time (e.g., "2 days ago", "Today")
 * @param dateString - The date string to format
 * @returns Human-readable relative time
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  return date.toLocaleDateString()
}

/**
 * Formats job start date to human-readable format with time
 * @param dateString - The start date string to format
 * @returns Human-readable start date with time or null if not provided
 */
export function formatStartDate(dateString?: string): string | null {
  if (!dateString) return null
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // Format time
  const timeFormat = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
  
  // If start date is today
  if (diffInDays === 0) return `Starts today at ${timeFormat}`
  
  // If start date is tomorrow
  if (diffInDays === 1) return `Starts tomorrow at ${timeFormat}`
  
  // If start date is in the past
  if (diffInDays < 0) {
    const pastDays = Math.abs(diffInDays)
    if (pastDays === 1) return `Started yesterday at ${timeFormat}`
    if (pastDays < 7) return `Started ${pastDays} days ago at ${timeFormat}`
    return `Started on ${date.toLocaleDateString()} at ${timeFormat}`
  }
  
  // If start date is in the near future
  if (diffInDays < 7) return `Starts in ${diffInDays} days at ${timeFormat}`
  
  // For farther dates, show the actual date with time
  return `Starts ${date.toLocaleDateString()} at ${timeFormat}`
}
