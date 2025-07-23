import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { cleanupTransferCookie } from './lib/cleanup-transfer';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Early return for static files and API routes to avoid unnecessary processing
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/_vercel/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  
  // Clean up transfer cookies if user is authenticated
  const cleanedResponse = cleanupTransferCookie(request, response);
  
  // With domain-based routing (bs on main domain, en on subdomain), 
  // there are no locale prefixes in URLs, so use pathname directly
  const finalPath = pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/register', 
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/privacy',
    '/terms',
    '/contact',
    '/about'
  ];
  
  // Define paths that authenticated users can access regardless of profile completion
  const jobViewingPaths = [
    '/jobs' // This will match /jobs/[id] and other job-related paths
  ];
  
  // Define paths that require authentication but not role completion
  const authOnlyPaths = [
    '/role-selection',
    '/profile-setup'
  ];
  
  // Skip auth checks for public paths
  if (publicPaths.includes(finalPath)) {
    return cleanedResponse;
  }
  
  // Check if this is a job viewing path
  const isJobViewingPath = jobViewingPaths.some(path => finalPath.startsWith(path));
  
  try {
    // Get the user's token/session
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    });
    
    // If we have a token but it might be stale, fetch fresh user data from database
    let userRole = token?.role;
    let profileSetupCompleted = token?.profileSetupCompleted;
    
    // Always fetch fresh data for critical path checks to avoid race conditions
    // This is especially important after profile updates or role changes
    const isCriticalPath = finalPath === '/dashboard' || finalPath.startsWith('/dashboard/') ||
                          finalPath === '/profile-setup' || finalPath === '/role-selection';
    
    // Check if token is potentially stale (older than 1 minute for critical paths)
    const tokenAge = token?.lastUpdated ? Date.now() - (token.lastUpdated as number) : Infinity;
    const isTokenStale = tokenAge > 60 * 1000; // 1 minute for critical paths
    
    const needsFreshData = token?.id && (
      (isCriticalPath && isTokenStale) || // Check critical paths with stale tokens
      (!token.role && (finalPath === '/role-selection' || finalPath === '/dashboard' || finalPath.startsWith('/dashboard/'))) ||
      (token.role && token.profileSetupCompleted === undefined)
    );

    if (needsFreshData) {
      try {
        // Call our API endpoint to get fresh user data (since Prisma doesn't work in Edge Runtime)
        const response = await fetch(new URL('/api/user/fresh-state', request.url), {
          headers: {
            // Forward the cookies to maintain session
            'Cookie': request.headers.get('cookie') || ''
          }
        });
        
        if (response.ok) {
          const { user: dbUser } = await response.json();
          userRole = dbUser.role;
          profileSetupCompleted = dbUser.profileSetupCompleted;
          
          // Log when we get fresh data that differs from token (only in development)
          if (process.env.NODE_ENV === 'development') {
            if (token.role !== dbUser.role || token.profileSetupCompleted !== dbUser.profileSetupCompleted) {
              console.log('Middleware: Fresh data differs from token:', {
                tokenRole: token.role,
                dbRole: dbUser.role,
                tokenProfileComplete: token.profileSetupCompleted,
                dbProfileComplete: dbUser.profileSetupCompleted,
                tokenAge: Math.round(tokenAge / 1000) + 's'
              });
            }
          }
        } else {
          userRole = token?.role;
          profileSetupCompleted = token?.profileSetupCompleted;
        }
      } catch (dbError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Middleware: Error fetching fresh user data:', dbError);
        }
        // Fall back to token data
        userRole = token?.role;
        profileSetupCompleted = token?.profileSetupCompleted;
      }
    }
    
    // Only log debug info in development mode or when there are issues
    if (process.env.NODE_ENV === 'development') {
      // Debug logging for dashboard access
      if (finalPath === '/dashboard') {
        console.log('Middleware Debug (Dashboard):', {
          path: finalPath,
          hasToken: !!token,
          userRole,
          profileSetupCompleted,
          tokenId: token?.id
        });
      }
      
      // Debug logging for role selection issues
      if (finalPath === '/role-selection' || finalPath === '/profile-setup') {
        console.log('Middleware Debug:', {
          path: finalPath,
          hasToken: !!token,
          userRole,
          profileSetupCompleted,
          tokenId: token?.id
        });
      }
    }
    
    // If no token, redirect to signin (except for auth-only paths)
    if (!token) {
      if (authOnlyPaths.includes(finalPath)) {
        // Redirect to signin if trying to access auth-only paths without being logged in
        const signInUrl = new URL('/auth/signin', request.url);
        return NextResponse.redirect(signInUrl);
      }
      // For job viewing paths, redirect to signin with return URL
      if (isJobViewingPath) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('returnUrl', finalPath);
        return NextResponse.redirect(signInUrl);
      }
      // For other protected paths, redirect to signin
      const signInUrl = new URL('/auth/signin', request.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // User is authenticated - now check role and profile completion
    // (userRole and profileSetupCompleted are already set above from fresh DB data)
    
    // Special handling for dashboard - ensure user is fully set up
    if (finalPath === '/dashboard' || finalPath.startsWith('/dashboard/')) {
      if (!userRole) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard access denied: No role, redirecting to role selection');
        }
        const roleSelectionUrl = new URL('/role-selection', request.url);
        return NextResponse.redirect(roleSelectionUrl);
      }
      if (!profileSetupCompleted) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard access denied: Profile not completed, redirecting to profile setup');
          console.log('Debug - userRole:', userRole, 'profileSetupCompleted:', profileSetupCompleted);
        }
        
        // Check for potential redirect loop - if user was just on profile-setup
        const referer = request.headers.get('referer');
        if (referer && referer.includes('/profile-setup')) {
          // Check if we have a recent redirect cookie to prevent loops
          const recentRedirect = request.cookies.get('profile-setup-redirect');
          if (recentRedirect) {
            // Allow access to prevent infinite loop, but log the issue
            if (process.env.NODE_ENV === 'development') {
              console.log('Dashboard access: Preventing redirect loop, allowing access');
            }
            return cleanedResponse;
          }
          
          // Set a temporary cookie and redirect
          const response = NextResponse.redirect(new URL('/profile-setup', request.url));
          response.cookies.set('profile-setup-redirect', 'true', { 
            maxAge: 30, // 30 seconds
            httpOnly: true 
          });
          return response;
        }
        
        const profileSetupUrl = new URL('/profile-setup', request.url);
        return NextResponse.redirect(profileSetupUrl);
      }
      // User is fully set up, allow dashboard access
      if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard access granted: User fully set up');
      }
      
      // Clear any redirect prevention cookies on successful access
      const response = cleanedResponse;
      response.cookies.delete('profile-setup-redirect');
      return response;
    }
    
    // If user has completed everything (role + profile), redirect them away from onboarding pages
    if (userRole && profileSetupCompleted) {
      // If they're trying to access onboarding pages, redirect to dashboard
      if (finalPath === '/role-selection' || finalPath === '/profile-setup') {
        if (process.env.NODE_ENV === 'development') {
          console.log('Completed user accessing onboarding page, redirecting to dashboard');
        }
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      // Otherwise, allow access to any page
      return cleanedResponse;
    }
    
    // For authenticated users: Allow job viewing even without profile completion
    if (isJobViewingPath && token) {
      return cleanedResponse;
    }

    // For authenticated users: If they don't have a role, redirect to role selection
    if (!userRole && finalPath !== '/role-selection') {
      const roleSelectionUrl = new URL('/role-selection', request.url);
      return NextResponse.redirect(roleSelectionUrl);
    }
    
    // For authenticated users: If they have a role but profile setup not completed, redirect to profile setup
    if (userRole && !profileSetupCompleted && finalPath !== '/profile-setup') {
      const profileSetupUrl = new URL('/profile-setup', request.url);
      return NextResponse.redirect(profileSetupUrl);
    }
    
    // If user is trying to access role-selection but already has a role
    if (userRole && finalPath === '/role-selection') {
      // Redirect to profile setup if not completed, otherwise to dashboard
      const redirectUrl = profileSetupCompleted 
        ? new URL('/dashboard', request.url)
        : new URL('/profile-setup', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If user is trying to access profile-setup but already completed
    if (userRole && profileSetupCompleted && finalPath === '/profile-setup') {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware auth error:', error);
    }
    // On error, allow the request to proceed to avoid breaking the app
  }
  
  return cleanedResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // Note: Domain-based routing doesn't use path prefixes
  matcher: [
    // Match all request paths except for the ones starting with:
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};
