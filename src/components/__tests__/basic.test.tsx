/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MultiStepJobForm } from '@/components/job-post-form/multi-step-job-form'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client'
    }
  })
}))

// Mock fetch API
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

// Mock location picker component to avoid map dependencies
jest.mock('@/components/ui/location-picker', () => ({
  LocationPicker: ({ onChange, value }: { onChange?: (location: { address: string; latitude: number; longitude: number }) => void; value?: { address: string; latitude: number; longitude: number } }) => (
    <input
      data-testid="location-picker"
      value={value?.address || ''}
      onChange={(e) => onChange?.({ 
        address: e.target.value, 
        latitude: 0, 
        longitude: 0 
      })}
    />
  )
}))

// Mock date time picker
jest.mock('@/components/ui/date-time-picker', () => ({
  DateTimePicker: ({ onChange, value }: { onChange?: (date: Date) => void; value?: Date }) => (
    <input
      data-testid="date-time-picker"
      type="datetime-local"
      value={value ? value.toISOString().slice(0, 16) : ''}
      onChange={(e) => onChange?.(new Date(e.target.value))}
    />
  )
}))

// Mock cities filter
jest.mock('@/components/cities-filter', () => ({
  CitiesFilter: ({ onChange, value }: { onChange?: (value: string) => void; value?: string }) => (
    <select
      data-testid="cities-filter"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">Select a city</option>
      <option value="city-1">Sarajevo</option>
    </select>
  )
}))

// Mock API responses
const mockCategories = {
  categories: [
    {
      id: 'cat-1',
      key: 'technology',
      nameEN: 'Technology',
      nameBS: 'Tehnologija',
      isPopular: true,
      children: [
        {
          id: 'subcat-1',
          key: 'web-development',
          nameEN: 'Web Development',
          nameBS: 'Web Development',
          isPopular: true
        }
      ]
    }
  ]
}

const mockCities = {
  cities: [
    {
      id: 'city-1',
      key: 'sarajevo',
      nameEN: 'Sarajevo',
      nameBS: 'Sarajevo'
    }
  ]
}

describe('MultiStepJobForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
    
    // Mock API calls
    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories)
        })
      }
      if (url.includes('/api/cities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCities)
        })
      }
      if (url.includes('/api/jobs/create')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'new-job-id' })
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('should render the multi-step job form', async () => {
    render(<MultiStepJobForm />)
    
    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeDefined()
      expect(screen.getByDisplayValue('')).toBeDefined() // Job title input
    })
  })

  it('should show step progress', async () => {
    render(<MultiStepJobForm />)
    
    await waitFor(() => {
      expect(screen.getByText('Step 1 of 6')).toBeDefined()
    })
  })

  it('should have navigation buttons', async () => {
    render(<MultiStepJobForm />)
    
    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeDefined()
      expect(screen.getByText('Next')).toBeDefined()
    })
  })

  it('should render without crashing', () => {
    render(<MultiStepJobForm />)
    expect(true).toBe(true)
  })
})
