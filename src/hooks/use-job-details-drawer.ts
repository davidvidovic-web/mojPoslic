import { create } from 'zustand'

interface JobDetailsDrawerState {
  isOpen: boolean
  jobId: string | null
  openDrawer: (jobId: string) => void
  closeDrawer: () => void
}

export const useJobDetailsDrawer = create<JobDetailsDrawerState>((set) => ({
  isOpen: false,
  jobId: null,
  openDrawer: (jobId) => set({ isOpen: true, jobId }),
  closeDrawer: () => set({ isOpen: false, jobId: null }),
}))