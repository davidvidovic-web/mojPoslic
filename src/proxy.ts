import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase-server';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  console.log(`[MIDDLEWARE] ${hostname}${pathname}`);

  // Skip middleware for API routes, static files, and internal Next.js routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/manifest')
  ) {
    return NextResponse.next();
  }

  // Handle localhost development - default to Bosnian locale
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    console.log(`[LOCALHOST] Processing: ${pathname}`);
    // For localhost, if no locale prefix, assume Bosnian (bs)
    if (!pathname.startsWith('/bs') && !pathname.startsWith('/en')) {
      console.log(`[LOCALHOST] Rewriting ${pathname} to /bs${pathname}`);
      return NextResponse.rewrite(new URL(`/bs${pathname}`, request.url));
    }
  }

  // Redirect old English documentation slugs to Bosnian-first slugs
  const englishToBosnianSlugs: Record<string, string> = {
    'getting-started': 'pocetni-koraci',
    'for-clients': 'za-klijente', 
    'for-taskers': 'za-radnike',
    'payments': 'placanja',
    'security': 'sigurnost',
    'policies': 'politike',
    'troubleshooting': 'rjesavanje-problema'
  }

  // Check if pathname contains old English documentation slugs
  for (const [englishSlug, bosnianSlug] of Object.entries(englishToBosnianSlugs)) {
    if (pathname.includes(`/dokumentacija/${englishSlug}`)) {
      const newPath = pathname.replace(`/dokumentacija/${englishSlug}`, `/dokumentacija/${bosnianSlug}`)
      return NextResponse.redirect(new URL(newPath, request.url), 301)
    }
  }

  // Handle domain-based routing redirects manually to avoid loops
  if (hostname === 'mojposlic.com') {
    // Redirect /bs/* paths to clean URLs on main domain
    if (pathname.startsWith('/bs/')) {
      const cleanPath = pathname.substring(3); // Remove '/bs'
      return NextResponse.redirect(new URL(cleanPath || '/', request.url), 301);
    }
    
    // Redirect /en/* paths to English subdomain
    if (pathname.startsWith('/en/')) {
      const cleanPath = pathname.substring(3); // Remove '/en'
      return NextResponse.redirect(new URL(`https://en.mojposlic.com${cleanPath}`, request.url), 301);
    }
    
    // For paths without locale prefix on main domain, internally rewrite to /bs
    if (!pathname.startsWith('/bs') && !pathname.startsWith('/en')) {
      return NextResponse.rewrite(new URL(`/bs${pathname}`, request.url));
    }
  } else if (hostname === 'en.mojposlic.com') {
    // Redirect /en/* paths to clean URLs on English domain
    if (pathname.startsWith('/en/')) {
      const cleanPath = pathname.substring(3); // Remove '/en'
      return NextResponse.redirect(new URL(cleanPath || '/', request.url), 301);
    }
    
    // Redirect /bs/* paths to main domain
    if (pathname.startsWith('/bs/')) {
      const cleanPath = pathname.substring(3); // Remove '/bs'
      return NextResponse.redirect(new URL(`https://mojposlic.com${cleanPath}`, request.url), 301);
    }
    
    // For paths without locale prefix on English subdomain, internally rewrite to /en
    if (!pathname.startsWith('/bs') && !pathname.startsWith('/en')) {
      return NextResponse.rewrite(new URL(`/en${pathname}`, request.url));
    }
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