"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { Search, Filter, ChevronDown, ChevronUp, X, Calendar as CalendarIcon, Star, MapPin } from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'
import { ApplicationStatus, JobApplication } from '@/types/application'

interface AdvancedFiltersProps {
  applications: JobApplication[]
  onFilterChange: (filteredApplications: JobApplication[]) => void
  onFiltersReset: () => void
}

interface FilterState {
  search: string
  status: ApplicationStatus[]
  dateRange: DateRange | undefined
  experience: string[]
  location: string[]
  rating: [number, number]
  skills: string[]
  sortBy: 'newest' | 'oldest' | 'rating' | 'experience'
  sortOrder: 'asc' | 'desc'
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'REVIEWED', label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
  { value: 'SELECTED', label: 'Selected', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
]

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (6-10 years)',
  'Expert Level (10+ years)'
]

const quickDateFilters = [
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 3 months', getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: 'Last 6 months', getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }) }
]

export function AdvancedFilters({ applications, onFilterChange, onFiltersReset }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    dateRange: undefined,
    experience: [],
    location: [],
    rating: [0, 5],
    skills: [],
    sortBy: 'newest',
    sortOrder: 'desc'
  })

  // Extract unique values from applications for filter options
  const uniqueLocations = [...new Set(
    applications
      .map(app => app.user?.location)
      .filter((location): location is string => Boolean(location))
  )].sort()

  const uniqueSkills = [...new Set(
    applications
      .map(app => app.user?.skills?.split(',').map(s => s.trim()))
      .flat()
      .filter((skill): skill is string => Boolean(skill))
  )].slice(0, 20) // Limit to top 20 skills

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...applications]

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(app => 
        app.user?.name?.toLowerCase().includes(searchLower) ||
        app.user?.email?.toLowerCase().includes(searchLower) ||
        app.message?.toLowerCase().includes(searchLower) ||
        app.user?.skills?.toLowerCase().includes(searchLower) ||
        app.user?.experience?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(app => filters.status.includes(app.status))
    }

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.createdAt)
        return appDate >= filters.dateRange!.from! && appDate <= filters.dateRange!.to!
      })
    }

    // Experience filter
    if (filters.experience.length > 0) {
      filtered = filtered.filter(app => {
        const userExperience = app.user?.experience?.toLowerCase() || ''
        return filters.experience.some(exp => {
          switch (exp) {
            case 'Entry Level (0-2 years)':
              return userExperience.includes('entry') || userExperience.includes('junior') || 
                     userExperience.includes('0') || userExperience.includes('1') || userExperience.includes('2')
            case 'Mid Level (3-5 years)':
              return userExperience.includes('mid') || userExperience.includes('3') || 
                     userExperience.includes('4') || userExperience.includes('5')
            case 'Senior Level (6-10 years)':
              return userExperience.includes('senior') || userExperience.includes('6') || 
                     userExperience.includes('7') || userExperience.includes('8') || 
                     userExperience.includes('9') || userExperience.includes('10')
            case 'Expert Level (10+ years)':
              return userExperience.includes('expert') || userExperience.includes('lead') ||
                     /\b(1[1-9]|[2-9]\d)\b/.test(userExperience)
            default:
              return false
          }
        })
      })
    }

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(app => 
        app.user?.location && filters.location.includes(app.user.location)
      )
    }

    // Rating filter
    if (filters.rating[0] > 0 || filters.rating[1] < 5) {
      filtered = filtered.filter(app => {
        const rating = app.user?.averageRating || 0
        return rating >= filters.rating[0] && rating <= filters.rating[1]
      })
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(app => {
        const userSkills = app.user?.skills?.toLowerCase().split(',').map(s => s.trim()) || []
        return filters.skills.some(skill => 
          userSkills.some(userSkill => userSkill.includes(skill.toLowerCase()))
        )
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'newest':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'oldest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'rating':
          comparison = (b.user?.averageRating || 0) - (a.user?.averageRating || 0)
          break
        case 'experience':
          comparison = (b.user?.experience || '').localeCompare(a.user?.experience || '')
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison
    })

    onFilterChange(filtered)
  }, [filters, applications, onFilterChange])

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleStatus = (status: ApplicationStatus) => {
    const currentStatus = filters.status
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]
    updateFilter('status', newStatus)
  }

  const toggleExperience = (experience: string) => {
    const current = filters.experience
    const updated = current.includes(experience)
      ? current.filter(e => e !== experience)
      : [...current, experience]
    updateFilter('experience', updated)
  }

  const toggleLocation = (location: string) => {
    const current = filters.location
    const updated = current.includes(location)
      ? current.filter(l => l !== location)
      : [...current, location]
    updateFilter('location', updated)
  }

  const toggleSkill = (skill: string) => {
    const current = filters.skills
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill]
    updateFilter('skills', updated)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      status: [],
      dateRange: undefined,
      experience: [],
      location: [],
      rating: [0, 5],
      skills: [],
      sortBy: 'newest',
      sortOrder: 'desc'
    })
    onFiltersReset()
  }

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status.length > 0 || 
           filters.dateRange || 
           filters.experience.length > 0 || 
           filters.location.length > 0 || 
           filters.rating[0] > 0 || 
           filters.rating[1] < 5 || 
           filters.skills.length > 0
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status.length > 0) count++
    if (filters.dateRange) count++
    if (filters.experience.length > 0) count++
    if (filters.location.length > 0) count++
    if (filters.rating[0] > 0 || filters.rating[1] < 5) count++
    if (filters.skills.length > 0) count++
    return count
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filters</span>
              {hasActiveFilters() && (
                <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Find specific applications and candidates
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Advanced
              {isExpanded ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, skills, or message..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as FilterState['sortBy'])}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="experience">Most Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium">Application Status</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusOptions.map((status) => (
              <Badge
                key={status.value}
                variant={filters.status.includes(status.value as ApplicationStatus) ? "default" : "outline"}
                className={`cursor-pointer ${
                  filters.status.includes(status.value as ApplicationStatus) ? status.color : ''
                }`}
                onClick={() => toggleStatus(status.value as ApplicationStatus)}
              >
                {status.label}
                {filters.status.includes(status.value as ApplicationStatus) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <Separator />
            
            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium">Application Date</Label>
              <div className="flex space-x-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={(range) => updateFilter('dateRange', range)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {filters.dateRange && (
                  <Button variant="ghost" size="sm" onClick={() => updateFilter('dateRange', undefined)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex space-x-1 mt-2">
                {quickDateFilters.map((filter) => (
                  <Button
                    key={filter.label}
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('dateRange', filter.getValue())}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <Label className="text-sm font-medium">Experience Level</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {experienceLevels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={filters.experience.includes(level)}
                      onCheckedChange={() => toggleExperience(level)}
                    />
                    <Label htmlFor={level} className="text-sm">{level}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            {uniqueLocations.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueLocations.map((location) => (
                    <Badge
                      key={location}
                      variant={filters.location.includes(location) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLocation(location)}
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      {location}
                      {filters.location.includes(location) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Range */}
            <div>
              <Label className="text-sm font-medium">
                Rating: {filters.rating[0]} - {filters.rating[1]} stars
              </Label>
              <div className="flex items-center space-x-4 mt-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <div className="flex space-x-2">
                  <Select 
                    value={filters.rating[0].toString()} 
                    onValueChange={(value) => updateFilter('rating', [parseInt(value), filters.rating[1]])}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map(val => (
                        <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">to</span>
                  <Select 
                    value={filters.rating[1].toString()} 
                    onValueChange={(value) => updateFilter('rating', [filters.rating[0], parseInt(value)])}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map(val => (
                        <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Star className="h-4 w-4 text-yellow-400" />
              </div>
            </div>

            {/* Skills */}
            {uniqueSkills.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {uniqueSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={filters.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                      {filters.skills.includes(skill) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
              </p>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
