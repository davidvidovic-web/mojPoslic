// Utility function to trigger cache updates
export async function triggerCacheUpdate(): Promise<boolean> {
  try {
    const response = await fetch('/api/cache/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    return result.success || false
  } catch (error) {
    console.error('Failed to trigger cache update:', error)
    return false
  }
}

// Check if cache needs updating on app start
export async function checkAndUpdateCache(): Promise<void> {
  // Only run this once per session to avoid excessive calls
  const sessionKey = 'cache_check_session'
  if (typeof window !== 'undefined') {
    const lastCheck = sessionStorage.getItem(sessionKey)
    if (lastCheck) {
      return // Already checked this session
    }
  }

  try {
    // Check cache status first
    const statusResponse = await fetch('/api/cache/update')
    if (statusResponse.ok) {
      const status = await statusResponse.json()
      
      // If cache doesn't exist or metadata is missing, trigger update
      if (!status.files?.cities || !status.files?.categories || !status.metadata) {
        // Cache files missing, triggering initial update...
        await triggerCacheUpdate()
      }
    }

    // Mark as checked for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(sessionKey, Date.now().toString())
    }
  } catch (error) {
    console.error('Error checking cache status:', error)
  }
}
