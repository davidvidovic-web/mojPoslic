import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
  // Job filters
  jobSearch: string
  jobCityFilter: string
  jobCategoryFilter: string
  jobSubcategoryFilter: string
  jobTypeFilter: string
  isFiltersOpen: boolean
  
  // Admin filters
  userSearchTerm: string
  userRoleFilter: string
  jobSearchTerm: string
  transactionSearchTerm: string
  statusFilter: string
  actionFilter: string
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // View preferences
  viewMode: 'grid' | 'list'
  sortBy: string
  sortOrder: 'asc' | 'desc'
  
  // Actions - Job filters
  setJobSearch: (search: string) => void
  setJobCityFilter: (city: string) => void
  setJobCategoryFilter: (category: string) => void
  setJobSubcategoryFilter: (subcategory: string) => void
  setJobTypeFilter: (type: string) => void
  toggleFilters: () => void
  clearJobFilters: () => void
  
  // Actions - Admin filters
  setUserSearchTerm: (term: string) => void
  setUserRoleFilter: (role: string) => void
  setJobSearchTerm: (term: string) => void
  setTransactionSearchTerm: (term: string) => void
  setStatusFilter: (status: string) => void
  setActionFilter: (action: string) => void
  
  // Actions - Pagination & View
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSorting: (sortBy: string, order: 'asc' | 'desc') => void
  resetPagination: () => void
  
  // Computed getters
  hasActiveJobFilters: () => boolean
  hasActiveAdminFilters: () => boolean
  getJobFiltersCount: () => number
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state - Job filters
      jobSearch: '',
      jobCityFilter: 'all',
      jobCategoryFilter: 'all',
      jobSubcategoryFilter: 'all',
      jobTypeFilter: 'all',
      isFiltersOpen: false,
      
      // Initial state - Admin filters
      userSearchTerm: '',
      userRoleFilter: 'all',
      jobSearchTerm: '',
      transactionSearchTerm: '',
      statusFilter: 'all',
      actionFilter: 'all',
      
      // Initial state - Pagination & View
      currentPage: 1,
      itemsPerPage: 12,
      viewMode: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      
      // Job filter actions
      setJobSearch: (search) => set({ jobSearch: search, currentPage: 1 }),
      setJobCityFilter: (city) => set({ jobCityFilter: city, currentPage: 1 }),
      setJobCategoryFilter: (category) => set({ 
        jobCategoryFilter: category, 
        // Don't reset subcategory - allow independent filtering
        currentPage: 1 
      }),
      setJobSubcategoryFilter: (subcategory) => set({ 
        jobSubcategoryFilter: subcategory, 
        currentPage: 1 
      }),
      setJobTypeFilter: (type) => set({ jobTypeFilter: type, currentPage: 1 }),
      toggleFilters: () => set(state => ({ isFiltersOpen: !state.isFiltersOpen })),
      
      clearJobFilters: () => set({
        jobSearch: '',
        jobCityFilter: 'all',
        jobCategoryFilter: 'all',
        jobSubcategoryFilter: 'all',
        jobTypeFilter: 'all',
        currentPage: 1,
      }),
      
      // Admin filter actions
      setUserSearchTerm: (term) => set({ userSearchTerm: term, currentPage: 1 }),
      setUserRoleFilter: (role) => set({ userRoleFilter: role, currentPage: 1 }),
      setJobSearchTerm: (term) => set({ jobSearchTerm: term, currentPage: 1 }),
      setTransactionSearchTerm: (term) => set({ transactionSearchTerm: term, currentPage: 1 }),
      setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
      setActionFilter: (action) => set({ actionFilter: action, currentPage: 1 }),
      
      // Pagination & View actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSorting: (sortBy, order) => set({ sortBy, sortOrder: order, currentPage: 1 }),
      resetPagination: () => set({ currentPage: 1 }),
      
      // Computed getters
      hasActiveJobFilters: () => {
        const state = get()
        return state.jobSearch !== '' || 
               state.jobCityFilter !== 'all' || 
               state.jobCategoryFilter !== 'all' || 
               state.jobSubcategoryFilter !== 'all' || 
               state.jobTypeFilter !== 'all'
      },
      
      hasActiveAdminFilters: () => {
        const state = get()
        return state.userSearchTerm !== '' || 
               state.userRoleFilter !== 'all' || 
               state.jobSearchTerm !== '' || 
               state.transactionSearchTerm !== '' || 
               state.statusFilter !== 'all' || 
               state.actionFilter !== 'all'
      },
      
      getJobFiltersCount: () => {
        const state = get()
        let count = 0
        if (state.jobSearch !== '') count++
        if (state.jobCityFilter !== 'all') count++
        if (state.jobCategoryFilter !== 'all') count++
        if (state.jobSubcategoryFilter !== 'all') count++
        if (state.jobTypeFilter !== 'all') count++
        return count
      },
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({
        // Persist user preferences
        itemsPerPage: state.itemsPerPage,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        isFiltersOpen: state.isFiltersOpen,
      })
    }
  )
)
