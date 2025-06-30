'use client'

import { useState, useEffect } from "react"
import { JobCard } from "./job-card"
import { JobCardList } from "./job-card-list"
import { Job } from "@/types/job"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CitiesFilter } from "@/components/cities-filter"
import { CategoriesFilter } from "@/components/categories-filter"
import { Briefcase, List, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react"

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border-border/40">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
              <Input
                placeholder="Search jobs, companies, skills, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border/50"
              />
            </div>
            <CitiesFilter
              value={cityFilter}
              onChange={setCityFilter}
              placeholder="All locations"
              className="sm:w-64"
            />
            <CategoriesFilter
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="All categories"
              className="sm:w-64"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="sm:w-48 border-border/50">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="quick-job">Quick Job</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? 's' : ''} found
            {filteredJobs.length > JOBS_PER_PAGE && (
              <span> • Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center border border-border/40 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            
            {(searchTerm || (cityFilter && cityFilter !== 'all') || (categoryFilter && categoryFilter !== 'all') || (typeFilter && typeFilter !== 'all')) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setCityFilter('all')
                  setCategoryFilter('all')
                  setTypeFilter('all')
                }}
                className="border-border/50"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Job Display */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No jobs found</h3>
            <p className="text-muted-foreground leading-relaxed">
              {searchTerm || (cityFilter && cityFilter !== 'all') || (categoryFilter && categoryFilter !== 'all') || (typeFilter && typeFilter !== 'all')
                ? "We couldn't find any jobs matching your criteria. Try adjusting your search filters or check back later for new opportunities." 
                : "No jobs have been posted yet. Be the first to post a job opportunity!"}
            </p>
            {(searchTerm || (cityFilter && cityFilter !== 'all') || (categoryFilter && categoryFilter !== 'all') || (typeFilter && typeFilter !== 'all')) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setCityFilter('all')
                  setCategoryFilter('all')
                  setTypeFilter('all')
                }}
                className="border-border/50"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <JobCardList key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0 border-border/50"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-border/50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
