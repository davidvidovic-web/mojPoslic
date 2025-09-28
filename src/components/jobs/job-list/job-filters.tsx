'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CitiesFilter } from "@/components/filters/cities-filter"
import { CategoriesFilter } from "@/components/filters/categories-filter"
import { Search, ChevronDown, Filter } from "lucide-react"
import { useTranslations } from 'next-intl'

interface JobFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  cityFilter: string
  setCityFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  subcategoryFilter?: string
  setSubcategoryFilter?: (value: string) => void
}

export function JobFilters({
  searchTerm,
  setSearchTerm,
  cityFilter,
  setCityFilter,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  subcategoryFilter,
  setSubcategoryFilter
}: JobFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const t = useTranslations('jobs.filters')

  const hasActiveFilters = cityFilter !== "all" || 
                          categoryFilter !== "all" || 
                          typeFilter !== "all" ||
                          (subcategoryFilter && subcategoryFilter !== "all")

  return (
    <div className="bg-card rounded-[calc(var(--radius)*1.5)] p-6 shadow-sm border-border/40">
      {/* Desktop Layout - All Inline */}
      <div className="hidden lg:block">
        <div className="flex gap-4 items-center">
          {/* Search Bar */}
          <div className="flex-1 relative min-w-0">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border/50"
            />
          </div>

          {/* Filters */}
          <CitiesFilter
            value={cityFilter}
            onChange={setCityFilter}
            placeholder={t('allLocations')}
            className="w-52 flex-shrink-0"
          />
          
          <CategoriesFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder={t('allCategories')}
            className="w-52 flex-shrink-0"
            showSubcategories={true}
            subcategoryValue={subcategoryFilter}
            onSubcategoryChange={setSubcategoryFilter}
            stackOnMobile={true}
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 flex-shrink-0 border-border/50">
              <SelectValue placeholder={t('jobType')} />
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
      </div>

      {/* Mobile Layout - Stacked with Search on Top */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border/50"
            />
          </div>

          {/* Collapsible Filters */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between border-border/50"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{t('filters')}</span>
                  {hasActiveFilters && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {t('active')}
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <div className="flex flex-col gap-4">
                <CitiesFilter
                  value={cityFilter}
                  onChange={setCityFilter}
                  placeholder={t('allLocations')}
                  className="w-full"
                />
                
                <CategoriesFilter
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder={t('allCategories')}
                  className="w-full"
                  showSubcategories={true}
                  subcategoryValue={subcategoryFilter}
                  onSubcategoryChange={setSubcategoryFilter}
                  stackOnMobile={true}
                />
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full border-border/50">
                    <SelectValue placeholder={t('jobType')} />
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
    </div>
  )
}
