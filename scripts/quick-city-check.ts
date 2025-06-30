#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickCityCheck() {
  try {
    console.log('Checking cities in database...')
    
    const totalCities = await prisma.city.count()
    const activeCities = await prisma.city.count({ where: { isActive: true } })
    const specialCities = await prisma.city.count({ where: { isActive: true, isSpecial: true } })
    
    console.log(`✅ Total cities: ${totalCities}`)
    console.log(`✅ Active cities: ${activeCities}`)
    console.log(`✅ Special cities: ${specialCities}`)
    
    if (activeCities > 0) {
      const sampleCities = await prisma.city.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { sortOrder: 'asc' }
      })
      
      console.log('\n📍 Sample cities:')
      sampleCities.forEach(city => {
        const special = city.isSpecial ? '⭐' : '  '
        console.log(`   ${special} ${city.nameEN} (${city.nameBS}) - ${city.key}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickCityCheck()
