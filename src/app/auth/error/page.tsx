'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact support.'
      case 'AccessDenied':
        return 'You do not have access to this resource.'
      case 'Verification':
        return 'The verification link is invalid or has expired.'
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return 'There was a problem with the authentication service. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.'
      case 'EmailSignin':
        return 'The email could not be sent. Please try again later.'
      case 'CredentialsSignin':
        return 'The login credentials you provided are invalid.'
      case 'SessionRequired':
        return 'You need to be signed in to access this page.'
      default:
        return 'An unexpected error occurred. Please try again later.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground mt-2">
            {getErrorMessage()}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Link href="/login" passHref>
            <Button className="w-full">
              Return to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
