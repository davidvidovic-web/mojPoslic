import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase-server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Early return for static files
  if (pathname.startsWith('/_next/') || pathname.startsWith('/_vercel/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // For API routes, just update session
  if (pathname.startsWith('/api/')) {
    return await updateSession(request);
  }

  // For auth routes, handle them specially to avoid redirect loops
  if (pathname.startsWith('/auth/')) {
    // Apply intl middleware but don't cascade to updateSession to avoid loops
    const intlResponse = intlMiddleware(request)
    
    // If intl middleware wants to redirect, let it
    if (intlResponse.status === 307 || intlResponse.status === 301) {
      return intlResponse
    }
    
    // Otherwise just return the intl response without session update for auth routes
    return intlResponse
  }

  // For all other routes, apply both intl and session middleware
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware redirected, use that response
  if (intlResponse.status === 307 || intlResponse.status === 301) {
    return intlResponse;
  }
  
  // Otherwise, update session and continue
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};