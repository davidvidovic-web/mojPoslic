'use client'

import { useEffect, useState } from 'react'

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl?: string
    supabaseUrlValue?: string
    supabaseKey?: string
    supabaseKeyValue?: string
    nodeEnv?: string
  }>({})

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      supabaseKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV,
    })
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envStatus.supabaseUrl}
          {envStatus.supabaseUrl === 'Set' && (
            <div className="text-sm text-gray-600">{envStatus.supabaseUrlValue}</div>
          )}
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envStatus.supabaseKey}
          {envStatus.supabaseKey === 'Set' && (
            <div className="text-sm text-gray-600">{envStatus.supabaseKeyValue}</div>
          )}
        </div>
        <div>
          <strong>NODE_ENV:</strong> {envStatus.nodeEnv}
        </div>
      </div>
      
      {(envStatus.supabaseUrl === 'Missing' || envStatus.supabaseKey === 'Missing') && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Environment Variables Missing!</h3>
          <p>Create a <code>.env.local</code> file in your project root with:</p>
          <pre className="mt-2 text-sm">
{`NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`}
          </pre>
        </div>
      )}
    </div>
  )
}
