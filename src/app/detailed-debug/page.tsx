'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DetailedAuthDebug() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testEverything = async () => {
    setLoading(true)
    setResult('🔍 Running comprehensive auth debug...\n\n')
    
    try {
      // Test 1: Check Supabase client config
      setResult(prev => prev + '1. Testing Supabase client configuration...\n')
      setResult(prev => prev + `   URL: ${supabase.supabaseUrl}\n`)
      setResult(prev => prev + `   Key: ${supabase.supabaseKey?.substring(0, 20)}...\n`)
      
      // Test 2: Test simple table query (not auth-dependent)
      setResult(prev => prev + '\n2. Testing basic table access...\n')
      const { data: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      
      if (countError) {
        setResult(prev => prev + `   ❌ Table access failed: ${countError.message}\n`)
        setResult(prev => prev + `   Error code: ${countError.code}\n`)
        setResult(prev => prev + `   Error details: ${JSON.stringify(countError, null, 2)}\n`)
        setLoading(false)
        return
      } else {
        setResult(prev => prev + `   ✅ Table accessible, count: ${profileCount}\n`)
      }
      
      // Test 3: Test auth.getUser() without login
      setResult(prev => prev + '\n3. Testing current auth state...\n')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setResult(prev => prev + `   ❌ Auth state error: ${userError.message}\n`)
      } else {
        setResult(prev => prev + `   ✅ Auth state accessible, current user: ${user ? user.email : 'none'}\n`)
      }
      
      // Test 4: Test auth.getSession()
      setResult(prev => prev + '\n4. Testing session access...\n')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setResult(prev => prev + `   ❌ Session error: ${sessionError.message}\n`)
      } else {
        setResult(prev => prev + `   ✅ Session accessible: ${session ? 'active' : 'none'}\n`)
      }
      
      setResult(prev => prev + '\n🎉 All basic tests passed! The issue is likely during login itself.\n')
      setResult(prev => prev + '\nNow test the login process with your credentials...\n')
      
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected error: ${error}\n`)
    }
    
    setLoading(false)
  }

  const testLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(prev => prev + '\n🔐 Testing login process step by step...\n')
    
    try {
      setResult(prev => prev + '1. Attempting signInWithPassword...\n')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      
      if (error) {
        setResult(prev => prev + `❌ Login failed at auth level:\n`)
        setResult(prev => prev + `   Message: ${error.message}\n`)
        setResult(prev => prev + `   Status: ${error.status}\n`)
        setResult(prev => prev + `   Code: ${error.code}\n`)
        setResult(prev => prev + `   Full error: ${JSON.stringify(error, null, 2)}\n`)
        
        // Additional debugging for specific error
        if (error.message.includes('Database error querying schema')) {
          setResult(prev => prev + '\n💡 This error suggests:\n')
          setResult(prev => prev + '   • RLS policies might be conflicting\n')
          setResult(prev => prev + '   • Run the fix-policies.sql script\n')
          setResult(prev => prev + '   • Or there might be a trigger issue\n')
        }
        
        setLoading(false)
        return
      }
      
      setResult(prev => prev + '✅ Login successful!\n')
      setResult(prev => prev + `   User ID: ${data.user?.id}\n`)
      setResult(prev => prev + `   Email: ${data.user?.email}\n`)
      
      // Test profile fetch after successful login
      setResult(prev => prev + '\n2. Testing profile fetch after login...\n')
      
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          setResult(prev => prev + `❌ Profile fetch failed: ${profileError.message}\n`)
          setResult(prev => prev + `   Code: ${profileError.code}\n`)
          setResult(prev => prev + `   Details: ${JSON.stringify(profileError, null, 2)}\n`)
        } else {
          setResult(prev => prev + `✅ Profile fetched successfully!\n`)
          setResult(prev => prev + `   Profile: ${JSON.stringify(profile, null, 2)}\n`)
        }
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected login error: ${error}\n`)
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Detailed Auth Debug</h1>
      
      <div className="space-y-4">
        <button
          onClick={testEverything}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Basic Setup'}
        </button>
      </div>
      
      <form onSubmit={testLogin} className="space-y-4">
        <h2 className="text-xl font-semibold">Test Login Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
            autoCapitalize="none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing Login...' : 'Test Login Step by Step'}
        </button>
      </form>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Debug Results:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
          {result || 'Click "Test Basic Setup" to start debugging'}
        </pre>
      </div>
      
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded">
        <h3 className="font-bold">Next Steps Based on Your Diagnostic:</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Your database setup looks correct</li>
          <li>You have duplicate RLS policies - run <code>fix-policies.sql</code></li>
          <li>The error might be at the auth layer, not the table layer</li>
          <li>Test with the login form above for detailed error info</li>
        </ul>
      </div>
    </div>
  )
}
