#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { seedBosnianCities } from './seed-cities'
import { seedCategories } from './seed-categories'
import { seedUsers } from './seed-users'
import { seedJobs } from './seed-jobs-simple'

const prisma = new PrismaClient()

async function seedAll() {
  console.log('🌱 Starting complete database seeding...\n')
  
  try {
    // Step 1: Seed basic data (cities and categories)
    console.log('📍 Step 1: Seeding cities...')
    await seedBosnianCities()
    console.log('✅ Cities seeded successfully\n')

    console.log('🏷️  Step 2: Seeding categories...')
    await seedCategories()
    console.log('✅ Categories seeded successfully\n')

    // Step 2: Seed users (required for job posting)
    console.log('👥 Step 3: Seeding users...')
    await seedUsers()
    console.log('✅ Users seeded successfully\n')

    // Step 3: Seed jobs (depends on cities, categories, and users)
    console.log('💼 Step 4: Seeding jobs...')
    await seedJobs()
    console.log('✅ Jobs seeded successfully\n')

    // Show final summary
    console.log('📊 Final database summary:')
    
    const totalUsers = await prisma.user.count()
    const employerCount = await prisma.user.count({ where: { role: 'employer' } })
    const employeeCount = await prisma.user.count({ where: { role: 'employee' } })
    const companyCount = await prisma.user.count({ where: { role: 'company' } })
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    
    const totalJobs = await prisma.jobListing.count()
    const activeJobs = await prisma.jobListing.count({ where: { isActive: true } })
    const featuredJobs = await prisma.jobListing.count({ where: { isActive: true, isFeatured: true } })
    
    const totalCities = await prisma.city.count()
    const totalCategories = await prisma.category.count()

    console.log(`   👥 Users: ${totalUsers} total`)
    console.log(`      • Employers: ${employerCount}`)
    console.log(`      • Companies: ${companyCount}`)
    console.log(`      • Job seekers: ${employeeCount}`)
    console.log(`      • Admins: ${adminCount}`)
    console.log(`   💼 Jobs: ${totalJobs} total (${activeJobs} active, ${featuredJobs} featured)`)
    console.log(`   📍 Cities: ${totalCities}`)
    console.log(`   🏷️  Categories: ${totalCategories}`)

    console.log('\n🎉 Complete database seeding finished successfully!')
    console.log('🚀 Your application is ready with sample data!')
    console.log('💡 Transportation fields have been added to all jobs with random values!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to seed basic data only (cities + categories)
async function seedBasicData() {
  console.log('🌱 Seeding basic data only...\n')
  
  try {
    await seedBosnianCities()
    await seedCategories()
    
    console.log('✅ Basic data seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding basic data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to seed sample data for development
async function seedDevelopmentData() {
  console.log('🔧 Seeding development sample data...\n')
  
  try {
    // Import and run the many jobs seeder for pagination testing
    const { seedManyJobs } = await import('./seed-many-jobs')
    
    await seedBasicData()
    await seedUsers()
    await seedManyJobs()
    
    console.log('✅ Development data seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding development data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the appropriate seeding based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0] || 'all'

  switch (command) {
    case 'basic':
      seedBasicData()
        .then(() => {
          console.log('\n✨ Basic data seeding completed!')
          process.exit(0)
        })
        .catch((error) => {
          console.error('\n💥 Basic data seeding failed:', error)
          process.exit(1)
        })
      break
      
    case 'dev':
    case 'development':
      seedDevelopmentData()
        .then(() => {
          console.log('\n✨ Development data seeding completed!')
          process.exit(0)
        })
        .catch((error) => {
          console.error('\n💥 Development data seeding failed:', error)
          process.exit(1)
        })
      break
      
    case 'all':
    default:
      seedAll()
        .then(() => {
          console.log('\n✨ Complete seeding finished!')
          process.exit(0)
        })
        .catch((error) => {
          console.error('\n💥 Complete seeding failed:', error)
          process.exit(1)
        })
      break
  }
}

export { seedAll, seedBasicData, seedDevelopmentData }
