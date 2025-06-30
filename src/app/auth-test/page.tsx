'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MinimalAuthProvider, useMinimalAuth } from '@/contexts/minimal-auth-context'

function AuthTestContent() {
  const { user, session, loading } = useMinimalAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  const testBasicAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setTestLoading(true)
    setResult('Testing basic auth (no profile queries)...\n')
    
    try {
      // Test basic auth without any profile queries
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setResult(prev => prev + `❌ Auth error: ${error.message}\n`)
        setResult(prev => prev + `Error code: ${error.status}\n`)
        setResult(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`)
      } else {
        setResult(prev => prev + '✅ Basic auth successful!\n')
        setResult(prev => prev + `User ID: ${data.user?.id}\n`)
        setResult(prev => prev + `Email: ${data.user?.email}\n`)
        
        // Now test if we can query profiles
        setResult(prev => prev + '\nTesting profile query...\n')
        
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          if (profileError) {
            setResult(prev => prev + `❌ Profile query error: ${profileError.message}\n`)
            setResult(prev => prev + `Profile error details: ${JSON.stringify(profileError, null, 2)}\n`)
          } else {
            setResult(prev => prev + `✅ Profile found: ${JSON.stringify(profile, null, 2)}\n`)
          }
        }
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected error: ${error}\n`)
    }
    
    setTestLoading(false)
  }

  const testTableAccess = async () => {
    setResult('Testing table access...\n')
    
    try {
      // Test if profiles table exists and is accessible
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        setResult(prev => prev + `❌ Profiles table error: ${error.message}\n`)
        setResult(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`)
      } else {
        setResult(prev => prev + '✅ Profiles table accessible\n')
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected table access error: ${error}\n`)
    }
  }

  if (loading) {
    return <div>Loading auth state...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Isolated Auth Test</h1>
      
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Current Auth State (No Profile Queries)</h2>
        <p>User: {user ? user.email : 'None'}</p>
        <p>Session: {session ? 'Active' : 'None'}</p>
      </div>
      
      <button
        onClick={testTableAccess}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Table Access Only
      </button>
      
      <form onSubmit={testBasicAuth} className="space-y-4">
        <h2 className="text-xl font-semibold">Test Login (Isolated)</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          autoCapitalize="none"
          required
        />
        <button
          type="submit"
          disabled={testLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {testLoading ? 'Testing...' : 'Test Login (No Profile Query)'}
        </button>
      </form>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Test Results:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
          {result || 'No tests run yet'}
        </pre>
      </div>
    </div>
  )
}

export default function AuthTestPage() {
  return (
    <MinimalAuthProvider>
      <AuthTestContent />
    </MinimalAuthProvider>
  )
}
