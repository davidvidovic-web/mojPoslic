import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobStatusManager } from '@/components/job-status-manager'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('JobStatusManager', () => {
  const defaultProps = {
    jobId: 'test-job-id',
    currentStatus: 'active' as const,
    jobTitle: 'Test Job',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders current status badge correctly', () => {
    render(<JobStatusManager {...defaultProps} />)
    
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders status for completed job', () => {
    render(<JobStatusManager {...defaultProps} currentStatus="completed" />)
    
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('opens dialog when status change button is clicked', async () => {
    render(<JobStatusManager {...defaultProps} />)
    
    const changeButton = screen.getByRole('button')
    fireEvent.click(changeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Update Job Status')).toBeInTheDocument()
      expect(screen.getByText('Change the status of "Test Job"')).toBeInTheDocument()
    })
  })

  it('successfully updates job status', async () => {
    const onStatusUpdate = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Status updated successfully' }),
    })

    render(<JobStatusManager {...defaultProps} onStatusUpdate={onStatusUpdate} />)
    
    // Open dialog
    const changeButton = screen.getByRole('button')
    fireEvent.click(changeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Update Job Status')).toBeInTheDocument()
    })

    // Change status to completed
    const select = screen.getByRole('combobox')
    fireEvent.click(select)
    
    await waitFor(() => {
      const completedOption = screen.getByText('Completed')
      fireEvent.click(completedOption)
    })

    // Submit update
    const updateButton = screen.getByText('Update Status')
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs/test-job-id/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })
      expect(toast.success).toHaveBeenCalledWith('Job status updated to Completed')
      expect(onStatusUpdate).toHaveBeenCalledWith('completed')
    })
  })

  it('handles API error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    })

    render(<JobStatusManager {...defaultProps} />)
    
    // Open dialog and try to update
    const changeButton = screen.getByRole('button')
    fireEvent.click(changeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Update Job Status')).toBeInTheDocument()
    })

    const updateButton = screen.getByText('Update Status')
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Unauthorized')
    })
  })

  it('disables UI when disabled prop is true', () => {
    render(<JobStatusManager {...defaultProps} disabled={true} />)
    
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows different status configurations correctly', () => {
    const { rerender } = render(<JobStatusManager {...defaultProps} currentStatus="inactive" />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()

    rerender(<JobStatusManager {...defaultProps} currentStatus="expired" />)
    expect(screen.getByText('Expired')).toBeInTheDocument()

    rerender(<JobStatusManager {...defaultProps} currentStatus="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
