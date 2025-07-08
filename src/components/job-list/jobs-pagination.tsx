'use client'

import { Pagination } from '@/components/ui/pagination'
import { useFilterStore } from '@/stores/filter-store'

interface JobsPaginationProps {
  totalItems: number
  currentPage?: number
  setCurrentPage?: (page: number) => void
}

export function JobsPagination({ 
  totalItems,
  currentPage: externalCurrentPage,
  setCurrentPage: externalSetCurrentPage
}: JobsPaginationProps) {
  const { 
    currentPage: storePage, 
    itemsPerPage, 
    setCurrentPage: storeSetCurrentPage 
  } = useFilterStore()

  // Use external props if provided, otherwise use from store
  const currentPage = externalCurrentPage ?? storePage
  const setCurrentPage = externalSetCurrentPage ?? storeSetCurrentPage

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      className="mt-8"
    />
  )
}
