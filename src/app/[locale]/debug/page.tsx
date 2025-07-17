'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Session</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}