import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testJobEditFunctionality() {
  console.log('=== Testing Job Edit Functionality ===')

  try {
    // Test 1: Check if we can create a test job
    console.log('\n✅ Test 1: Creating test job...')
    const testJob = await prisma.jobListing.create({
      data: {
        title: 'Test Software Developer',
        company: 'Test Company',
        description: 'A test job for editing functionality',
        type: 'full_time',
        cityId: 'test-city-id',
        email: 'test@example.com',
        contactEmail: 'test@example.com',
        isActive: true,
        postedById: 'test-user-id'
        // transportation will use default value 'not_provided'
      }
    })
    console.log('Test job created:', testJob.id)

    // Test 2: Check if job has applications (should be 0)
    console.log('\n✅ Test 2: Checking application count...')
    const jobWithApps = await prisma.jobListing.findUnique({
      where: { id: testJob.id },
      include: { applications: true }
    })
    console.log('Application count:', jobWithApps?.applications.length || 0)

    // Test 3: Verify edit eligibility
    const canEdit = (jobWithApps?.applications.length || 0) === 0
    console.log('Can edit job:', canEdit)

    // Test 4: Simulate job update
    console.log('\n✅ Test 3: Testing job update...')
    const updatedJob = await prisma.jobListing.update({
      where: { id: testJob.id },
      data: {
        title: 'Updated Test Software Developer',
        description: 'Updated test job description',
        updatedAt: new Date()
      }
    })
    console.log('Job updated successfully:', updatedJob.title)

    // Clean up: Delete test job
    await prisma.jobListing.delete({
      where: { id: testJob.id }
    })
    console.log('Test job cleaned up')

    console.log('\n🎉 All job edit functionality tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testJobEditFunctionality()
