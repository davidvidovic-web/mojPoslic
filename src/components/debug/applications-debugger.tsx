'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useUserJobsQuery } from '@/hooks/queries/useJobs'
import { useClientApplications } from '@/hooks/use-client-applications'

export function ApplicationsDebugger() {
  const { user } = useSupabaseAuth()
  const { data: jobs = [], isLoading: jobsLoading } = useUserJobsQuery(user?.id || '')
  const jobIds = jobs.map(job => job.id)
  const { data: allApplications = [], isLoading: applicationsLoading, error } = useClientApplications(jobIds, jobs)

  console.log('Debug Info:', {
    user: user?.id,
    jobs: jobs.length,
    jobIds,
    applications: allApplications.length,
    applicationsLoading,
    error,
    sampleApplication: allApplications[0]
  })

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Applications Debug Info:</h3>
      <div className="space-y-2 text-sm">
        <p>User ID: {user?.id}</p>
        <p>Jobs Count: {jobs.length}</p>
        <p>Applications Count: {allApplications.length}</p>
        <p>Loading: {applicationsLoading ? 'Yes' : 'No'}</p>
        {error && <p className="text-red-500">Error: {error.message}</p>}
        
        {jobs.length > 0 && (
          <div>
            <p className="font-semibold">Jobs:</p>
            <ul className="list-disc list-inside">
              {jobs.map(job => (
                <li key={job.id}>{job.title} (ID: {job.id})</li>
              ))}
            </ul>
          </div>
        )}
        
        {allApplications.length > 0 && (
          <div>
            <p className="font-semibold">Sample Application:</p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(allApplications[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
