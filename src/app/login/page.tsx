'use client'

import { AuthForm } from '@/components/auth-form'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { showToast } from '@/lib/toast'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const registered = searchParams.get('registered')

  useEffect(() => {
    if (registered === 'true') {
      showToast.success('Account created successfully! Please log in to continue.')
    }
  }, [registered])

  const handleLoginSuccess = () => {
    // After successful login, redirect to profile setup if needed
    // The dashboard will handle this automatically, so we just redirect there
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {registered === 'true' 
              ? 'Please log in with your new account to complete setup'
              : 'Sign in to access your account and find your next opportunity'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}
