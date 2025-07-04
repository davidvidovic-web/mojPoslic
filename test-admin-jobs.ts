import { prisma } from './src/lib/prisma'

async function testAdminJobs() {
  try {
    console.log('Testing admin jobs endpoint...')
    
    // Check if there are any admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, name: true, role: true }
    })
    console.log('Admin users:', adminUsers)
    
    // Check if there are any jobs
    const jobCount = await prisma.jobListing.count()
    console.log('Total jobs in database:', jobCount)
    
    if (jobCount > 0) {
      const sampleJobs = await prisma.jobListing.findMany({
        take: 3,
        include: {
          city: {
            select: {
              id: true,
              key: true,
              nameEN: true,
              nameBS: true
            }
          },
          category: {
            select: {
              id: true,
              key: true,
              nameEN: true,
              nameBS: true
            }
          },
          postedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      console.log('Sample jobs:', JSON.stringify(sampleJobs, null, 2))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminJobs()
