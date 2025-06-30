import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateJobStatuses() {
  try {
    console.log('🔄 Starting job status migration...')

    // Count existing jobs
    const totalJobs = await prisma.jobListing.count()
    console.log(`Found ${totalJobs} existing jobs`)

    if (totalJobs === 0) {
      console.log('No jobs found. Creating some sample jobs first...')
      
      // Ensure we have cities and categories
      const cities = await prisma.city.findMany({ take: 3 })
      const categories = await prisma.category.findMany({ take: 3 })
      
      if (cities.length === 0 || categories.length === 0) {
        console.log('No cities or categories found. Please run seed-cities and seed-categories first.')
        return
      }

      // Get or create a test employer
      let employer = await prisma.user.findFirst({
        where: { role: 'employer' }
      })

      if (!employer) {
        console.log('Creating test employer...')
        employer = await prisma.user.create({
          data: {
            email: 'employer@test.com',
            name: 'Test Employer',
            role: 'employer',
            companyName: 'Test Company'
          }
        })
      }

      // Create sample jobs with different statuses
      const sampleJobs = [
        {
          title: 'Senior Software Developer',
          company: 'Tech Corp',
          type: 'full_time' as const,
          description: 'Looking for an experienced developer...',
          email: 'hr@techcorp.com',
          cityId: cities[0].id,
          categoryId: categories[0]?.id,
          postedById: employer.id,
          isActive: true,
        },
        {
          title: 'Marketing Manager',
          company: 'Marketing Inc',
          type: 'full_time' as const,
          description: 'Manage our marketing campaigns...',
          email: 'jobs@marketing.com',
          cityId: cities[1].id,
          categoryId: categories[1]?.id,
          postedById: employer.id,
          isActive: false, // This will represent a completed job
        },
        {
          title: 'Freelance Graphic Designer',
          company: 'Design Studio',
          type: 'contract' as const,
          description: 'Create stunning graphics...',
          email: 'contact@design.com',
          cityId: cities[2].id,
          categoryId: categories[2]?.id,
          postedById: employer.id,
          isActive: true,
        }
      ]

      for (const job of sampleJobs) {
        await prisma.jobListing.create({ data: job })
        console.log(`✅ Created job: ${job.title}`)
      }
    }

    // Mark some inactive jobs as "completed" for stats purposes
    const inactiveJobs = await prisma.jobListing.findMany({
      where: { isActive: false },
      take: 5
    })

    console.log(`Found ${inactiveJobs.length} inactive jobs to mark as completed`)

    // For now, we'll use a comment field or description to indicate completed status
    // until the Prisma schema is fully updated
    for (const job of inactiveJobs) {
      await prisma.jobListing.update({
        where: { id: job.id },
        data: {
          description: job.description + '\n\n[Status: COMPLETED]'
        }
      })
    }

    console.log('✅ Job status migration completed successfully!')
    
    // Show final stats
    const activeCount = await prisma.jobListing.count({ where: { isActive: true } })
    const completedCount = await prisma.jobListing.count({ 
      where: { 
        isActive: false,
        description: { contains: '[Status: COMPLETED]' }
      } 
    })
    
    console.log(`📊 Final stats:`)
    console.log(`   Active jobs: ${activeCount}`)
    console.log(`   Completed jobs: ${completedCount}`)

  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
updateJobStatuses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
