import { create } from 'zustand'

// Import the job form step type if it exists, otherwise define it
type JobFormStep = 'basic-info' | 'basic-details' | 'extended-details' | 'review'

interface FormStateStore {
  // Multi-step form state
  currentStep: JobFormStep
  completedSteps: JobFormStep[]
  stepValidations: Record<string, boolean>
  
  // Edit mode tracking
  editMode: boolean
  editingJobId: string | null
  hasUnsavedChanges: boolean
  
  // Form data cache
  formDataCache: Record<string, unknown>
  lastSaveTimestamp: number | null
  
  // Password visibility states
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  
  // Skills/categories selection
  selectedSkills: string[]
  selectedCategories: string[]
  
  // Actions - Step navigation
  setCurrentStep: (step: JobFormStep) => void
  markStepCompleted: (step: JobFormStep) => void
  markStepIncomplete: (step: JobFormStep) => void
  setStepValidation: (step: string, isValid: boolean) => void
  resetSteps: () => void
  
  // Actions - Edit mode
  setEditMode: (enabled: boolean, jobId?: string | null) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Actions - Form cache
  cacheFormData: (stepId: string, data: unknown) => void
  getCachedFormData: (stepId: string) => unknown
  clearFormCache: () => void
  saveFormProgress: () => void
  
  // Actions - Password visibility
  toggleCurrentPasswordVisibility: () => void
  toggleNewPasswordVisibility: () => void
  toggleConfirmPasswordVisibility: () => void
  hideAllPasswords: () => void
  
  // Actions - Selections
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  setSkills: (skills: string[]) => void
  addCategory: (category: string) => void
  removeCategory: (category: string) => void
  setCategories: (categories: string[]) => void
  
  // Computed getters
  canProceedToNext: () => boolean
  getCurrentStepIndex: () => number
  getTotalSteps: () => number
  getCompletionPercentage: () => number
}

export const useFormStateStore = create<FormStateStore>((set, get) => ({
  // Initial state
  currentStep: 'basic-info',
  completedSteps: [],
  stepValidations: {},
  editMode: false,
  editingJobId: null,
  hasUnsavedChanges: false,
  formDataCache: {},
  lastSaveTimestamp: null,
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
  selectedSkills: [],
  selectedCategories: [],
  
  // Step navigation
  setCurrentStep: (step) => set({ currentStep: step }),
  
  markStepCompleted: (step) => set(state => ({
    completedSteps: state.completedSteps.includes(step) 
      ? state.completedSteps 
      : [...state.completedSteps, step]
  })),
  
  markStepIncomplete: (step) => set(state => ({
    completedSteps: state.completedSteps.filter(s => s !== step)
  })),
  
  setStepValidation: (step, isValid) => set(state => ({
    stepValidations: { ...state.stepValidations, [step]: isValid }
  })),
  
  resetSteps: () => set({
    currentStep: 'basic-info',
    completedSteps: [],
    stepValidations: {},
    formDataCache: {},
    hasUnsavedChanges: false,
  }),
  
  // Edit mode
  setEditMode: (enabled, jobId = null) => set({
    editMode: enabled,
    editingJobId: jobId,
    hasUnsavedChanges: false,
  }),
  
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  
  // Form cache
  cacheFormData: (stepId, data) => set(state => ({
    formDataCache: { ...state.formDataCache, [stepId]: data },
    lastSaveTimestamp: Date.now(),
  })),
  
  getCachedFormData: (stepId) => get().formDataCache[stepId] || null,
  
  clearFormCache: () => set({
    formDataCache: {},
    lastSaveTimestamp: null,
  }),
  
  saveFormProgress: () => set({ lastSaveTimestamp: Date.now() }),
  
  // Password visibility
  toggleCurrentPasswordVisibility: () => set(state => ({
    showCurrentPassword: !state.showCurrentPassword
  })),
  
  toggleNewPasswordVisibility: () => set(state => ({
    showNewPassword: !state.showNewPassword
  })),
  
  toggleConfirmPasswordVisibility: () => set(state => ({
    showConfirmPassword: !state.showConfirmPassword
  })),
  
  hideAllPasswords: () => set({
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  }),
  
  // Selections
  addSkill: (skill) => set(state => ({
    selectedSkills: state.selectedSkills.includes(skill)
      ? state.selectedSkills
      : [...state.selectedSkills, skill]
  })),
  
  removeSkill: (skill) => set(state => ({
    selectedSkills: state.selectedSkills.filter(s => s !== skill)
  })),
  
  setSkills: (skills) => set({ selectedSkills: skills }),
  
  addCategory: (category) => set(state => ({
    selectedCategories: state.selectedCategories.includes(category)
      ? state.selectedCategories
      : [...state.selectedCategories, category]
  })),
  
  removeCategory: (category) => set(state => ({
    selectedCategories: state.selectedCategories.filter(c => c !== category)
  })),
  
  setCategories: (categories) => set({ selectedCategories: categories }),
  
  // Computed getters
  canProceedToNext: () => {
    const state = get()
    const currentStepValid = state.stepValidations[state.currentStep]
    return currentStepValid !== false // Allow if not explicitly false
  },
  
  getCurrentStepIndex: () => {
    const steps: JobFormStep[] = ['basic-info', 'basic-details', 'extended-details', 'review']
    return steps.indexOf(get().currentStep)
  },
  
  getTotalSteps: () => 4,
  
  getCompletionPercentage: () => {
    const state = get()
    const totalSteps = state.getTotalSteps()
    const completedCount = state.completedSteps.length
    return Math.round((completedCount / totalSteps) * 100)
  },
}))
