import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { cleanupTransferCookie } from './lib/cleanup-transfer';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  
  // Clean up transfer cookies if user is authenticated
  return cleanupTransferCookie(request, response);
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
