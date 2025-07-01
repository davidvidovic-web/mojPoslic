'use client'

import { useState, useEffect } from "react"
import { JobCard } from "./job-card"
import { JobCardList } from "./job-card-list"
import { JobCardListSkeleton, JobCardSkeleton } from "./job-card-skeleton"
import { Job } from "@/types/job"
import { JobFilters } from "./job-list/job-filters"
import { JobsViewControls } from "./job-list/jobs-view-controls"
import { JobsEmptyState } from "./job-list/jobs-empty-state"
import { JobsPagination } from "./job-list/jobs-pagination"

interface JobListProps {
  refreshTrigger?: number
}

type ViewMode = 'grid' | 'list'

const JOBS_PER_PAGE = 20

export function JobList({ refreshTrigger }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list') // Default to list view
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchJobs()
  }, [refreshTrigger])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCity = cityFilter === 'all' || job.city?.key === cityFilter
    
    const matchesCategory = categoryFilter === 'all' || job.category?.key === categoryFilter
    
    const matchesType = typeFilter === 'all' || job.type === typeFilter

    return matchesSearch && matchesCity && matchesCategory && matchesType
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE
  const endIndex = startIndex + JOBS_PER_PAGE
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, cityFilter, categoryFilter, typeFilter])

  const hasActiveFilters = searchTerm !== '' || 
    cityFilter !== 'all' || 
    categoryFilter !== 'all' || 
    typeFilter !== 'all'

  const clearAllFilters = () => {
    setSearchTerm('')
    setCityFilter('all')
    setCategoryFilter('all')
    setTypeFilter('all')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Filters skeleton */}
        <div className="space-y-6">
          <JobFilters
            searchTerm=""
            setSearchTerm={() => {}}
            cityFilter="all"
            setCityFilter={() => {}}
            categoryFilter="all"
            setCategoryFilter={() => {}}
            typeFilter="all"
            setTypeFilter={() => {}}
          />
          
          <JobsViewControls
            filteredJobsCount={0}
            startIndex={0}
            endIndex={0}
            jobsPerPage={JOBS_PER_PAGE}
            viewMode={viewMode}
            setViewMode={setViewMode}
            hasActiveFilters={false}
            onClearFilters={() => {}}
          />
        </div>

        {/* Job skeletons */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <JobCardListSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-6">
        <JobFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
        
        <JobsViewControls
          filteredJobsCount={filteredJobs.length}
          startIndex={startIndex}
          endIndex={endIndex}
          jobsPerPage={JOBS_PER_PAGE}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      </div>

      {/* Job Display */}
      {filteredJobs.length === 0 ? (
        <JobsEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <JobCardList key={job.id} job={job} onJobUpdated={fetchJobs} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} onJobUpdated={fetchJobs} />
              ))}
            </div>
          )}
          
          <JobsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}
