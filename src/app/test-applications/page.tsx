'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function TestApplicationsPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testApplicationsAPI = async () => {
    setIsLoading(true)
    setTestResult('Testing applications API...')

    try {
      // Step 1: Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setTestResult('❌ User not authenticated. Please sign in first.')
        setIsLoading(false)
        return
      }

      setTestResult(prev => prev + '\n✅ User authenticated: ' + user.email)

      // Step 2: Test fetching applications (should work even if empty)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setTestResult(prev => prev + '\n❌ No session found')
        setIsLoading(false)
        return
      }

      setTestResult(prev => prev + '\n✅ Session found')

      // Step 3: Test the applications API endpoint
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId: 'test-job-id-12345', // This will fail but should give us insight
          coverLetter: 'Test cover letter',
          clientNotes: 'Test client notes'
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        setTestResult(prev => prev + `\n⚠️ API Response (${response.status}): ${result.error}`)
        
        // If it's a job not found error, that's actually good - it means the API is working
        if (result.error?.includes('job') || result.error?.includes('Job')) {
          setTestResult(prev => prev + '\n✅ API is working! (Job not found is expected with test ID)')
        }
      } else {
        setTestResult(prev => prev + '\n✅ API Response: Success')
      }

      // Step 4: Test Supabase direct connection
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_listings')
        .select('id, title')
        .limit(1)

      if (jobsError) {
        setTestResult(prev => prev + '\n❌ Direct Supabase query failed: ' + jobsError.message)
      } else {
        setTestResult(prev => prev + '\n✅ Direct Supabase query successful')
        if (jobsData && jobsData.length > 0) {
          setTestResult(prev => prev + `\n📋 Found ${jobsData.length} job(s) in database`)
        } else {
          setTestResult(prev => prev + '\n📋 No jobs found in database (empty database)')
        }
      }

    } catch (error) {
      setTestResult(prev => prev + '\n❌ Test failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithOTP = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: 'test@example.com',
        options: {
          shouldCreateUser: true
        }
      })
      
      if (error) {
        setTestResult('❌ OTP Sign-in failed: ' + error.message)
      } else {
        setTestResult('✅ OTP Sign-in successful! Check email for link.')
      }
    } catch (error) {
      setTestResult('❌ OTP Sign-in error: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Applications API Test</h1>
      
      <div className="space-y-4 mb-8">
        <Button onClick={testApplicationsAPI} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Applications API'}
        </Button>
        
        <Button onClick={signInWithOTP} disabled={isLoading} variant="outline">
          Test OTP Sign-in (Original Error)
        </Button>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configuration</h2>
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p><strong>Supabase URL:</strong> <code>{process.env.NEXT_PUBLIC_SUPABASE_URL}</code></p>
          <p><strong>Anon Key:</strong> <code>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</code></p>
        </div>
      </div>
      
      {testResult && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {testResult}
          </div>
        </div>
      )}
    </div>
  )
}
