/**
 * Utility functions for formatting profile-related data
 */

/**
 * Format experience level to human-readable text
 */
export function formatExperienceLevel(level: string): string {
  const levelLabels: { [key: string]: string } = {
    'not-specified': 'Not Specified',
    'beginner': 'Beginner (< 1 year)',
    '1-2-years': '1-2 Years',
    '3-5-years': '3-5 Years',
    '5plus-years': '5+ Years'
  }
  
  return levelLabels[level] || level
}

/**
 * Format skills array to human-readable list
 */
export function formatSkillsList(skills: string[] | string | null | undefined): string {
  if (!skills) return ''
  
  // Handle array format (modern)
  if (Array.isArray(skills)) {
    return skills
      .filter(skill => skill && skill.trim() !== '')
      .join(', ')
  }
  
  // Handle string format (legacy)
  if (typeof skills === 'string') {
    // Check if it's JSON array string
    if (skills.trim().startsWith('[') && skills.trim().endsWith(']')) {
      try {
        const parsed = JSON.parse(skills)
        if (Array.isArray(parsed)) {
          return parsed
            .filter(skill => skill && skill.trim() !== '')
            .join(', ')
        }
      } catch (error) {
        console.warn('Failed to parse skills JSON:', error)
      }
    }
    
    // Handle comma-separated string
    return skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '')
      .join(', ')
  }
  
  return ''
}

/**
 * Format skills and experience data for display
 */
export function formatSkillsWithExperience(
  skills: string[] | string | null | undefined,
  experience: string | object | null | undefined
): { skill: string; level: string }[] {
  const skillsList = Array.isArray(skills) ? skills : 
    typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s !== '') : []
  
  let experienceLevels: { [skill: string]: string } = {}
  
  // Parse experience data
  if (experience) {
    if (typeof experience === 'string') {
      try {
        const parsed = JSON.parse(experience)
        if (Array.isArray(parsed)) {
          // Handle array format: [{ skill: "React", experienceLevel: "3-5-years" }]
          parsed.forEach((item: { skill?: string; experienceLevel?: string }) => {
            if (item.skill && item.experienceLevel) {
              experienceLevels[item.skill] = item.experienceLevel
            }
          })
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Handle object format: { "React": "3-5-years", "Node.js": "1-2-years" }
          experienceLevels = parsed
        }
      } catch (error) {
        console.warn('Failed to parse experience data:', error)
      }
    } else if (typeof experience === 'object' && experience !== null) {
      experienceLevels = experience as { [skill: string]: string }
    }
  }
  
  return skillsList.map(skill => ({
    skill,
    level: formatExperienceLevel(experienceLevels[skill] || 'not-specified')
  }))
}

/**
 * Format location to human-readable format (re-export for consistency)
 */
export { formatLocation } from './location-format'

/**
 * Parse skills from various formats into a clean array
 */
export function parseSkillsArray(skills: string[] | string | null | undefined): string[] {
  if (!skills) return []
  
  // Handle array format (modern)
  if (Array.isArray(skills)) {
    return skills
      .filter(skill => skill && skill.trim() !== '')
      .map(skill => skill.trim())
  }
  
  // Handle string format (legacy)
  if (typeof skills === 'string') {
    // Check if it's JSON array string
    if (skills.trim().startsWith('[') && skills.trim().endsWith(']')) {
      try {
        const parsed = JSON.parse(skills)
        if (Array.isArray(parsed)) {
          return parsed
            .filter(skill => skill && skill.trim() !== '')
            .map(skill => skill.trim())
        }
      } catch (error) {
        console.warn('Failed to parse skills JSON:', error)
      }
    }
    
    // Handle comma-separated string
    return skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '')
  }
  
  return []
}

/**
 * Parse experience levels from various formats
 */
export function parseExperienceLevels(experience: string | object | null | undefined): { [skill: string]: string } {
  if (!experience) return {}
  
  if (typeof experience === 'string') {
    try {
      const parsed = JSON.parse(experience)
      if (Array.isArray(parsed)) {
        // Handle array format: [{ skill: "React", experienceLevel: "3-5-years" }]
        const levels: { [skill: string]: string } = {}
        parsed.forEach((item: { skill?: string; experienceLevel?: string }) => {
          if (item.skill && item.experienceLevel) {
            levels[item.skill] = item.experienceLevel
          }
        })
        return levels
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Handle object format: { "React": "3-5-years", "Node.js": "1-2-years" }
        return parsed
      }
    } catch (error) {
      console.warn('Failed to parse experience data:', error)
    }
  } else if (typeof experience === 'object' && experience !== null) {
    return experience as { [skill: string]: string }
  }
  
  return {}
}
