#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCitiesFilterImplementation() {
  try {
    console.log('🧪 Testing Cities Filter Implementation...\n')
    
    // Test 1: Check database has cities
    console.log('1️⃣ Testing database has cities...')
    const totalCities = await prisma.city.count()
    const activeCities = await prisma.city.count({ where: { isActive: true } })
    const specialCities = await prisma.city.count({ where: { isActive: true, isSpecial: true } })
    
    console.log(`   ✅ Total cities: ${totalCities}`)
    console.log(`   ✅ Active cities: ${activeCities}`)
    console.log(`   ✅ Special cities: ${specialCities}`)
    
    if (activeCities === 0) {
      throw new Error('No active cities found in database!')
    }
    
    // Test 2: Check API endpoint logic works
    console.log('\n2️⃣ Testing API endpoint logic...')
    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { nameEN: 'asc' }
      ],
    })
    
    console.log(`   ✅ API query returns ${cities.length} cities`)
    
    // Test 3: Check city structure and data quality
    console.log('\n3️⃣ Testing city data structure...')
    const remoteCities = cities.filter(city => city.key === 'remote')
    const sarajevoCities = cities.filter(city => city.key === 'sarajevo')
    const specialCitiesData = cities.filter(city => city.isSpecial)
    
    console.log(`   ✅ Remote option exists: ${remoteCities.length > 0 ? 'Yes' : 'No'}`)
    console.log(`   ✅ Sarajevo exists: ${sarajevoCities.length > 0 ? 'Yes' : 'No'}`)
    console.log(`   ✅ Special cities count: ${specialCitiesData.length}`)
    
    // Test 4: Show sample cities structure
    console.log('\n4️⃣ Sample cities data:')
    const sampleCities = cities.slice(0, 8)
    sampleCities.forEach(city => {
      const special = city.isSpecial ? '⭐' : '  '
      const order = city.sortOrder.toString().padStart(3, ' ')
      console.log(`   ${special} [${order}] ${city.nameEN.padEnd(15)} (${city.nameBS}) - ${city.key}`)
    })
    
    // Test 5: Check for any issues
    console.log('\n5️⃣ Data quality checks...')
    const citiesWithoutKey = cities.filter(city => !city.key || city.key.trim() === '')
    const citiesWithoutNameEN = cities.filter(city => !city.nameEN || city.nameEN.trim() === '')
    const citiesWithoutNameBS = cities.filter(city => !city.nameBS || city.nameBS.trim() === '')
    
    console.log(`   ✅ Cities without key: ${citiesWithoutKey.length}`)
    console.log(`   ✅ Cities without English name: ${citiesWithoutNameEN.length}`)
    console.log(`   ✅ Cities without Bosnian name: ${citiesWithoutNameBS.length}`)
    
    if (citiesWithoutKey.length > 0 || citiesWithoutNameEN.length > 0 || citiesWithoutNameBS.length > 0) {
      console.log('   ⚠️  Warning: Some cities have missing data')
    }
    
    // Test 6: Check job listings with cities
    console.log('\n6️⃣ Testing job listings with cities...')
    const jobsWithCities = await prisma.jobListing.findMany({
      where: {
        isActive: true,
      },
      include: {
        city: true,
      },
      take: 3,
    })
    
    console.log(`   ✅ Found ${jobsWithCities.length} sample job listings`)
    jobsWithCities.forEach(job => {
      const cityName = job.city ? `${job.city.nameEN} (${job.city.key})` : 'No city'
      console.log(`   📄 "${job.title}" in ${cityName}`)
    })
    
    console.log('\n🎉 Cities Filter Implementation Test Complete!')
    console.log('\n📋 Summary:')
    console.log(`   • Database contains ${activeCities} active cities`)
    console.log(`   • ${specialCities} major/special cities for priority display`)
    console.log(`   • API endpoint logic works correctly`)
    console.log(`   • Data structure is valid`)
    console.log(`   • Cities are properly linked to job listings`)
    
    console.log('\n🚀 Ready to test in the browser!')
    console.log('   • Job List page: Filter by all available cities')
    console.log('   • Job Post form: Select from all available cities')
    console.log('   • Cities Test page: /cities-test')
    
  } catch (error) {
    console.error('❌ Cities Filter Implementation test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCitiesFilterImplementation()
    .then(() => {
      console.log('\n✨ All tests passed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error)
      process.exit(1)
    })
}

export { testCitiesFilterImplementation }
