import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobEditForm } from '../job-edit-form'
import { CreateJobData } from '@/types/job'

// Mock the dependencies
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'client'
    }
  })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('JobEditForm', () => {
  const mockInitialData: CreateJobData = {
    title: 'Existing Job',
    company: 'Existing Company',
    description: 'Existing Description',
    requirements: 'Existing Requirements',
    benefits: 'Existing Benefits',
    type: 'full_time',
    city_id: 'city-1',
    category_id: 'category-1',
    salary: '1000-2000 BAM',
    salaryType: 'monthly',
    salaryMin: 1000,
    salaryMax: 2000,
    website: 'https://example.com',
    email: 'contact@example.com',
    start_date: '2024-01-01',
    job_address: '123 Main St',
    job_latitude: 43.8563,
    job_longitude: 18.4131,
    application_url: 'https://example.com/apply',
    contact_email: 'contact@example.com'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'job-1' })
    })
  })

  it('renders the edit form correctly', () => {
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
      />
    )
    
    expect(screen.getByText('Edit Mode')).toBeInTheDocument()
    expect(screen.getByText('Update Job Posting')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Job')).toBeInTheDocument()
  })

  it('displays initial data correctly', () => {
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
      />
    )
    
    expect(screen.getByDisplayValue('Existing Job')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument()
  })

  it('allows free navigation between steps in edit mode', () => {
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
      />
    )
    
    // Should be able to click any step
    const locationStep = screen.getByText('Location & Compensation')
    fireEvent.click(locationStep)
    
    // Should navigate without validation
    expect(screen.getByText('Location & Compensation')).toBeInTheDocument()
  })

  it('shows edit mode indicator', () => {
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
      />
    )
    
    expect(screen.getByText('Edit Mode')).toBeInTheDocument()
    expect(screen.getByText(/You can navigate freely between steps/i)).toBeInTheDocument()
  })

  it('calls onJobUpdated when form is submitted successfully', async () => {
    const onJobUpdated = vi.fn()
    
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
        onJobUpdated={onJobUpdated}
      />
    )
    
    // Navigate to review step
    fireEvent.click(screen.getByText('Review'))
    
    // Submit
    fireEvent.click(screen.getByText('Update Job Posting'))
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs/job-1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('Existing Job')
      })
    })

    await waitFor(() => {
      expect(onJobUpdated).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
        onCancel={onCancel}
      />
    )
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows error when API returns error', async () => {
    const { toast } = await import('sonner')
    
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Job update failed' })
    })

    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
      />
    )
    
    // Navigate to review and submit
    fireEvent.click(screen.getByText('Review'))
    fireEvent.click(screen.getByText('Update Job Posting'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Job update failed')
    })
  })

  it('validates required fields on submit but allows navigation', async () => {
    const { toast } = await import('sonner')
    
    const incompleteData = { ...mockInitialData, title: '' }
    
    render(
      <JobEditForm
        jobId="job-1"
        initialData={incompleteData}
      />
    )
    
    // Should be able to navigate freely
    fireEvent.click(screen.getByText('Review'))
    
    // But validation should occur on submit
    fireEvent.click(screen.getByText('Update Job Posting'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Job Title')
      )
    })
  })

  it('enables submit button even with validation issues in edit mode', () => {
    const incompleteData = { ...mockInitialData, title: '' }
    
    render(
      <JobEditForm
        jobId="job-1"
        initialData={incompleteData}
      />
    )
    
    // Navigate to review
    fireEvent.click(screen.getByText('Review'))
    
    // Submit button should be enabled in edit mode
    const submitButton = screen.getByText('Update Job Posting')
    expect(submitButton).not.toBeDisabled()
  })

  it('shows correct button text for edit mode', () => {
    render(
      <JobEditForm
        jobId="job-1"
        initialData={mockInitialData}
      />
    )
    
    expect(screen.getByText('Update Job Posting')).toBeInTheDocument()
    expect(screen.queryByText('Submit Job Posting')).not.toBeInTheDocument()
  })
})
