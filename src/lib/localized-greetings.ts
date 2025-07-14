/**
 * Localized greeting utilities
 */

/**
 * Gets the appropriate greeting key based on time of day in Bosnia timezone
 * @returns greeting key for translation
 */
export function getTimeBasedGreetingKey(): 'morning' | 'day' | 'evening' {
  // Get current time in Bosnia timezone (CET/CEST)
  const now = new Date()
  const bosniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Sarajevo" }))
  const hour = bosniaTime.getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 18) {
    return 'day'
  } else {
    return 'evening'
  }
}

/**
 * Gets time-based greeting key with icon data for Bosnia timezone
 * @returns object with greeting key and icon component name
 */
export function getTimeBasedGreetingWithIcon(): { 
  greetingKey: 'morning' | 'day' | 'evening';
  iconName: 'Sunrise' | 'Sun' | 'Moon';
  emoji: string;
} {
  // Get current time in Bosnia timezone (CET/CEST)
  const now = new Date()
  const bosniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Sarajevo" }))
  const hour = bosniaTime.getHours()
  
  if (hour >= 5 && hour < 12) {
    return {
      greetingKey: 'morning',
      iconName: "Sunrise",
      emoji: "🌅"
    }
  } else if (hour >= 12 && hour < 18) {
    return {
      greetingKey: 'day', 
      iconName: "Sun",
      emoji: "☀️"
    }
  } else {
    return {
      greetingKey: 'evening',
      iconName: "Moon", 
      emoji: "🌙"
    }
  }
}
