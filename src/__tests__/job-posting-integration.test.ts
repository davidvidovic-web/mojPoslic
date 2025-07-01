/**
 * Integration Tests for Job Posting Feature
 * 
 * These tests verify the complete job posting workflow from form submission
 * to database persistence and API responses.
 */

import { POST } from '../app/api/jobs/create/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@prisma/client')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>

describe('Job Posting Integration Tests', () => {
  let mockPrisma: {
    city: { findUnique: jest.Mock; findMany: jest.Mock; count: jest.Mock }
    category: { findUnique: jest.Mock; findMany: jest.Mock; count: jest.Mock }
    jobListing: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock }
    user: { findUnique: jest.Mock }
    $disconnect: jest.Mock
    $transaction: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock Prisma instance with all required methods
    mockPrisma = {
      city: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      jobListing: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $disconnect: jest.fn(),
      $transaction: jest.fn(),
    }

    mockPrismaClient.mockImplementation(() => mockPrisma)
  })

  const mockUser = {
    id: 'user-123',
    email: 'employer@example.com',
    name: 'Test Employer',
    role: 'employer'
  }

  const mockSession = {
    user: mockUser,
    expires: '2024-12-31'
  }

  const mockCity = {
    id: 'city-sarajevo-123',
    key: 'sarajevo',
    nameEN: 'Sarajevo',
    nameBS: 'Sarajevo'
  }

  const mockCategory = {
    id: 'cat-construction-123',
    key: 'construction',
    nameEN: 'Construction',
    nameBS: 'Građevinarstvo'
  }

  describe('Complete Job Creation Workflow', () => {
    it('should handle the complete job posting workflow successfully', async () => {
      // Setup mocks for successful workflow
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
      
      const createdJob = {
        id: 'job-123',
        title: 'Senior Software Developer',
        company: 'Tech Solutions Inc',
        description: 'We are looking for a senior developer...',
        type: 'full_time',
        cityId: mockCity.id,
        categoryId: mockCategory.id,
        salary: '3000 - 4000 BAM per month',
        email: 'hr@techsolutions.com',
        requirements: 'Bachelor degree, 5+ years experience',
        benefits: 'Health insurance, flexible hours',
        website: 'https://techsolutions.com',
        contactEmail: 'hr@techsolutions.com',
        applicationUrl: 'https://techsolutions.com/careers',
        startDate: new Date('2024-02-01'),
        jobAddress: 'Business Center, Sarajevo',
        jobLatitude: 43.8563,
        jobLongitude: 18.4131,
        postedById: mockUser.id,
        isActive: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      }

      mockPrisma.jobListing.create.mockResolvedValue(createdJob)

      const jobData = {
        title: 'Senior Software Developer',
        company: 'Tech Solutions Inc',
        description: 'We are looking for a senior developer with experience in React, Node.js, and PostgreSQL.',
        type: 'full_time',
        city_id: 'sarajevo',
        category_id: 'construction',
        salary: null,
        salaryType: 'monthly',
        salaryMin: 3000,
        salaryMax: 4000,
        email: 'hr@techsolutions.com',
        requirements: 'Bachelor degree, 5+ years experience',
        benefits: 'Health insurance, flexible hours',
        website: 'https://techsolutions.com',
        contact_email: 'hr@techsolutions.com',
        application_url: 'https://techsolutions.com/careers',
        start_date: '2024-02-01T09:00:00Z',
        job_address: 'Business Center, Sarajevo',
        job_latitude: 43.8563,
        job_longitude: 18.4131
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.job).toBeDefined()
      expect(result.job.id).toBe('job-123')

      // Verify city lookup
      expect(mockPrisma.city.findUnique).toHaveBeenCalledWith({
        where: { key: 'sarajevo' },
        select: { id: true, key: true }
      })

      // Verify category lookup
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'construction' },
        select: { id: true, key: true }
      })

      // Verify job creation
      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Senior Software Developer',
          company: 'Tech Solutions Inc',
          type: 'full_time',
          cityId: mockCity.id,
          categoryId: mockCategory.id,
          salary: '3000 - 4000 BAM per month',
          postedById: mockUser.id,
          isActive: true
        })
      })

      // Verify cleanup
      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })

    it('should handle quick job posting with minimal data', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      
      const quickJob = {
        id: 'quick-job-123',
        title: 'Furniture Assembly',
        company: 'Home Services',
        description: 'Need help assembling IKEA furniture',
        type: 'quick_job',
        cityId: mockCity.id,
        categoryId: null,
        salary: '50 BAM',
        email: 'homeowner@example.com',
        postedById: mockUser.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.jobListing.create.mockResolvedValue(quickJob)

      const minimalJobData = {
        title: 'Furniture Assembly',
        company: 'Home Services',
        description: 'Need help assembling IKEA furniture',
        type: 'quick_job',
        city_id: 'sarajevo',
        email: 'homeowner@example.com',
        salary: '50 BAM'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(minimalJobData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Furniture Assembly',
          type: 'quick_job',
          categoryId: null, // No category required for quick jobs
          salary: '50 BAM'
        })
      })
    })
  })

  describe('Error Handling Scenarios', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
    })

    it('should handle non-existent city gracefully', async () => {
      mockPrisma.city.findUnique.mockResolvedValue(null)

      const jobData = {
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        type: 'quick_job',
        city_id: 'non-existent-city',
        email: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe("City with key 'non-existent-city' not found")
    })

    it('should handle database connection errors', async () => {
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
      mockPrisma.jobListing.create.mockRejectedValue(new Error('Database connection timeout'))

      const jobData = {
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        type: 'quick_job',
        city_id: 'sarajevo',
        category_id: 'construction',
        email: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('Failed to create job')
      expect(result.details).toBe('Database connection timeout')
      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })

    it('should handle category not found by ID or key', async () => {
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique
        .mockResolvedValueOnce(null) // First call by ID
        .mockResolvedValueOnce(null) // Second call by key

      const jobData = {
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        type: 'full_time',
        city_id: 'sarajevo',
        category_id: 'invalid-category',
        email: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe("Category with key/id 'invalid-category' not found")
    })
  })

  describe('Salary Formatting', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.jobListing.create.mockResolvedValue({
        id: 'job-123',
        createdAt: new Date(),
        startDate: null,
        jobAddress: null,
        jobLatitude: null,
        jobLongitude: null,
        contactEmail: null,
        applicationUrl: null,
      })
    })

    it('should format hourly salary range correctly', async () => {
      const jobData = {
        title: 'Freelance Developer',
        company: 'Tech Corp',
        description: 'Part-time development work',
        type: 'part_time',
        city_id: 'sarajevo',
        email: 'hr@example.com',
        salaryType: 'hourly',
        salaryMin: 25,
        salaryMax: 40
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salary: '25 - 40 BAM per hour'
        })
      })
    })

    it('should format fixed price correctly', async () => {
      const jobData = {
        title: 'Project Setup',
        company: 'StartupCo',
        description: 'One-time project setup',
        type: 'quick_job',
        city_id: 'sarajevo',
        email: 'contact@startup.com',
        salaryType: 'fixed',
        salaryMin: 1500
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salary: '1500 BAM'
        })
      })
    })

    it('should handle daily rate (dnevnica) correctly', async () => {
      const jobData = {
        title: 'Construction Worker',
        company: 'BuildCorp',
        description: 'Daily construction work',
        type: 'quick_job',
        city_id: 'sarajevo',
        email: 'jobs@buildcorp.com',
        salaryType: 'daily',
        salaryMin: 80,
        salaryMax: 100
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salary: '80 - 100 BAM per day'
        })
      })
    })
  })

  describe('Date and Location Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.jobListing.create.mockResolvedValue({
        id: 'job-123',
        createdAt: new Date(),
        startDate: null,
        jobAddress: null,
        jobLatitude: null,
        jobLongitude: null,
        contactEmail: null,
        applicationUrl: null,
      })
    })

    it('should handle future start dates correctly', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      const jobData = {
        title: 'Future Project',
        company: 'Tech Corp',
        description: 'Project starting next month',
        type: 'full_time',
        city_id: 'sarajevo',
        email: 'hr@example.com',
        start_date: futureDate.toISOString()
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          startDate: expect.any(Date)
        })
      })
    })

    it('should reject past start dates', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const jobData = {
        title: 'Past Project',
        company: 'Tech Corp',
        description: 'This should fail',
        type: 'full_time',
        city_id: 'sarajevo',
        email: 'hr@example.com',
        start_date: pastDate.toISOString()
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Start date cannot be in the past')
    })

    it('should handle job location coordinates correctly', async () => {
      const jobData = {
        title: 'On-site Developer',
        company: 'Local Company',
        description: 'Work from our office',
        type: 'full_time',
        city_id: 'sarajevo',
        email: 'hr@local.com',
        job_address: 'Zmaja od Bosne 8, Sarajevo',
        job_latitude: 43.8563,
        job_longitude: 18.4131
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobAddress: 'Zmaja od Bosne 8, Sarajevo',
          jobLatitude: 43.8563,
          jobLongitude: 18.4131
        })
      })
    })
  })

  describe('Authentication and Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const jobData = {
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        type: 'quick_job',
        city_id: 'sarajevo',
        email: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toBe('Authentication required')
    })

    it('should reject requests with incomplete session', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }, // Missing user ID
        expires: '2024-12-31'
      })

      const jobData = {
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        type: 'quick_job',
        city_id: 'sarajevo',
        email: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toBe('Authentication required')
    })
  })

  describe('Data Consistency', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
    })

    it('should ensure all job types are supported', async () => {
      const jobTypes = ['quick_job', 'full_time', 'part_time', 'remote']
      
      for (const jobType of jobTypes) {
        mockPrisma.jobListing.create.mockResolvedValue({
          id: `job-${jobType}`,
          type: jobType,
          createdAt: new Date(),
        })

        const jobData = {
          title: `${jobType} Job`,
          company: 'Test Company',
          description: 'Test description',
          type: jobType,
          city_id: 'sarajevo',
          category_id: 'construction',
          email: 'test@example.com'
        }

        const request = new NextRequest('http://localhost:3000/api/jobs/create', {
          method: 'POST',
          body: JSON.stringify(jobData)
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
      }
    })

    it('should ensure proper field mapping between form and database', async () => {
      mockPrisma.jobListing.create.mockResolvedValue({
        id: 'job-mapping-test',
        createdAt: new Date(),
        startDate: null,
        jobAddress: null,
        jobLatitude: null,
        jobLongitude: null,
        contactEmail: null,
        applicationUrl: null,
      })

      const formData = {
        title: 'Field Mapping Test',
        company: 'Mapping Corp',
        description: 'Testing field mapping',
        type: 'full_time',
        city_id: 'sarajevo',           // Form field
        category_id: 'construction',   // Form field
        email: 'test@mapping.com',
        contact_email: 'contact@mapping.com',    // Form field
        application_url: 'https://mapping.com/apply', // Form field
        job_address: 'Test Address',   // Form field
        job_latitude: 43.8563,         // Form field
        job_longitude: 18.4131,        // Form field
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cityId: mockCity.id,          // Database field
          categoryId: mockCategory.id,  // Database field
          contactEmail: 'contact@mapping.com',     // Database field
          applicationUrl: 'https://mapping.com/apply', // Database field
          jobAddress: 'Test Address',   // Database field
          jobLatitude: 43.8563,         // Database field
          jobLongitude: 18.4131,        // Database field
        })
      })
    })
  })
})
