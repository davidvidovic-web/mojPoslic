import { NextRequest } from 'next/server'
import { PATCH, GET } from '@/app/api/jobs/[id]/status/route'

// Mock dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    jobListing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  }))
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const mockPrisma = new PrismaClient()
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/jobs/[id]/status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PATCH - Update job status', () => {
    const mockParams = { id: 'test-job-id' }
    
    it('should update job status successfully for job owner', async () => {
      // Mock session
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      // Mock job exists and user owns it
      mockPrisma.jobListing.findUnique.mockResolvedValue({
        id: 'test-job-id',
        postedById: 'user-1',
        title: 'Test Job',
        status: 'active',
      })

      // Mock user role check
      mockPrisma.user.findUnique.mockResolvedValue({
        role: 'client',
      })

      // Mock successful update
      mockPrisma.jobListing.update.mockResolvedValue({
        id: 'test-job-id',
        title: 'Test Job',
        status: 'completed',
        isActive: false,
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await PATCH(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Job status updated successfully')
      expect(data.job.status).toBe('completed')
      expect(mockPrisma.jobListing.update).toHaveBeenCalledWith({
        where: { id: 'test-job-id' },
        data: { 
          status: 'completed',
          isActive: false
        },
        select: {
          id: true,
          title: true,
          status: true,
          isActive: true,
          updatedAt: true
        }
      })
    })

    it('should allow admin to update any job status', async () => {
      // Mock session with different user
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-user' },
      } as any)

      // Mock job exists but user doesn't own it
      mockPrisma.jobListing.findUnique.mockResolvedValue({
        id: 'test-job-id',
        postedById: 'other-user',
        title: 'Test Job',
        status: 'active',
      })

      // Mock admin role
      mockPrisma.user.findUnique.mockResolvedValue({
        role: 'admin',
      })

      // Mock successful update
      mockPrisma.jobListing.update.mockResolvedValue({
        id: 'test-job-id',
        title: 'Test Job',
        status: 'inactive',
        isActive: false,
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'inactive' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await PATCH(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Job status updated successfully')
    })

    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await PATCH(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 400 for invalid status', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'invalid-status' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await PATCH(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid status. Must be one of: active, inactive, completed, expired')
    })

    it('should return 404 if job not found', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.jobListing.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await PATCH(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Job not found')
    })

    it('should return 403 if user is not owner and not admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      } as any)

      mockPrisma.jobListing.findUnique.mockResolvedValue({
        id: 'test-job-id',
        postedById: 'other-user',
        title: 'Test Job',
        status: 'active',
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        role: 'tasker',
      })

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await PATCH(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('You can only update the status of your own job listings')
    })
  })

  describe('GET - Get job status', () => {
    const mockParams = { id: 'test-job-id' }

    it('should return job status successfully', async () => {
      mockPrisma.jobListing.findUnique.mockResolvedValue({
        id: 'test-job-id',
        title: 'Test Job',
        status: 'active',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      })

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status')
      const response = await GET(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('test-job-id')
      expect(data.status).toBe('active')
      expect(data.isActive).toBe(true)
    })

    it('should return 404 if job not found', async () => {
      mockPrisma.jobListing.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs/test-job-id/status')
      const response = await GET(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Job not found')
    })
  })
})
