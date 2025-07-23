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
  
  // Define truly public paths that don't require authentication
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
  
  // Skip auth checks for public paths
  if (publicPaths.includes(pathname)) {
    return cleanedResponse;
  }

  try {
    // Only check for basic authentication
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    });
    
    // If no token, redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      return NextResponse.redirect(signInUrl);
    }

    // User is authenticated - allow access to all protected paths
    // RegistrationFlowGuard components handle role/profile completion checks
    return cleanedResponse;
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware auth error:', error);
    }
    // On error, allow the request to proceed to avoid breaking the app
    return cleanedResponse;
  }
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};
