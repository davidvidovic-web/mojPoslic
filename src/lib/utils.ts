import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a full name to show first name and last name initial
 * @param fullName - The full name to format
 * @returns Formatted name (e.g., "John D." from "John Doe")
 */
export function formatDisplayName(fullName?: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return ''
  }
  
  const nameParts = fullName.trim().split(' ')
  
  if (nameParts.length === 1) {
    // If only one name part, return it as is
    return nameParts[0]
  }
  
  // Get first name and first letter of last name
  const firstName = nameParts[0]
  const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
  
  return `${firstName} ${lastNameInitial}.`
}

/**
 * Gets time-based greeting for Bosnia timezone
 * @returns "Good morning", "Good day", or "Good evening"
 */
export function getTimeBasedGreeting(): string {
  // Get current time in Bosnia timezone (CET/CEST)
  const now = new Date()
  const bosniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Sarajevo" }))
  const hour = bosniaTime.getHours()
  
  if (hour >= 5 && hour < 12) {
    return "Good morning"
  } else if (hour >= 12 && hour < 18) {
    return "Good day"
  } else {
    return "Good evening"
  }
}

/**
 * Gets time-based greeting with icon data for Bosnia timezone
 * @returns object with greeting text and icon component name
 */
export function getTimeBasedGreetingWithIcon(): { 
  greeting: string; 
  iconName: 'Sunrise' | 'Sun' | 'Moon';
  emoji: string;
} {
  // Get current time in Bosnia timezone (CET/CEST)
  const now = new Date()
  const bosniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Sarajevo" }))
  const hour = bosniaTime.getHours()
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good morning",
      iconName: "Sunrise",
      emoji: "🌅"
    }
  } else if (hour >= 12 && hour < 18) {
    return {
      greeting: "Good day", 
      iconName: "Sun",
      emoji: "☀️"
    }
  } else {
    return {
      greeting: "Good evening",
      iconName: "Moon", 
      emoji: "🌙"
    }
  }
}

/**
 * Creates a URL-friendly slug from text
 * @param text - The text to slugify
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[\s\W-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 50)
}

/**
 * Generates a job URL slug with job ID
 * @param title - Job title
 * @param jobId - Job ID
 * @returns URL slug in format "job-title-slug-{jobId}"
 */
export function generateJobSlug(title: string, jobId: string): string {
  const titleSlug = slugify(title)
  return `${titleSlug}-${jobId}`
}

/**
 * Extracts job ID from a job URL slug
 * @param slug - Job URL slug in format "job-title-slug-{jobId}"
 * @returns Job ID
 */
export function extractJobIdFromSlug(slug: string): string {
  // If it doesn't contain hyphens, it's likely just an ID
  if (!slug.includes('-')) {
    return slug
  }
  
  // Extract the last part after the final hyphen
  const parts = slug.split('-')
  return parts[parts.length - 1]
}
