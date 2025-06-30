import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { JobFormBase } from '../job-form-base'
import { CreateJobData } from '@/types/job'

// Mock the dependencies
vi.mock('@/contexts/prisma-auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'employer'
    }
  })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('JobFormBase', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders correctly in create mode', () => {
    render(
      <JobFormBase
        onSubmit={mockOnSubmit}
        submitButtonText="Create Job"
        submittingText="Creating..."
      />
    )
    
    expect(screen.getByText('Basic Details')).toBeInTheDocument()
    expect(screen.getByText('Create Job')).toBeInTheDocument()
    expect(screen.queryByText('Edit Mode')).not.toBeInTheDocument()
  })

  it('renders correctly in edit mode', () => {
    render(
      <JobFormBase
        isEditMode={true}
        onSubmit={mockOnSubmit}
        submitButtonText="Update Job"
        submittingText="Updating..."
      />
    )
    
    expect(screen.getByText('Edit Mode')).toBeInTheDocument()
    expect(screen.getByText('Update Job')).toBeInTheDocument()
  })

  it('shows cancel button when onCancel is provided', () => {
    render(
      <JobFormBase
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitButtonText="Submit"
        submittingText="Submitting..."
      />
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <JobFormBase
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitButtonText="Submit"
        submittingText="Submitting..."
      />
    )
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('allows free navigation in edit mode', () => {
    render(
      <JobFormBase
        isEditMode={true}
        onSubmit={mockOnSubmit}
        submitButtonText="Update"
        submittingText="Updating..."
      />
    )
    
    // Should be able to click any step in edit mode
    const locationStep = screen.getByText('Location & Compensation')
    fireEvent.click(locationStep)
    
    // Should navigate without validation
    expect(screen.getByText('Location & Compensation')).toBeInTheDocument()
  })

  it('restricts navigation in create mode', () => {
    render(
      <JobFormBase
        isEditMode={false}
        onSubmit={mockOnSubmit}
        submitButtonText="Create"
        submittingText="Creating..."
      />
    )
    
    // Next button should be disabled when current step is invalid
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('displays initial data correctly', () => {
    const initialData: Partial<CreateJobData> = {
      title: 'Test Job',
      company: 'Test Company',
      description: 'Test Description'
    }

    render(
      <JobFormBase
        initialData={initialData}
        onSubmit={mockOnSubmit}
        submitButtonText="Submit"
        submittingText="Submitting..."
      />
    )
    
    expect(screen.getByDisplayValue('Test Job')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('shows submitting state correctly', async () => {
    const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(
      <JobFormBase
        onSubmit={slowSubmit}
        submitButtonText="Submit"
        submittingText="Submitting..."
      />
    )
    
    // Navigate to review and submit
    fireEvent.click(screen.getByText('Submit'))
    
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })

  it('validates form data before submission', async () => {
    const { toast } = await import('sonner')
    
    render(
      <JobFormBase
        onSubmit={mockOnSubmit}
        submitButtonText="Submit"
        submittingText="Submitting..."
      />
    )
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Submit'))
    
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Please fill in the following required fields')
    )
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with correct data when validation passes', async () => {
    const initialData: CreateJobData = {
      title: 'Test Job',
      company: 'Test Company',
      description: 'Test Description',
      requirements: 'Test Requirements',
      benefits: 'Test Benefits',
      type: 'full_time',
      city_id: 'city-1',
      category_id: 'category-1',
      salary: '1000 BAM',
      salaryType: 'monthly',
      salaryMin: 1000,
      salaryMax: 2000,
      website: 'https://example.com',
      email: 'test@example.com',
      start_date: '2024-01-01',
      job_address: '123 Main St',
      job_latitude: 43.8563,
      job_longitude: 18.4131,
      application_url: 'https://example.com/apply',
      contact_email: 'test@example.com'
    }

    render(
      <JobFormBase
        initialData={initialData}
        onSubmit={mockOnSubmit}
        submitButtonText="Submit"
        submittingText="Submitting..."
      />
    )
    
    // Navigate to review and submit
    fireEvent.click(screen.getByText('Submit'))
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test Description'
      })
    )
  })
})
