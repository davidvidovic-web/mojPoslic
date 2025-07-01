'use client'

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CitiesFilter } from "@/components/cities-filter"
import { CategoriesFilter } from "@/components/categories-filter"
import { Search } from "lucide-react"

interface JobFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  cityFilter: string
  setCityFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
}

export function JobFilters({
  searchTerm,
  setSearchTerm,
  cityFilter,
  setCityFilter,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter
}: JobFiltersProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border-border/40">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
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
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="quick-job">Quick Job</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
