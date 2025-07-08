import { create } from 'zustand'
import { Job } from '@/types/job'

interface DialogState {
  // Dialog states
  isJobPostDialogOpen: boolean
  isEditJobDialogOpen: boolean
  isDeleteConfirmOpen: boolean
  isMobileMenuOpen: boolean
  isMessagingDialogOpen: boolean
  isConnectionPurchaseOpen: boolean
  
  // Data for dialogs
  editingJob: Job | null
  deletingJobId: string | null
  
  // Actions
  openJobPostDialog: () => void
  closeJobPostDialog: () => void
  openEditJobDialog: (job: Job) => void
  closeEditJobDialog: () => void
  openDeleteConfirm: (jobId: string) => void
  closeDeleteConfirm: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  openMessagingDialog: () => void
  closeMessagingDialog: () => void
  openConnectionPurchase: () => void
  closeConnectionPurchase: () => void
  
  // Bulk actions
  closeAllDialogs: () => void
}

export const useDialogStore = create<DialogState>((set) => ({
  // Initial state
  isJobPostDialogOpen: false,
  isEditJobDialogOpen: false,
  isDeleteConfirmOpen: false,
  isMobileMenuOpen: false,
  isMessagingDialogOpen: false,
  isConnectionPurchaseOpen: false,
  editingJob: null,
  deletingJobId: null,
  
  // Job posting dialog
  openJobPostDialog: () => set({ isJobPostDialogOpen: true }),
  closeJobPostDialog: () => set({ isJobPostDialogOpen: false }),
  
  // Edit job dialog
  openEditJobDialog: (job) => set({ 
    isEditJobDialogOpen: true, 
    editingJob: job 
  }),
  closeEditJobDialog: () => set({ 
    isEditJobDialogOpen: false, 
    editingJob: null 
  }),
  
  // Delete confirmation
  openDeleteConfirm: (jobId) => set({ 
    isDeleteConfirmOpen: true, 
    deletingJobId: jobId 
  }),
  closeDeleteConfirm: () => set({ 
    isDeleteConfirmOpen: false, 
    deletingJobId: null 
  }),
  
  // Mobile menu
  toggleMobileMenu: () => set(state => ({ 
    isMobileMenuOpen: !state.isMobileMenuOpen 
  })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  // Messaging dialog
  openMessagingDialog: () => set({ isMessagingDialogOpen: true }),
  closeMessagingDialog: () => set({ isMessagingDialogOpen: false }),
  
  // Connection purchase
  openConnectionPurchase: () => set({ isConnectionPurchaseOpen: true }),
  closeConnectionPurchase: () => set({ isConnectionPurchaseOpen: false }),
  
  // Bulk close
  closeAllDialogs: () => set({
    isJobPostDialogOpen: false,
    isEditJobDialogOpen: false,
    isDeleteConfirmOpen: false,
    isMobileMenuOpen: false,
    isMessagingDialogOpen: false,
    isConnectionPurchaseOpen: false,
    editingJob: null,
    deletingJobId: null,
  }),
}))
