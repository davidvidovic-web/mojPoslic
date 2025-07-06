/**
 * Utility functions for handling authentication errors and cookie management
 */

/**
 * Clear all NextAuth-related cookies from the browser
 * This is useful when JWT decryption errors occur and we need to force a fresh login
 */
export function clearAuthCookies() {
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url'
  ]

  cookieNames.forEach(cookieName => {
    // Set cookie to expire in the past to delete it
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    // Also try with subdomain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
  })
}

/**
 * Handle JWT-related errors by clearing cookies and redirecting to sign in
 */
export function handleJWTError() {
  console.warn('JWT error detected, clearing auth cookies and redirecting to sign in')
  
  clearAuthCookies()
  
  // Clear any session storage as well
  try {
    sessionStorage.clear()
    localStorage.removeItem('auth-user') // If you store any auth state in localStorage
  } catch {
    // Ignore storage errors
  }
  
  // Redirect to sign in page
  const currentPath = window.location.pathname
  const isAuthPage = currentPath.startsWith('/auth/')
  
  if (!isAuthPage) {
    const signInUrl = new URL('/auth/signin', window.location.origin)
    signInUrl.searchParams.set('callbackUrl', window.location.href)
    signInUrl.searchParams.set('error', 'SessionExpired')
    window.location.href = signInUrl.toString()
  }
}

/**
 * Check if an error is a JWT-related error
 */
export function isJWTError(error: unknown): boolean {
  if (!error) return false
  
  const errorMessage = error instanceof Error ? error.message : String(error)
  return (
    errorMessage.includes('no matching decryption secret') ||
    errorMessage.includes('JWTSessionError') ||
    errorMessage.includes('JWT') ||
    errorMessage.includes('session')
  )
}
