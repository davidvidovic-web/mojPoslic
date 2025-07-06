'use client'

import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Session Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">NextAuth Session</h2>
          <p><strong>Status:</strong> {status}</p>
          <pre className="bg-white p-3 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Auth Context User</h2>
          <pre className="bg-white p-3 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
