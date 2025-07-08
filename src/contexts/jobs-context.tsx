'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface JobsContextType {
  refreshTrigger: number
  refreshJobs: () => void
}

const JobsContext = createContext<JobsContextType | null>(null)

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshJobs = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const value = useMemo(() => ({
    refreshTrigger,
    refreshJobs
  }), [refreshTrigger, refreshJobs])

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const context = useContext(JobsContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}
