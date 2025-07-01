# Refactoring Techniques Reference

## Overview

This document details the specific refactoring techniques and patterns used during the component refactoring project. It serves as a reference for future refactoring efforts and helps maintain consistency in approach.

---

## 🔧 Core Refactoring Techniques

### 1. Extract Component Technique

**When to Use**: When a component has multiple distinct UI sections

**Before**:
```tsx
function LargeDashboard() {
  return (
    <div>
      {/* 50 lines of stats cards */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>Users</h3>
          <p>{userCount}</p>
        </div>
        {/* More stats cards... */}
      </div>
      
      {/* 100 lines of user management */}
      <div className="user-management">
        <Table>
          {/* Complex table logic */}
        </Table>
      </div>
      
      {/* 80 lines of job management */}
      <div className="job-management">
        {/* Complex job logic */}
      </div>
    </div>
  )
}
```

**After**:
```tsx
// Main component - clean and focused
function Dashboard() {
  return (
    <div>
      <StatsCards stats={stats} />
      <Tabs>
        <UserManagementTab users={users} />
        <JobManagementTab jobs={jobs} />
      </Tabs>
    </div>
  )
}

// Extracted components
function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="stats-section">
      <StatCard title="Users" value={stats.userCount} />
      <StatCard title="Jobs" value={stats.jobCount} />
    </div>
  )
}
```

**Benefits**:
- Clear separation of concerns
- Reusable components
- Easier testing
- Better code organization

---

### 2. Extract Hook Technique

**When to Use**: When state management becomes complex

**Before**:
```tsx
function ComplexForm() {
  const [formData, setFormData] = useState({...})
  const [validations, setValidations] = useState({...})
  const [currentStep, setCurrentStep] = useState('step1')
  const [completedSteps, setCompletedSteps] = useState(new Set())
  
  // 50+ lines of state management logic
  const handleStepValidation = (step, isValid) => {
    setValidations(prev => ({ ...prev, [step]: isValid }))
    if (isValid && !completedSteps.has(step)) {
      setCompletedSteps(prev => new Set([...prev, step]))
    }
  }
  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Complex validation logic...
  }
  
  // More state logic...
  
  return <form>{/* UI */}</form>
}
```

**After**:
```tsx
// Extracted hook
function useFormState(initialData) {
  const [formData, setFormData] = useState(initialData)
  const [validations, setValidations] = useState({})
  const [currentStep, setCurrentStep] = useState('step1')
  const [completedSteps, setCompletedSteps] = useState(new Set())
  
  const handleStepValidation = useCallback((step, isValid) => {
    setValidations(prev => ({ ...prev, [step]: isValid }))
    if (isValid && !completedSteps.has(step)) {
      setCompletedSteps(prev => new Set([...prev, step]))
    }
  }, [completedSteps])
  
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  return {
    formData,
    validations,
    currentStep,
    completedSteps,
    handleStepValidation,
    updateFormData,
    setCurrentStep
  }
}

// Clean component
function Form() {
  const {
    formData,
    validations,
    updateFormData,
    handleStepValidation
  } = useFormState(initialData)
  
  return <form>{/* Focus only on UI */}</form>
}
```

**Benefits**:
- Reusable state logic
- Easier to test state behavior
- Cleaner component code
- Better separation of concerns

---

### 3. Extract Utility Technique

**When to Use**: When components contain pure functions or complex calculations

**Before**:
```tsx
function PaymentComponent() {
  // Inline utility functions
  const formatCurrency = (amount, currency) => {
    const formatter = new Intl.NumberFormat('bs-BA', {
      style: 'currency',
      currency: currency || 'BAM'
    })
    return formatter.format(amount)
  }
  
  const calculateTotalWithTax = (amount, taxRate) => {
    return amount * (1 + taxRate / 100)
  }
  
  const validatePaymentAmount = (amount, min, max) => {
    return amount >= min && amount <= max
  }
  
  // Component logic using these functions...
}
```

**After**:
```tsx
// Extracted utilities
// src/lib/payment/formatting.ts
export function formatCurrency(amount: number, currency = 'BAM'): string {
  const formatter = new Intl.NumberFormat('bs-BA', {
    style: 'currency',
    currency
  })
  return formatter.format(amount)
}

// src/lib/payment/calculations.ts
export function calculateTotalWithTax(amount: number, taxRate: number): number {
  return amount * (1 + taxRate / 100)
}

// src/lib/payment/validation.ts
export function validatePaymentAmount(amount: number, min: number, max: number): boolean {
  return amount >= min && amount <= max
}

// Clean component
import { formatCurrency, calculateTotalWithTax, validatePaymentAmount } from '@/lib/payment'

function PaymentComponent() {
  // Component focuses only on UI and component-specific logic
  const total = calculateTotalWithTax(amount, TAX_RATE)
  const formattedTotal = formatCurrency(total)
  const isValid = validatePaymentAmount(amount, MIN_AMOUNT, MAX_AMOUNT)
  
  return <div>{/* UI */}</div>
}
```

**Benefits**:
- Reusable across multiple components
- Easier to unit test
- Centralized business logic
- Better code organization

---

### 4. Module Organization Technique

**When to Use**: When utility files become too large

**Before**:
```tsx
// Large utility file (300+ lines)
// src/lib/location-utils.ts
export function cyrillicToLatin(text) { /* ... */ }
export function latinToCyrillic(text) { /* ... */ }
export function normalizeText(text) { /* ... */ }
export function extractCityFromAddress(address) { /* ... */ }
export function validateLocationInCity(address, city) { /* ... */ }
export function cleanMapAddress(address) { /* ... */ }
// ... many more functions
```

**After**:
```tsx
// Organized into focused modules
// src/lib/location/character-mapping.ts
export function cyrillicToLatin(text: string): string { /* ... */ }
export function latinToCyrillic(text: string): string { /* ... */ }

// src/lib/location/text-normalization.ts
export function normalizeText(text: string): NormalizedText { /* ... */ }

// src/lib/location/city-extraction.ts
export function extractCityFromAddress(address: string): string[] { /* ... */ }

// src/lib/location/validation.ts
export function validateLocationInCity(address: string, city: string): ValidationResult { /* ... */ }
export function cleanMapAddress(address: string): string { /* ... */ }

// src/lib/location/index.ts
export * from './character-mapping'
export * from './text-normalization'
export * from './city-extraction'
export * from './validation'

// Original file for backward compatibility
// src/lib/location-utils.ts
export * from './location'
```

**Benefits**:
- Better code organization
- Easier to locate specific functionality
- More focused modules
- Maintains backward compatibility

---

## 🎯 Refactoring Decision Framework

### Size-Based Decisions

```
Component Size Guide:
├── 0-100 lines    → ✅ Good size, no action needed
├── 100-200 lines  → ⚠️  Monitor, consider extraction if multiple concerns
├── 200-300 lines  → 🟡 Should extract if possible
└── 300+ lines     → 🔴 Must refactor
```

### Complexity-Based Decisions

```
Complexity Indicators:
├── Multiple useState calls (5+)           → Extract hook
├── Multiple useEffect calls (3+)          → Extract hook
├── Long inline functions (20+ lines)      → Extract utility
├── Repeated logic across components       → Extract shared utility
├── Mixed concerns (UI + business logic)   → Extract components
└── Deep nesting (5+ levels)              → Extract components
```

---

## 🛠️ Step-by-Step Refactoring Process

### Phase 1: Analysis
1. **Identify Large Files**:
   ```bash
   find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -nr
   ```

2. **Analyze Component Structure**:
   - Map out logical sections
   - Identify state management complexity  
   - Find reusable utilities
   - Check for repeated patterns

3. **Plan Extraction Points**:
   - UI sections → Extract Components
   - State logic → Extract Hooks
   - Pure functions → Extract Utilities
   - Large data → Extract Constants

### Phase 2: Extraction

1. **Extract Components First**:
   ```tsx
   // Start with clear UI boundaries
   function ExtractedSection(props) {
     return <div>{/* Moved UI */}</div>
   }
   ```

2. **Extract Hooks Second**:
   ```tsx
   // Move state management
   function useExtractedState(initialState) {
     // Moved state logic
     return { state, actions }
   }
   ```

3. **Extract Utilities Last**:
   ```tsx
   // Move pure functions
   export function extractedUtility(input) {
     // Moved calculation/formatting
   }
   ```

### Phase 3: Integration

1. **Update Main Component**:
   ```tsx
   // Import extracted pieces
   import { ExtractedSection } from './extracted-section'
   import { useExtractedState } from './use-extracted-state'
   import { extractedUtility } from '@/lib/utilities'
   
   function MainComponent() {
     const state = useExtractedState()
     return <ExtractedSection {...state} />
   }
   ```

2. **Verify Functionality**:
   - Check TypeScript compilation
   - Test component behavior
   - Verify no broken imports

3. **Update Documentation**:
   - Update component APIs
   - Document new utilities
   - Add usage examples

---

## 🧪 Testing Strategy for Refactored Components

### Component Testing
```tsx
// Test extracted components independently
describe('ExtractedSection', () => {
  it('renders with required props', () => {
    render(<ExtractedSection data={mockData} />)
    expect(screen.getByText('Expected Content')).toBeInTheDocument()
  })
})
```

### Hook Testing
```tsx
// Test extracted hooks
import { renderHook, act } from '@testing-library/react'
import { useExtractedState } from './use-extracted-state'

describe('useExtractedState', () => {
  it('manages state correctly', () => {
    const { result } = renderHook(() => useExtractedState())
    
    act(() => {
      result.current.updateState('new value')
    })
    
    expect(result.current.state).toBe('new value')
  })
})
```

### Utility Testing
```tsx
// Test extracted utilities
import { extractedUtility } from '@/lib/utilities'

describe('extractedUtility', () => {
  it('processes input correctly', () => {
    const result = extractedUtility('input')
    expect(result).toBe('expected output')
  })
})
```

---

## 🚀 Performance Considerations

### Component Memoization
```tsx
// Memoize extracted components when appropriate
export const ExtractedSection = memo(function ExtractedSection(props) {
  return <div>{/* Component content */}</div>
})
```

### Hook Optimization
```tsx
// Use useCallback and useMemo in extracted hooks
function useOptimizedState() {
  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue()
  }, [dependencies])
  
  const stableCallback = useCallback((value) => {
    updateState(value)
  }, [])
  
  return { expensiveValue, stableCallback }
}
```

### Bundle Size Impact
- Extracted components can be tree-shaken
- Shared utilities reduce code duplication
- Lazy loading becomes easier with smaller components

---

## ✅ Refactoring Checklist

### Before Refactoring
- [ ] Analyze component complexity and size
- [ ] Identify logical boundaries
- [ ] Plan extraction strategy
- [ ] Document current behavior
- [ ] Ensure comprehensive test coverage

### During Refactoring
- [ ] Extract one concern at a time
- [ ] Maintain existing APIs when possible
- [ ] Use proper TypeScript typing
- [ ] Update imports and exports
- [ ] Test after each extraction

### After Refactoring
- [ ] Verify no TypeScript errors
- [ ] Check component functionality
- [ ] Update documentation
- [ ] Review file sizes
- [ ] Test performance impact
- [ ] Update related tests

---

*These techniques provide a systematic approach to refactoring large components while maintaining code quality and functionality.*
