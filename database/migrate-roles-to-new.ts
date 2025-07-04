import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateRoles() {
  console.log('🔄 Starting role migration from employee/employer to tasker/client...')
  
  try {
    // Step 1: Update all employee roles to tasker
    const employeeUpdate = await prisma.$executeRaw`
      UPDATE "users" 
      SET "role" = 'tasker'
      WHERE "role" = 'employee'
    `
    console.log(`✅ Updated ${employeeUpdate} employee records to tasker`)
    
    // Step 2: Update all employer roles to client
    const employerUpdate = await prisma.$executeRaw`
      UPDATE "users" 
      SET "role" = 'client'
      WHERE "role" = 'employer'
    `
    console.log(`✅ Updated ${employerUpdate} employer records to client`)
    
    // Step 3: Verify the migration
    const roleCounts = await prisma.$queryRaw`
      SELECT "role", COUNT(*) as count 
      FROM "users" 
      GROUP BY "role"
      ORDER BY "role"
    `
    
    console.log('📊 Current role distribution:', roleCounts)
    
    console.log('🎉 Role migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during role migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateRoles().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
