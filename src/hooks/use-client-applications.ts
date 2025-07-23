import { useQuery } from '@tanstack/react-query'
import { JobApplication } from '@/types/application'

// Custom hook to get all applications for a client's jobs
export function useClientApplications(jobIds: string[], jobs?: Array<{ id: string; title: string }>) {
  // Create a combined query that aggregates all job applications
  return useQuery({
    queryKey: ['client-applications', jobIds],
    queryFn: async (): Promise<JobApplication[]> => {
      if (!jobIds.length) return []
      
      // Fetch applications for all jobs in parallel
      const applicationPromises = jobIds.map(async (jobId) => {
        const response = await fetch(`/api/jobs/${jobId}/applications`)
        if (!response.ok) {
          throw new Error(`Failed to fetch applications for job ${jobId}`)
        }
        const data = await response.json()
        return data.applications || []
      })

      const allApplicationsArrays = await Promise.all(applicationPromises)
      const allApplications = allApplicationsArrays.flat()

      // If jobs data is provided, merge job information into applications
      if (jobs && jobs.length > 0) {
        const jobsMap = new Map(jobs.map(job => [job.id, job]))
        
        allApplications.forEach(application => {
          if (application.jobId && jobsMap.has(application.jobId)) {
            application.job = jobsMap.get(application.jobId)
          }
        })
      }

      // Sort by creation date, newest first
      return allApplications.sort((a, b) => 
        new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
      )
    },
    enabled: jobIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
