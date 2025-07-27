'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type CitiesData = Database['public']['Tables']['cities']['Row'][]
type CategoriesData = Database['public']['Tables']['categories']['Row'][]

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [cities, setCities] = useState<CitiesData>([])
  const [categories, setCategories] = useState<CategoriesData>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .limit(5)

        if (citiesError) throw citiesError

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .limit(5)

        if (categoriesError) throw categoriesError

        setCities(citiesData || [])
        setCategories(categoriesData || [])
        setConnectionStatus('connected')
      } catch (err) {
        console.error('Supabase connection error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Supabase Connection Test</h1>
      
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="flex items-center space-x-2">
          {connectionStatus === 'testing' && (
            <>
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-700">Testing connection...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-700">Connected successfully!</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-red-700">Connection failed</span>
            </>
          )}
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Cities Data */}
      {cities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Cities (Sample)</h2>
          <div className="grid gap-2">
            {cities.map(city => (
              <div key={city.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{city.name}</span>
                <span className="text-sm text-gray-600">{city.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Data */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Categories (Sample)</h2>
          <div className="grid gap-2">
            {categories.map(category => (
              <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-gray-600">{category.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
