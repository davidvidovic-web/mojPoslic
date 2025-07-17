import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function languageRedirectMiddleware(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Only apply language preference redirect for authenticated users
    if (!token?.sub) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();

    // Skip if it's an API route or static asset
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/favicon.ico') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Get user's language preference from the database
    // This would require a database call, but for now we'll use a simpler approach
    // You could enhance this by caching the preference in the JWT token

    // For now, let's implement a basic version that doesn't require a DB call
    // The user's preference will be handled by the LanguageSwitcher component
    
    return NextResponse.next();
  } catch (error) {
    console.error('Language redirect middleware error:', error);
    return NextResponse.next();
  }
}
