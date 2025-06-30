/**
 * Username validation utility
 * Ensures usernames are unique, valid, and follow best practices
 */

export interface UsernameValidationResult {
  isValid: boolean
  error?: string
  suggestions?: string[]
}

/**
 * Validates username format and rules
 */
export function validateUsernameFormat(username: string): UsernameValidationResult {
  // Check length
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be no more than 30 characters long' }
  }

  // Check format - only letters, numbers, underscores, and hyphens
  const validFormat = /^[a-zA-Z0-9_-]+$/.test(username)
  if (!validFormat) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' }
  }

  // Must start with a letter or number
  const startsValid = /^[a-zA-Z0-9]/.test(username)
  if (!startsValid) {
    return { isValid: false, error: 'Username must start with a letter or number' }
  }

  // Must end with a letter or number
  const endsValid = /[a-zA-Z0-9]$/.test(username)
  if (!endsValid) {
    return { isValid: false, error: 'Username must end with a letter or number' }
  }

  // No consecutive special characters
  const noConsecutiveSpecial = !/[-_]{2,}/.test(username)
  if (!noConsecutiveSpecial) {
    return { isValid: false, error: 'Username cannot have consecutive underscores or hyphens' }
  }

  // Reserved usernames
  const reserved = [
    'admin', 'administrator', 'root', 'user', 'test', 'guest', 'public', 'private',
    'api', 'www', 'mail', 'email', 'support', 'help', 'info', 'contact', 'about',
    'blog', 'news', 'app', 'web', 'mobile', 'system', 'null', 'undefined'
  ]
  
  if (reserved.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved and cannot be used' }
  }

  return { isValid: true }
}

/**
 * Generates username suggestions based on name and email
 */
export function generateUsernameSuggestions(name: string, email: string): string[] {
  const suggestions: string[] = []
  
  // Clean name and email parts
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const emailPart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  
  // Base suggestions
  if (cleanName.length >= 3) {
    suggestions.push(cleanName)
  }
  
  if (emailPart.length >= 3 && emailPart !== cleanName) {
    suggestions.push(emailPart)
  }

  // Add variations with numbers
  const baseSuggestions = [cleanName, emailPart].filter(s => s.length >= 3)
  
  for (const base of baseSuggestions) {
    if (base) {
      suggestions.push(`${base}123`)
      suggestions.push(`${base}_user`)
      suggestions.push(`${base}-2024`)
    }
  }

  // Remove duplicates and validate format
  const uniqueSuggestions = [...new Set(suggestions)]
  return uniqueSuggestions.filter(suggestion => 
    validateUsernameFormat(suggestion).isValid
  ).slice(0, 5) // Limit to 5 suggestions
}

/**
 * Checks if username is available in the database
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    
    const data = await response.json()
    return data.available
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
  }
}
