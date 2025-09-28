'use client'

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CitiesFilter } from "@/components/filters/cities-filter"
import { CategoriesFilter } from "@/components/filters/categories-filter"
import { Search, ChevronDown, Filter } from "lucide-react"
import { useFilterStore } from "@/stores/filter-store"
import { useTranslations } from "next-intl"

interface JobFiltersProps {
  // Optional props for cases where you want to override the default Zustand behavior
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  cityFilter?: string
  setCityFilter?: (value: string) => void
  categoryFilter?: string
  setCategoryFilter?: (value: string) => void
  typeFilter?: string
  setTypeFilter?: (value: string) => void
  subcategoryFilter?: string
  setSubcategoryFilter?: (value: string) => void
}

export function JobFilters({
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  cityFilter: externalCityFilter,
  setCityFilter: externalSetCityFilter,
  categoryFilter: externalCategoryFilter,
  setCategoryFilter: externalSetCategoryFilter,
  typeFilter: externalTypeFilter,
  setTypeFilter: externalSetTypeFilter,
  subcategoryFilter: externalSubcategoryFilter,
  setSubcategoryFilter: externalSetSubcategoryFilter
}: JobFiltersProps) {
  const t = useTranslations('jobs.filters')
  const {
    jobSearch,
    jobCityFilter,
    jobCategoryFilter,
    jobSubcategoryFilter,
    jobTypeFilter,
    isFiltersOpen,
    setJobSearch,
    setJobCityFilter,
    setJobCategoryFilter,
    setJobSubcategoryFilter,
    setJobTypeFilter,
    toggleFilters,
    hasActiveJobFilters
  } = useFilterStore()

  // Use external props if provided, otherwise use Zustand store
  const searchTerm = externalSearchTerm ?? jobSearch
  const setSearchTerm = externalSetSearchTerm ?? setJobSearch
  const cityFilter = externalCityFilter ?? jobCityFilter
  const setCityFilter = externalSetCityFilter ?? setJobCityFilter
  const categoryFilter = externalCategoryFilter ?? jobCategoryFilter
  const setCategoryFilter = externalSetCategoryFilter ?? setJobCategoryFilter
  const typeFilter = externalTypeFilter ?? jobTypeFilter
  const setTypeFilter = externalSetTypeFilter ?? setJobTypeFilter
  const subcategoryFilter = externalSubcategoryFilter ?? jobSubcategoryFilter
  const setSubcategoryFilter = externalSetSubcategoryFilter ?? setJobSubcategoryFilter

  return (
    <div className="bg-card rounded-[calc(var(--radius)*1.5)] p-6 shadow-sm border-border/40">
      {/* Collapsible Filters with Search Included */}
      <div className="flex flex-col gap-4">
        <Collapsible open={isFiltersOpen} onOpenChange={toggleFilters}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-border/50"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{t('filters') || 'Filters'}</span>
                {hasActiveJobFilters() && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {t('active') || 'Active'}
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative sm:flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder={t('searchPlaceholder') || "Search jobs, companies, skills, or categories..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border/50"
                />
              </div>
              
              {/* Other Filters */}
              <CitiesFilter
                value={cityFilter}
                onChange={setCityFilter}
                placeholder={t('allLocations') || "All locations"}
                className="sm:w-64"
              />
              
              <CategoriesFilter
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder={t('allCategories') || "All categories"}
                className="sm:w-64"
                showSubcategories={true}
                subcategoryValue={subcategoryFilter}
                onSubcategoryChange={setSubcategoryFilter}
                stackOnMobile={true}
              />
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="sm:w-48 border-border/50">
                  <SelectValue placeholder={t('jobType') || "Job Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="quick-job">{t('quickJob')}</SelectItem>
                  <SelectItem value="full-time">{t('fullTime')}</SelectItem>
                  <SelectItem value="part-time">{t('partTime')}</SelectItem>
                  <SelectItem value="remote">{t('remote')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
