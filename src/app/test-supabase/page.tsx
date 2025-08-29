'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const runTest = async () => {
      console.log('🚀 Starting Supabase connection test...')
      setLogs(prev => [...prev, '🚀 Starting Supabase connection test...'])
      
      try {
        // Test basic connection
        const { error } = await supabase.from('users').select('count').limit(1)
        
        if (error) {
          console.error('❌ Connection failed:', error.message)
          setLogs(prev => [...prev, `❌ Connection failed: ${error.message}`])
          setConnectionStatus('error')
          return
        }
        
        console.log('✅ Supabase connection successful!')
        setLogs(prev => [...prev, '✅ Supabase connection successful!'])
        
        // Test auth
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.log('⚠️ Auth check:', authError.message)
          setLogs(prev => [...prev, `⚠️ Auth check: ${authError.message}`])
        } else {
          console.log('👤 Auth status:', user ? 'User logged in' : 'No user logged in')
          setLogs(prev => [...prev, `👤 Auth status: ${user ? 'User logged in' : 'No user logged in'}`])
        }
        
        setConnectionStatus('success')
        
      } catch (error) {
        console.error('💥 Test failed:', error)
        setLogs(prev => [...prev, `💥 Test failed: ${error}`])
        setConnectionStatus('error')
      }
    }
    
    runTest()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Configuration</h2>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p><strong>URL:</strong> <code>{process.env.NEXT_PUBLIC_SUPABASE_URL}</code></p>
            <p><strong>Anon Key:</strong> <code>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</code></p>
            <p><strong>Project ID:</strong> <code>ecaukelsfokqzgvhonrk</code></p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connection Status</h2>
          <div className={`p-4 rounded-lg ${
            connectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-800' :
            connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'testing' && '🔄 Testing connection...'}
            {connectionStatus === 'success' && '✅ Connection successful!'}
            {connectionStatus === 'error' && '❌ Connection failed!'}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Test Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          {logs.length === 0 && <div>Waiting for logs...</div>}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Test
          </button>
          <button 
            onClick={() => window.open('https://supabase.com/dashboard/project/ecaukelsfokqzgvhonrk', '_blank')} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Open Supabase Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
