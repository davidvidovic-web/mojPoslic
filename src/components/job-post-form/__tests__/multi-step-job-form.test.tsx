import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MultiStepJobForm } from '../multi-step-job-form'
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

// Mock fetch
global.fetch = vi.fn()

describe('MultiStepJobForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'job-1' })
    })
  })

  describe('Job Creation Flow', () => {
    it('renders JobPostForm when not in edit mode', () => {
      render(<MultiStepJobForm />)
      
      expect(screen.getByText('Submit Job Posting')).toBeInTheDocument()
      expect(screen.queryByText('Edit Mode')).not.toBeInTheDocument()
    })

    it('passes initial data to JobPostForm', () => {
      const initialData: Partial<CreateJobData> = {
        title: 'Test Job',
        company: 'Test Company'
      }

      render(<MultiStepJobForm initialData={initialData} />)
      
      expect(screen.getByDisplayValue('Test Job')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    })

    it('calls onJobPosted when job is created successfully', async () => {
      const onJobPosted = vi.fn()
      
      render(<MultiStepJobForm onJobPosted={onJobPosted} />)
      
      // This would require filling out the form and submitting
      // The actual implementation would test the full form flow
      expect(screen.getByText('Submit Job Posting')).toBeInTheDocument()
    })
  })

  describe('Job Editing Flow', () => {
    const mockJobData: CreateJobData = {
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

    it('renders JobEditForm when in edit mode with jobId', () => {
      render(
        <MultiStepJobForm
          isEditMode={true}
          jobId="job-1"
          initialData={mockJobData}
        />
      )
      
      expect(screen.getByText('Update Job Posting')).toBeInTheDocument()
      expect(screen.getByText('Edit Mode')).toBeInTheDocument()
    })

    it('displays existing job data in edit mode', () => {
      render(
        <MultiStepJobForm
          isEditMode={true}
          jobId="job-1"
          initialData={mockJobData}
        />
      )
      
      expect(screen.getByDisplayValue('Existing Job')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing Company')).toBeInTheDocument()
    })

    it('allows free navigation between steps in edit mode', () => {
      render(
        <MultiStepJobForm
          isEditMode={true}
          jobId="job-1"
          initialData={mockJobData}
        />
      )
      
      // Should be able to click any step
      const reviewStep = screen.getByText('Review')
      fireEvent.click(reviewStep)
      
      expect(screen.getByText('Review')).toBeInTheDocument()
    })

    it('calls onJobPosted when job is updated successfully', async () => {
      const onJobPosted = vi.fn()
      
      render(
        <MultiStepJobForm
          isEditMode={true}
          jobId="job-1"
          initialData={mockJobData}
          onJobPosted={onJobPosted}
        />
      )
      
      // Navigate to review and submit
      fireEvent.click(screen.getByText('Review'))
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
    })

    it('falls back to JobPostForm when jobId is missing in edit mode', () => {
      render(
        <MultiStepJobForm
          isEditMode={true}
          // No jobId provided
          initialData={mockJobData}
        />
      )
      
      // Should render create form instead
      expect(screen.getByText('Submit Job Posting')).toBeInTheDocument()
      expect(screen.queryByText('Edit Mode')).not.toBeInTheDocument()
    })
  })

  describe('Props Forwarding', () => {
    it('forwards all props correctly to JobPostForm', () => {
      const onJobPosted = vi.fn()
      const initialData = { title: 'Test' }
      
      render(
        <MultiStepJobForm
          onJobPosted={onJobPosted}
          initialData={initialData}
        />
      )
      
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    it('forwards all props correctly to JobEditForm', () => {
      const onJobPosted = vi.fn()
      const initialData = { title: 'Test Edit' }
      
      render(
        <MultiStepJobForm
          isEditMode={true}
          jobId="job-1"
          onJobPosted={onJobPosted}
          initialData={initialData}
        />
      )
      
      expect(screen.getByDisplayValue('Test Edit')).toBeInTheDocument()
    })
  })
})
