import { NextRequest, NextResponse } from 'next/server'

export function cleanupTransferCookie(request: NextRequest, response: NextResponse) {
  // Check if we have a transfer cookie and user is now authenticated
  const transferCookie = request.cookies.get('auth-transfer')
  const sessionCookie = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token')

  if (transferCookie && sessionCookie) {
    // User is now authenticated, clean up the transfer cookie
    response.cookies.delete('auth-transfer')
  }

  return response
}
