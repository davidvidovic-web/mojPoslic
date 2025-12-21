'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useTranslations } from 'next-intl'

interface ConnectionPackage {
  id: string
  connections: number
  price: number
  currency: string
  name: string
  description: string
}

export default function AdminPackagesPage() {
  const t = useTranslations()
  const { user, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()
  const [packages, setPackages] = useState<ConnectionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    
    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    fetchPackages()
  }, [user, isAdmin, authLoading, router])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages')
      if (!response.ok) {
        if (response.status === 403) {
          setMessage('Admin access required')
          return
        }
        throw new Error('Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      setMessage('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const updatePackage = (index: number, field: keyof ConnectionPackage, value: string | number) => {
    const newPackages = [...packages]
    newPackages[index] = { ...newPackages[index], [field]: value }
    setPackages(newPackages)
  }

  const savePackages = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packages }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save packages')
      }

      setMessage('Packages updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving packages:', error)
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const calculatePerConnectionPrice = (price: number, connections: number) => {
    return (price / connections).toFixed(3)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('admin.packages.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow">
          <div className="px-6 py-4 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">
              {t('admin.packages.title')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('admin.packages.subtitle')}
            </p>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.includes('Error') || message.includes('Failed') 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                  : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-6">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className="border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('admin.packages.packageName')}
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => updatePackage(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('admin.packages.connections')}
                      </label>
                      <input
                        type="number"
                        value={pkg.connections}
                        onChange={(e) => updatePackage(index, 'connections', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('admin.packages.price')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pkg.price}
                        onChange={(e) => updatePackage(index, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('admin.packages.packageDescription')}
                      </label>
                      <input
                        type="text"
                        value={pkg.description}
                        onChange={(e) => updatePackage(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium">{t('admin.packages.pricePerConnection')}:</span> {t('admin.packages.currency')}{calculatePerConnectionPrice(pkg.price, pkg.connections)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-foreground bg-secondary rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {t('admin.packages.backToDashboard')}
              </button>
              
              <button
                onClick={savePackages}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-background rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t('admin.packages.saving') : t('admin.packages.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
