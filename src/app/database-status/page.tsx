'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function DatabaseStatusPage() {
  const [tables, setTables] = useState<string[]>([])
  const [tableDetails, setTableDetails] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const checkDatabaseStatus = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Check if essential tables exist by trying to query them
      const tablesToCheck = [
        'job_listings',
        'applications', 
        'users',
        'conversations',
        'messages',
        'notifications'
      ]

      const results: Record<string, any> = {}
      const existingTables: string[] = []

      for (const table of tablesToCheck) {
        try {
          const { data, error, count } = await supabase
            .from(table as any)
            .select('*', { count: 'exact', head: true })
            .limit(0)

          if (error) {
            results[table] = { error: error.message, exists: false }
          } else {
            results[table] = { count: count || 0, exists: true }
            existingTables.push(table)
          }
        } catch (err) {
          results[table] = { error: (err as Error).message, exists: false }
        }
      }

      setTables(existingTables)
      setTableDetails(results)

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const getTableStatus = (tableName: string) => {
    const details = tableDetails[tableName]
    if (!details) return '⏳ Checking...'
    if (!details.exists) return `❌ Missing: ${details.error}`
    return `✅ Exists (${details.count} records)`
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Production Database Status</h1>
      
      <div className="space-y-4 mb-8">
        <div className="bg-muted p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Connection Info</h2>
          <p><strong>Project:</strong> ecaukelsfokqzgvhonrk</p>
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p><strong>Status:</strong> {isLoading ? '🔄 Checking...' : error ? `❌ ${error}` : '✅ Connected'}</p>
        </div>
        
        <Button onClick={checkDatabaseStatus} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Refresh Database Status'}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Essential Tables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['job_listings', 'applications', 'users', 'conversations', 'messages', 'notifications'].map(table => (
            <div key={table} className="border rounded-lg p-4">
              <h3 className="font-medium">{table}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {getTableStatus(table)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(tableDetails).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Detailed Results</h2>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            <pre>{JSON.stringify(tableDetails, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">💡 Next Steps</h3>
        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
          <li>• If tables are missing, you need to run migrations on your production database</li>
          <li>• If tables exist but are empty, you need to seed data</li>
          <li>• If everything looks good, the issue might be with authentication or API routes</li>
        </ul>
      </div>
    </div>
  )
}
