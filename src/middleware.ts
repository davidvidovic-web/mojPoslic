import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Handle auth-related errors gracefully
  try {
    const session = await auth()
    const pathname = request.nextUrl.pathname
    
    // Define public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/jobs',
      '/auth/signin',
      '/auth/register',
      '/auth/verify-email',
      '/auth/set-password'
    ]
    
    // Define public API routes that don't require authentication
    const publicApiRoutes = [
      '/api/auth',
      '/api/jobs',
      '/api/categories', 
      '/api/cities',
      '/api/stats',
      '/api/user/me',
      '/api/debug',
      '/api/cache'
    ]
    
    // Check if current path is public
    const isPublicPage = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
    
    const isPublicApi = publicApiRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    const isPublicRoute = isPublicPage || isPublicApi
    
    // If route is public, allow access
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // If not authenticated and trying to access protected route
    if (!session) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      // For pages, redirect to sign in
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(signInUrl)
    }
    
    return NextResponse.next()
  } catch (error) {
    // Handle JWT decryption errors by clearing the session cookie and redirecting
    if (error instanceof Error && error.message.includes('no matching decryption secret')) {

      
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      
      // Clear all auth-related cookies
      const cookieNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.csrf-token',
        '__Secure-next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.callback-url'
      ]
      
      cookieNames.forEach(cookieName => {
        response.cookies.delete(cookieName)
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      })
      
      return response
    }
    
    // For other errors, log and continue
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
