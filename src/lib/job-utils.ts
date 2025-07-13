/**
 * Utility functions for formatting job-related data
 */

import { formatDisplayName } from './utils'

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
    case 'remote':
      return 'default'
    case 'quick-job':
    case 'quick_job':
      return 'default' // Changed from 'destructive' to 'default' (blue instead of red)
    default:
      return 'outline'
  }
}

/**
 * Formats salary information to human-readable format
 * @param job - The job object or legacy salary string
 * @returns Formatted salary string or null if not provided
 */
export function formatSalary(job: string | { salaryMin?: number; salaryMax?: number; salaryType?: string; salary?: string } | undefined): string | null {
  // Handle legacy string input for backward compatibility
  if (typeof job === 'string') {
    return job || null
  }
  
  // Handle job object with new salary structure
  if (typeof job === 'object' && job !== null) {
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const type = job.salaryType === 'hourly' ? '/hr' : 
                   job.salaryType === 'daily' ? '/day' :
                   job.salaryType === 'weekly' ? '/week' :
                   job.salaryType === 'monthly' ? '/month' : ''
      return `${min} - ${max} BAM${type}`
    }
    
    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const type = job.salaryType === 'hourly' ? '/hr' : 
                   job.salaryType === 'daily' ? '/day' :
                   job.salaryType === 'weekly' ? '/week' :
                   job.salaryType === 'monthly' ? '/month' : ''
      
      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`
      }
      
      return `From ${min} BAM${type}`
    }
    
    // Fallback to legacy salary field
    return job.salary || null
  }
  
  return null
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

/**
 * Formats transportation information to human-readable format
 * @param transportation - The transportation string ('provided', 'not_provided', 'tasker_responsible', 'compensated')
 * @param amount - The compensation amount if transportation is 'compensated'
 * @returns Human-readable transportation information
 */
export function formatTransportation(transportation?: string, amount?: number): string | null {
  if (!transportation) return null
  
  switch (transportation) {
    case 'provided':
      return 'Transportation provided'
    case 'not_provided':
      return 'Transportation not provided'
    case 'employee_responsible':
    case 'tasker_responsible':
      return 'Tasker responsible for transportation'
    case 'compensated':
      return amount ? `Transportation compensation: ${amount} BAM` : 'Transportation compensation provided'
    default:
      // Fallback: capitalize first letter and replace underscores with spaces
      return transportation.charAt(0).toUpperCase() + transportation.slice(1).replace(/_/g, ' ')
  }
}

/**
 * Gets the icon for transportation information
 * @param transportation - The transportation string
 * @returns Icon component name or null
 */
export function getTransportationIcon(transportation?: string): string | null {
  if (!transportation) return null
  
  switch (transportation) {
    case 'provided':
      return 'Car' // Car icon for provided transportation
    case 'not_provided':
      return 'Ban' // Ban icon for not provided
    case 'employee_responsible':
    case 'tasker_responsible':
      return 'User' // User icon for tasker responsible
    case 'compensated':
      return 'DollarSign' // DollarSign icon for compensation
    default:
      return 'Car' // Default to car icon
  }
}

/**
 * Formats client name to "FirstName L." format for privacy
 * @param fullName - The full name of the client
 * @returns Formatted name (e.g., "John D." from "John Doe")
 */
export function formatClientName(fullName?: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'Anonymous Client'
  }
  
  const formatted = formatDisplayName(fullName)
  return formatted || 'Anonymous Client'
}

/**
 * Formats time ago to human-readable format (e.g., "5m ago", "2h ago", "1d ago", "3mo ago")
 * @param dateString - The date string to calculate time ago
 * @returns Human-readable time ago
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  
  // Convert to different time units
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInMonths = Math.floor(diffInDays / 30)
  
  // Format based on time elapsed
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 30) {
    return `${diffInDays}d ago`
  } else {
    return `${diffInMonths}mo ago`
  }
}

/**
 * Formats duration strings to human-readable format (e.g., "1 hour", "2 days", "3 months")
 * @param duration - The duration string (e.g., '1_hour', '2_days', '3_months')
 * @returns Human-readable duration or original string if unrecognized
 */
export const formatDuration = (duration?: string): string => {
  if (!duration) return ''
  
  const durationMap: Record<string, string> = {
    '1_hour': '1 hour',
    '2_hours': '2 hours',
    '3_hours': '3 hours',
    '4_hours': '4 hours',
    '6_hours': '6 hours',
    '8_hours': '8 hours',
    '1_day': '1 day',
    '2_days': '2 days',
    '3_days': '3 days',
    '1_week': '1 week',
    '2_weeks': '2 weeks',
    '1_month': '1 month',
    '2_months': '2 months',
    '3_months': '3 months',
    '6_months': '6 months',
    '1_year': '1 year'
  }
  
  return durationMap[duration] || duration.replace('_', ' ')
}
