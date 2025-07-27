'use client'

import { useJobManager } from '@/hooks/useQueryManagers'
import { useStaticDataManager } from '@/hooks/useQueryManagers'
import { Check, X, Clock } from 'lucide-react'

interface MigrationItemProps {
  title: string
  description: string
  status: 'complete' | 'in-progress' | 'pending'
  testResult?: boolean
}

function MigrationItem({ title, description, status, testResult }: MigrationItemProps) {
  const getIcon = () => {
    if (testResult === false) return <X className="w-5 h-5 text-red-500" />
    if (status === 'complete') return <Check className="w-5 h-5 text-green-500" />
    if (status === 'in-progress') return <Clock className="w-5 h-5 text-yellow-500" />
    return <div className="w-5 h-5 bg-gray-300 rounded-full" />
  }

  const getStatusText = () => {
    if (testResult === false) return 'Failed'
    if (status === 'complete') return 'Complete'
    if (status === 'in-progress') return 'In Progress'
    return 'Pending'
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {getIcon()}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className={`text-sm font-medium ${
        testResult === false ? 'text-red-600' : 
        status === 'complete' ? 'text-green-600' : 
        status === 'in-progress' ? 'text-yellow-600' : 'text-gray-600'
      }`}>
        {getStatusText()}
      </span>
    </div>
  )
}

export default function MigrationStatus() {
  // Test the job manager hook
  const { jobs, isLoading: jobsLoading, isError: jobsError } = useJobManager()
  
  // Test the static data manager
  const { 
    cities, 
    categories, 
    citiesLoading, 
    categoriesLoading, 
    citiesError, 
    categoriesError 
  } = useStaticDataManager()
  
  const staticLoading = citiesLoading || categoriesLoading
  const staticError = citiesError || categoriesError

  const migrationItems = [
    {
      title: 'Package.json Migration',
      description: 'Removed Prisma dependencies, added Supabase packages',
      status: 'complete' as const
    },
    {
      title: 'Supabase Client Setup',
      description: 'Client configuration with TypeScript types',
      status: 'complete' as const
    },
    {
      title: 'TanStack Query Integration',
      description: 'Query client and providers configured',
      status: 'complete' as const
    },
    {
      title: 'Job Manager Hook',
      description: 'useJobManager() with real-time updates',
      status: 'in-progress' as const,
      testResult: !jobsError
    },
    {
      title: 'Static Data Manager',
      description: 'Cities and categories with Supabase',
      status: 'in-progress' as const,
      testResult: !staticError
    },
    {
      title: 'Job List Component',
      description: 'Migrated to use Supabase hooks',
      status: 'in-progress' as const
    },
    {
      title: 'Real-time Subscriptions',
      description: 'Live updates for jobs and applications',
      status: 'pending' as const
    },
    {
      title: 'File Storage Migration',
      description: 'Move to Supabase Storage buckets',
      status: 'pending' as const
    },
    {
      title: 'Authentication Migration',
      description: 'NextAuth to Supabase Auth',
      status: 'pending' as const
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prisma to Supabase Migration Status</h1>
        <p className="text-gray-600 mb-6">Phase 3: API Route Migration & Component Updates</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {migrationItems.filter(item => item.status === 'complete').length}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {migrationItems.filter(item => item.status === 'in-progress').length}
            </div>
            <div className="text-sm text-yellow-600">In Progress</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {migrationItems.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Migration Items */}
        <div className="space-y-3">
          {migrationItems.map((item, index) => (
            <MigrationItem key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Live Test Results</h2>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Job Manager Test</h3>
            {jobsLoading ? (
              <div className="text-yellow-600">Loading jobs...</div>
            ) : jobsError ? (
              <div className="text-red-600">❌ Error loading jobs</div>
            ) : (
              <div className="text-green-600">✅ Jobs loaded successfully ({jobs?.length || 0} jobs)</div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Static Data Test</h3>
            {staticLoading ? (
              <div className="text-yellow-600">Loading static data...</div>
            ) : staticError ? (
              <div className="text-red-600">❌ Error loading static data</div>
            ) : (
              <div className="text-green-600">
                ✅ Static data loaded successfully 
                ({cities?.length || 0} cities, {categories?.length || 0} categories)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h2>
        <ul className="space-y-2 text-blue-800">
          <li>• Migrate remaining job-related components to use useJobManager()</li>
          <li>• Implement real-time subscriptions for live updates</li>
          <li>• Migrate application management to Supabase</li>
          <li>• Update file upload system to use Supabase Storage</li>
          <li>• Replace NextAuth with Supabase Auth</li>
        </ul>
      </div>
    </div>
  )
}
