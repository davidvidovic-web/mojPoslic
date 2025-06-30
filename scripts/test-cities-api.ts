#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCitiesAPI() {
  try {
    console.log('🧪 Testing cities API logic...')
    
    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { nameEN: 'asc' }
      ],
    })

    console.log(`✅ Found ${cities.length} active cities`)
    console.log('📋 First 5 cities:')
    cities.slice(0, 5).forEach(city => {
      console.log(`   - ${city.nameEN} (${city.nameBS}) [${city.key}] ${city.isSpecial ? '⭐' : ''}`)
    })
    
    // Test special cities
    const specialCities = cities.filter(city => city.isSpecial)
    console.log(`⭐ Found ${specialCities.length} special cities`)
    
    console.log('🎉 Cities API test passed!')
    
  } catch (error) {
    console.error('❌ Cities API test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCitiesAPI()
    .then(() => {
      console.log('✨ Test completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test failed:', error)
      process.exit(1)
    })
}

export { testCitiesAPI }
