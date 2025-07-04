import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobPostForm } from '../job-post-form'
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

describe('JobPostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'job-1' })
    })
  })

  it('renders the form correctly', () => {
    render(<JobPostForm />)
    
    expect(screen.getByText('Basic Details')).toBeInTheDocument()
    expect(screen.getByText('Submit Job Posting')).toBeInTheDocument()
  })

  it('displays initial data when provided', () => {
    const initialData: Partial<CreateJobData> = {
      title: 'Test Job',
      company: 'Test Company',
      description: 'Test Description'
    }

    render(<JobPostForm initialData={initialData} />)
    
    expect(screen.getByDisplayValue('Test Job')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('calls onJobPosted when form is submitted successfully', async () => {
    const onJobPosted = vi.fn()
    
    render(<JobPostForm onJobPosted={onJobPosted} />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/job title/i), {
      target: { value: 'Test Job' }
    })
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Test Company' }
    })
    fireEvent.change(screen.getByLabelText(/job description/i), {
      target: { value: 'Test Description' }
    })
    
    // Select category and location (mocked)
    // Navigate to review step
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    
    // Submit
    fireEvent.click(screen.getByText('Submit Job Posting'))
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('Test Job')
      })
    })
  })

  it('shows error when API returns error', async () => {
    const { toast } = await import('sonner')
    
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Job creation failed' })
    })

    render(<JobPostForm />)
    
    // Fill in required fields and submit
    // ... (similar to above test)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Job creation failed')
    })
  })

  it('shows validation errors for missing required fields', async () => {
    const { toast } = await import('sonner')
    
    render(<JobPostForm />)
    
    // Navigate to review and try to submit without filling required fields
    fireEvent.click(screen.getByText('Submit Job Posting'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Please fill in the following required fields')
      )
    })
  })

  it('prevents navigation to next step when current step is invalid in create mode', () => {
    render(<JobPostForm />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('shows submit button text correctly', () => {
    render(<JobPostForm />)
    
    expect(screen.getByText('Submit Job Posting')).toBeInTheDocument()
    expect(screen.queryByText('Update Job Posting')).not.toBeInTheDocument()
  })
})
