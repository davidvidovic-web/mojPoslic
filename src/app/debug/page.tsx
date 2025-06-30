'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('Testing connection...\n')
    
    try {
      // Test 1: Basic connection
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        setResult(prev => prev + `❌ Connection error: ${error.message}\n`)
        setResult(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`)
        setLoading(false)
        return
      }
      
      setResult(prev => prev + '✅ Successfully connected to database\n')
      
      // Test 2: Check if profiles table exists and is accessible
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (profilesError) {
        setResult(prev => prev + `❌ Profiles table error: ${profilesError.message}\n`)
        setLoading(false)
        return
      }
      
      setResult(prev => prev + `✅ Profiles table accessible, found ${profiles.length} profile(s)\n`)
      
      // Test 3: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setResult(prev => prev + `❌ Session error: ${sessionError.message}\n`)
        setLoading(false)
        return
      }
      
      setResult(prev => prev + `✅ Auth working, current session: ${session ? 'logged in' : 'not logged in'}\n`)
      
      setResult(prev => prev + '🎉 All basic tests passed!\n')
      
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected error: ${error}\n`)
    }
    
    setLoading(false)
  }

  const testLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('Testing login...\n')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setResult(prev => prev + `❌ Login error: ${error.message}\n`)
        setResult(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`)
        setLoading(false)
        return
      }
      
      setResult(prev => prev + '✅ Login successful!\n')
      setResult(prev => prev + `User: ${data.user?.email}\n`)
      
      // Try to fetch profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          setResult(prev => prev + `❌ Profile fetch error: ${profileError.message}\n`)
        } else {
          setResult(prev => prev + `✅ Profile fetched: ${JSON.stringify(profile, null, 2)}\n`)
        }
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Unexpected login error: ${error}\n`)
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Supabase Debug Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
      
      <form onSubmit={testLogin} className="space-y-4">
        <h2 className="text-xl font-semibold">Test Login</h2>
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
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 disabled:opacity-50"
        >
          {loading ? 'Testing Login...' : 'Test Login'}
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
