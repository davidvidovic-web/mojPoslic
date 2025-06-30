'use client'

import { RobustAuthProvider, useRobustAuth } from '@/contexts/robust-auth-context'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

function TestContent() {
  const { user, profile, loading, ensureProfile } = useRobustAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  const testRobustLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setTestLoading(true)
    setResult('Testing robust login...\n')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        setResult(prev => prev + `❌ Login failed: ${error.message}\n`)
        setResult(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`)
        setTestLoading(false)
        return
      }

      setResult(prev => prev + '✅ Login successful!\n')
      
      // Ensure profile exists
      setResult(prev => prev + 'Ensuring profile exists...\n')
      const profile = await ensureProfile()
      
      if (profile) {
        setResult(prev => prev + `✅ Profile ready: ${JSON.stringify(profile, null, 2)}\n`)
      } else {
        setResult(prev => prev + '❌ Could not create/fetch profile\n')
      }

    } catch (error) {
      setResult(prev => prev + `❌ Unexpected error: ${error}\n`)
    }

    setTestLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Robust Auth Test</h1>
      
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Current State</h2>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.email : 'None'}</p>
        <p>Profile: {profile ? `${profile.name} (${profile.role})` : 'None'}</p>
      </div>

      <form onSubmit={testRobustLogin} className="space-y-4">
        <h2 className="text-xl font-semibold">Test Robust Login</h2>
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
          {testLoading ? 'Testing...' : 'Test Robust Login'}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
          {result || 'No tests run yet'}
        </pre>
      </div>
    </div>
  )
}

export default function RobustAuthTest() {
  return (
    <RobustAuthProvider>
      <TestContent />
    </RobustAuthProvider>
  )
}
