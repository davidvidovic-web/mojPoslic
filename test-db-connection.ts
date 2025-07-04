import { prisma } from '@/lib/prisma'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users in database`)
    
    // Test Auth.js required tables
    const accountCount = await prisma.account.count()
    const sessionCount = await prisma.session.count()
    console.log(`✅ Auth tables: ${accountCount} accounts, ${sessionCount} sessions`)
    
    console.log('✅ Database schema and connection test successful!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection().catch(console.error)
