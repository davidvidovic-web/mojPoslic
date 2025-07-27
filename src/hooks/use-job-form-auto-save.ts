'use client'

import { useCallback, useEffect, useRef } from 'react'
import { CreateJobData } from '@/types/job'
import { toast } from 'sonner'

const FORM_STORAGE_KEY = 'job-form-draft'
const AUTO_SAVE_INTERVAL = 2000 // Auto-save every 2 seconds
const SHOW_RESTORE_TOAST_KEY = 'job-form-show-restore-toast'

interface UseJobFormAutoSaveOptions {
  formData: CreateJobData
  onRestore?: (data: CreateJobData) => void
  enabled?: boolean
}

export function useJobFormAutoSave({ 
  formData, 
  onRestore, 
  enabled = true 
}: UseJobFormAutoSaveOptions) {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')
  const hasShownRestoreToastRef = useRef(false)

  // Check if form data is meaningful (has some content)
  const isFormDataMeaningful = useCallback((data: CreateJobData): boolean => {
    return !!(
      data.title?.trim() ||
      data.description?.trim() ||
      data.requirements?.trim() ||
      data.benefits?.trim() ||
      data.city_id ||
      data.category_id ||
      data.website?.trim() ||
      data.email?.trim() ||
      data.contact_email?.trim() ||
      data.application_url?.trim() ||
      data.job_address?.trim() ||
      data.salaryMin ||
      data.salaryMax
    )
  }, [])

  // Load saved form data from localStorage
  const loadSavedFormData = useCallback((): CreateJobData | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY)
      if (!saved) return null

      const parsedData = JSON.parse(saved) as CreateJobData
      
      // Check if saved data is meaningful
      if (!isFormDataMeaningful(parsedData)) {
        localStorage.removeItem(FORM_STORAGE_KEY)
        return null
      }

      return parsedData
    } catch (error) {
      console.error('Error loading saved form data:', error)
      localStorage.removeItem(FORM_STORAGE_KEY)
      return null
    }
  }, [isFormDataMeaningful])

  // Save form data to localStorage
  const saveFormData = useCallback((data: CreateJobData) => {
    if (typeof window === 'undefined' || !enabled) return

    try {
      // Only save if data is meaningful
      if (isFormDataMeaningful(data)) {
        const dataString = JSON.stringify(data)
        
        // Only save if data has actually changed
        if (dataString !== lastSavedDataRef.current) {
          localStorage.setItem(FORM_STORAGE_KEY, dataString)
          localStorage.setItem(`${FORM_STORAGE_KEY}_timestamp`, Date.now().toString())
          lastSavedDataRef.current = dataString
        }
      } else {
        // Clear storage if data is not meaningful
        localStorage.removeItem(FORM_STORAGE_KEY)
        localStorage.removeItem(`${FORM_STORAGE_KEY}_timestamp`)
        lastSavedDataRef.current = ''
      }
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }, [enabled, isFormDataMeaningful])

  // Clear saved form data
  const clearSavedFormData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(FORM_STORAGE_KEY)
      localStorage.removeItem(`${FORM_STORAGE_KEY}_timestamp`)
      localStorage.removeItem(SHOW_RESTORE_TOAST_KEY)
      lastSavedDataRef.current = ''
    } catch (error) {
      console.error('Error clearing saved form data:', error)
    }
  }, [])

  // Get last save timestamp
  const getLastSaveTimestamp = useCallback((): number | null => {
    if (typeof window === 'undefined') return null

    try {
      const timestamp = localStorage.getItem(`${FORM_STORAGE_KEY}_timestamp`)
      return timestamp ? parseInt(timestamp, 10) : null
    } catch (error) {
      return null
    }
  }, [])

  // Show restore toast if there's saved data
  const showRestoreToastIfNeeded = useCallback(() => {
    if (typeof window === 'undefined' || hasShownRestoreToastRef.current) return

    const savedData = loadSavedFormData()
    const shouldShowToast = localStorage.getItem(SHOW_RESTORE_TOAST_KEY) !== 'false'
    
    if (savedData && shouldShowToast && onRestore) {
      const timestamp = getLastSaveTimestamp()
      const lastSaveDate = timestamp ? new Date(timestamp) : null
      
      hasShownRestoreToastRef.current = true

      toast('Drafted job post found', {
        description: lastSaveDate 
          ? `Last saved ${lastSaveDate.toLocaleString()}`
          : 'Would you like to restore your previous work?',
        action: {
          label: 'Restore',
          onClick: () => {
            onRestore(savedData)
            localStorage.setItem(SHOW_RESTORE_TOAST_KEY, 'false')
          },
        },
        cancel: {
          label: 'Dismiss',
          onClick: () => {
            localStorage.setItem(SHOW_RESTORE_TOAST_KEY, 'false')
          },
        },
        duration: 10000, // Show for 10 seconds
      })
    }
  }, [loadSavedFormData, getLastSaveTimestamp, onRestore])

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set up new auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      saveFormData(formData)
    }, AUTO_SAVE_INTERVAL)

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, enabled, saveFormData])

  // Show restore toast on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      showRestoreToastIfNeeded()
    }, 1000) // Delay to avoid showing immediately

    return () => clearTimeout(timer)
  }, [showRestoreToastIfNeeded])

  // Manual save function
  const saveNow = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    saveFormData(formData)
  }, [formData, saveFormData])

  // Check if there's saved data available
  const hasSavedData = useCallback((): boolean => {
    return !!loadSavedFormData()
  }, [loadSavedFormData])

  return {
    saveNow,
    clearSavedFormData,
    loadSavedFormData,
    hasSavedData,
    getLastSaveTimestamp,
    isFormDataMeaningful: isFormDataMeaningful(formData)
  }
}
