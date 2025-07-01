'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

interface SocialLoginSectionProps {
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function SocialLoginSection({ loading, setLoading }: SocialLoginSectionProps) {
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.url) {
        toast.success('Redirecting to Google...')
        // If no direct URL, try with redirect
        await signIn('google', {
          callbackUrl: '/dashboard',
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    try {
      const result = await signIn('apple', {
        callbackUrl: '/dashboard',
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.url) {
        toast.success('Redirecting to Apple...')
        // If no direct URL, try with redirect
        await signIn('apple', {
          callbackUrl: '/dashboard',
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Apple'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>
      <Button
        onClick={handleAppleLogin}
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        <svg
          className="mr-2 h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
          <path d="M15.53 3.83c.893-1.09 1.491-2.58 1.326-4.105-1.281.052-2.847.916-3.766 2.03-.832.956-1.56 2.471-1.365 3.899 1.454.104 2.96-.739 3.805-1.824z"/>
        </svg>
        Continue with Apple
      </Button>
    </div>
  )
}
