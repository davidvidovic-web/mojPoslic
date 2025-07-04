import { POST } from '../route'
import { NextRequest } from 'next/server'
import { #getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@prisma/client')

const mockGetServerSession = #getServerSession as jest.MockedFunction<typeof #getServerSession>
const mockPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>

// Create mock Prisma instance
const mockPrisma = {
  city: {
    findUnique: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
  jobListing: {
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
}

// Mock the PrismaClient constructor to return our mock
mockPrismaClient.mockImplementation(() => mockPrisma as any)

describe('/api/jobs/create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  }

  const mockSession = {
    user: mockUser
  }

  const validJobData = {
    title: 'Test Job',
    company: 'Test Company',
    description: 'This is a test job description',
    type: 'quick_job',
    city_id: 'sarajevo',
    category_id: 'construction',
    email: 'contact@example.com',
    salary: '1000 BAM per month'
  }

  const mockCity = {
    id: 'city-123',
    key: 'sarajevo'
  }

  const mockCategory = {
    id: 'category-123',
    key: 'construction'
  }

  const mockCreatedJob = {
    id: 'job-123',
    title: 'Test Job',
    company: 'Test Company',
    cityId: 'city-123',
    categoryId: 'category-123',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    startDate: null,
    jobAddress: null,
    jobLatitude: null,
    jobLongitude: null,
    contactEmail: null,
    applicationUrl: null
  }

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(validJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 401 if session exists but user ID is missing', async () => {
      mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } } as any)

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(validJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
    })

    it('should return 400 if required fields are missing', async () => {
      const invalidData = {
        title: 'Test Job'
        // Missing required fields: company, description, city_id, email
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should return 400 if city is not found', async () => {
      mockPrisma.city.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(validJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("City with key 'sarajevo' not found")
    })

    it('should return 400 if category is not found (when provided)', async () => {
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique
        .mockResolvedValueOnce(null) // First lookup by ID fails
        .mockResolvedValueOnce(null) // Second lookup by key fails

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(validJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Category with key/id 'construction' not found")
    })

    it('should return 400 if start date is in the past', async () => {
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const dataWithPastDate = {
        ...validJobData,
        start_date: pastDate.toISOString()
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(dataWithPastDate)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Start date cannot be in the past')
    })
  })

  describe('Category Resolution', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
    })

    it('should resolve category by ID first', async () => {
      const categoryId = 'cat-id-123'
      mockPrisma.category.findUnique.mockResolvedValue({ id: categoryId, key: 'construction' })
      mockPrisma.jobListing.create.mockResolvedValue(mockCreatedJob)

      const dataWithCategoryId = {
        ...validJobData,
        category_id: categoryId
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(dataWithCategoryId)
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        select: { id: true, key: true }
      })
    })

    it('should fallback to category key if ID lookup fails', async () => {
      const categoryKey = 'construction'
      mockPrisma.category.findUnique
        .mockResolvedValueOnce(null) // First lookup by ID fails
        .mockResolvedValueOnce({ id: 'cat-123', key: categoryKey }) // Second lookup by key succeeds
      mockPrisma.jobListing.create.mockResolvedValue(mockCreatedJob)

      const dataWithCategoryKey = {
        ...validJobData,
        category_id: categoryKey
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(dataWithCategoryKey)
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.category.findUnique).toHaveBeenCalledTimes(2)
      expect(mockPrisma.category.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: categoryKey },
        select: { id: true, key: true }
      })
      expect(mockPrisma.category.findUnique).toHaveBeenNthCalledWith(2, {
        where: { key: categoryKey },
        select: { id: true, key: true }
      })
    })
  })

  describe('Salary Formatting', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
      mockPrisma.jobListing.create.mockResolvedValue(mockCreatedJob)
    })

    it('should format hourly salary correctly', async () => {
      const salaryData = {
        ...validJobData,
        salary: null,
        salaryType: 'hourly',
        salaryMin: 25,
        salaryMax: 35
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(salaryData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salary: '25 - 35 BAM per hour'
        })
      })
    })

    it('should format fixed salary correctly', async () => {
      const salaryData = {
        ...validJobData,
        salary: null,
        salaryType: 'fixed',
        salaryMin: 1000,
        salaryMax: 1500
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(salaryData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salary: '1000 - 1500 BAM'
        })
      })
    })

    it('should handle single minimum salary', async () => {
      const salaryData = {
        ...validJobData,
        salary: null,
        salaryType: 'monthly',
        salaryMin: 2000,
        salaryMax: null
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(salaryData)
      })

      await POST(request)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salary: 'From 2000 BAM per month'
        })
      })
    })
  })

  describe('Successful Job Creation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
      mockPrisma.jobListing.create.mockResolvedValue(mockCreatedJob)
    })

    it('should create job successfully with all fields', async () => {
      const fullJobData = {
        ...validJobData,
        requirements: 'Experience required',
        benefits: 'Health insurance',
        website: 'https://example.com',
        contact_email: 'hr@example.com',
        application_url: 'https://example.com/apply',
        start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        job_address: '123 Main St, Sarajevo',
        job_latitude: 43.8563,
        job_longitude: 18.4131
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(fullJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.job).toBeDefined()
      expect(data.job.id).toBe('job-123')

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Job',
          company: 'Test Company',
          description: 'This is a test job description',
          type: 'quick_job',
          cityId: 'city-123',
          categoryId: 'category-123',
          email: 'contact@example.com',
          requirements: 'Experience required',
          benefits: 'Health insurance',
          website: 'https://example.com',
          contactEmail: 'hr@example.com',
          applicationUrl: 'https://example.com/apply',
          jobAddress: '123 Main St, Sarajevo',
          jobLatitude: 43.8563,
          jobLongitude: 18.4131,
          postedById: 'user-123',
          isActive: true
        })
      })
    })

    it('should create job successfully without optional fields', async () => {
      const minimalJobData = {
        title: 'Minimal Job',
        company: 'Minimal Company',
        description: 'Minimal description',
        type: 'part_time',
        city_id: 'sarajevo',
        email: 'minimal@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(minimalJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      expect(mockPrisma.jobListing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Minimal Job',
          company: 'Minimal Company',
          description: 'Minimal description',
          type: 'part_time',
          cityId: 'city-123',
          categoryId: null,
          email: 'minimal@example.com',
          postedById: 'user-123',
          isActive: true
        })
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.city.findUnique.mockResolvedValue(mockCity)
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.jobListing.create.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(validJobData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create job')
      expect(data.details).toBe('Database connection failed')
      expect(data.timestamp).toBeDefined()
    })

    it('should disconnect Prisma client even on error', async () => {
      mockPrisma.jobListing.create.mockRejectedValue(new Error('Test error'))

      const request = new NextRequest('http://localhost:3000/api/jobs/create', {
        method: 'POST',
        body: JSON.stringify(validJobData)
      })

      await POST(request)

      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })
  })
})
