'use client'

import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

export default function PureSupabaseTest() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  // Create a fresh Supabase client for testing
  const testClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const testPureAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('🧪 Testing pure Supabase auth (no custom code)...\n\n')

    try {
      // Test 1: Check environment variables
      setResult(prev => prev + '1. Environment check:\n')
      setResult(prev => prev + `   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`)
      setResult(prev => prev + `   Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...\n\n`)

      // Test 2: Basic connection
      setResult(prev => prev + '2. Testing basic connection...\n')
      const { error: healthError } = await testClient
        .from('profiles')
        .select('count', { count: 'exact', head: true })

      if (healthError) {
        setResult(prev => prev + `   ❌ Connection failed: ${healthError.message}\n\n`)
      } else {
        setResult(prev => prev + `   ✅ Connection OK\n\n`)
      }

      // Test 3: Pure auth without any triggers or profiles
      setResult(prev => prev + '3. Testing pure authentication...\n')
      
      const { data: authData, error: authError } = await testClient.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (authError) {
        setResult(prev => prev + `   ❌ Auth failed: ${authError.message}\n`)
        setResult(prev => prev + `   Status: ${authError.status}\n`)
        setResult(prev => prev + `   Code: ${authError.code}\n`)
        setResult(prev => prev + `   Details: ${JSON.stringify(authError, null, 2)}\n\n`)

        // Additional debugging
        if (authError.message.includes('Database error querying schema')) {
          setResult(prev => prev + '💡 This error suggests:\n')
          setResult(prev => prev + '   • Database/schema configuration issue\n')
          setResult(prev => prev + '   • Trigger or constraint failure\n')
          setResult(prev => prev + '   • RLS policy problem\n')
          setResult(prev => prev + '   • Supabase project configuration issue\n\n')
        }

        setLoading(false)
        return
      }

      setResult(prev => prev + '   ✅ Pure auth successful!\n')
      setResult(prev => prev + `   User ID: ${authData.user?.id}\n`)
      setResult(prev => prev + `   Email: ${authData.user?.email}\n\n`)

      // Test 4: Check if we can query auth session
      setResult(prev => prev + '4. Testing session access...\n')
      const { data: sessionData, error: sessionError } = await testClient.auth.getSession()

      if (sessionError) {
        setResult(prev => prev + `   ❌ Session error: ${sessionError.message}\n`)
      } else {
        setResult(prev => prev + `   ✅ Session accessible\n`)
        setResult(prev => prev + `   Session valid: ${sessionData.session ? 'Yes' : 'No'}\n\n`)
      }

      // Test 5: Try basic table query (if auth worked)
      setResult(prev => prev + '5. Testing basic table access...\n')
      const { data: tableData, error: tableError } = await testClient
        .from('profiles')
        .select('*')
        .limit(1)

      if (tableError) {
        setResult(prev => prev + `   ❌ Table access failed: ${tableError.message}\n`)
      } else {
        setResult(prev => prev + `   ✅ Table access OK\n`)
        setResult(prev => prev + `   Records found: ${tableData?.length || 0}\n\n`)
      }

      setResult(prev => prev + '🎉 All tests completed!\n')

    } catch (error) {
      setResult(prev => prev + `❌ Unexpected error: ${error}\n`)
    }

    setLoading(false)
  }

  const testSignUp = async () => {
    setLoading(true)
    setResult('🆕 Testing sign up (to see if new user creation works)...\n\n')

    const testEmail = `test.${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    try {
      const { data, error } = await testClient.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      if (error) {
        setResult(prev => prev + `❌ Sign up failed: ${error.message}\n`)
        setResult(prev => prev + `Details: ${JSON.stringify(error, null, 2)}\n`)
      } else {
        setResult(prev => prev + `✅ Sign up successful!\n`)
        setResult(prev => prev + `User: ${data.user?.email}\n`)
        setResult(prev => prev + `Confirmation needed: ${!data.session}\n`)
      }
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected signup error: ${error}\n`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pure Supabase Test (No Custom Code)</h1>
      
      <div className="bg-blue-100 border border-blue-400 text-blue-800 p-4 rounded">
        <h3 className="font-bold">This test bypasses all your custom auth code</h3>
        <p>It uses a fresh Supabase client to test if the issue is with Supabase itself or your implementation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={testPureAuth} className="space-y-4">
          <h2 className="text-xl font-semibold">Test Existing User Login</h2>
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
            disabled={loading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Pure Login'}
          </button>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test New User Creation</h2>
          <p className="text-sm text-gray-600">
            This will create a test user to see if the trigger causes issues during signup.
          </p>
          <button
            onClick={testSignUp}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Sign Up'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Test Results:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
          {result || 'Run a test to see results'}
        </pre>
      </div>

      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded">
        <h3 className="font-bold">Next Steps:</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>If pure auth fails → Run <code>database/remove-trigger-test.sql</code></li>
          <li>If pure auth works → The issue is in your app code</li>
          <li>If sign up fails → Run <code>database/nuclear-reset.sql</code></li>
        </ul>
      </div>
    </div>
  )
}
