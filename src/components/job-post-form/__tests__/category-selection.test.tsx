import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BasicDetailsStep } from '../basic-details-step'
import { CreateJobData } from '@/types/job'

// Mock the dependencies
vi.mock('@/components/ui/input', () => ({
  Input: ({ id, placeholder, value, onChange, className, ...props }: any) => (
    <input
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  )
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      <div onClick={() => onValueChange && onValueChange('test-category-1')}>
        {children}
      </div>
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  )
}))

vi.mock('@/components/cities-filter', () => ({
  CitiesFilter: ({ value, onChange }: any) => (
    <select
      data-testid="cities-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select a city</option>
      <option value="city-1">Test City</option>
    </select>
  )
}))

// Mock fetch for categories
global.fetch = vi.fn()

const mockCategories = [
  {
    id: 'parent-1',
    key: 'parent-category',
    nameEN: 'Parent Category',
    nameBS: 'Parent Category BS',
    isPopular: true,
    children: [
      {
        id: 'child-1',
        key: 'child-category',
        nameEN: 'Child Category',
        nameBS: 'Child Category BS',
        isPopular: false
      }
    ]
  },
  {
    id: 'parent-2',
    key: 'parent-no-children',
    nameEN: 'Parent Without Children',
    nameBS: 'Parent Without Children BS',
    isPopular: false,
    children: []
  }
]

describe('BasicInfoStep - Category Selection', () => {
  const mockOnChange = vi.fn()
  const mockOnValidation = vi.fn()
  
  const defaultFormData: CreateJobData = {
    title: '',
    company: '',
    description: '',
    requirements: '',
    benefits: '',
    type: 'quick_job',
    city_id: '',
    category_id: '',
    salary: '',
    salaryType: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
    website: '',
    email: '',
    contact_email: '',
    application_url: '',
    start_date: undefined,
    job_address: undefined,
    job_latitude: undefined,
    job_longitude: undefined
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ categories: mockCategories })
    })
  })

  it('validates as valid when only parent category is selected', async () => {
    const formData = {
      ...defaultFormData,
      title: 'Test Job',
      company: 'Test Company',
      city_id: 'city-1',
      category_id: 'parent-1'
    }

    render(
      <BasicDetailsStep
        formData={formData}
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/categories')
    })

    // Should call onValidation with true since all required fields are filled
    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(true)
    })
  })

  it('sets parent category as category_id when parent is selected', async () => {
    render(
      <BasicDetailsStep
        formData={defaultFormData}
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/categories')
    })

    // Find and click the category select (mocked to select 'test-category-1')
    const categorySelect = screen.getByTestId('select')
    fireEvent.click(categorySelect)

    // Should call onChange with the parent category ID
    expect(mockOnChange).toHaveBeenCalledWith({ category_id: 'test-category-1' })
  })

  it('requires only parent category for validation', async () => {
    const incompleteFormData = {
      ...defaultFormData,
      title: 'Test Job',
      company: 'Test Company',
      city_id: 'city-1'
      // No category_id set
    }

    render(
      <BasicDetailsStep
        formData={incompleteFormData}
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    )

    // Should validate as false since no parent category is selected
    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(false)
    })
  })
})
