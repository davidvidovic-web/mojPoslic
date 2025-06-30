import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Major cities in Bosnia and Herzegovina with their coordinates
const cityCoordinates = {
  'sarajevo': { latitude: 43.8476, longitude: 18.3564 },
  'banja-luka': { latitude: 44.7756, longitude: 17.1852 },
  'tuzla': { latitude: 44.5346, longitude: 18.6747 },
  'zenica': { latitude: 44.2034, longitude: 17.9058 },
  'mostar': { latitude: 43.3434, longitude: 17.8078 },
  'bijeljina': { latitude: 44.7597, longitude: 19.2147 },
  'brcko': { latitude: 44.8692, longitude: 18.8081 },
  'cazin': { latitude: 44.9667, longitude: 15.9442 },
  'doboj': { latitude: 44.7314, longitude: 18.0869 },
  'travnik': { latitude: 44.2253, longitude: 17.6656 },
  'lukavac': { latitude: 44.5392, longitude: 18.5289 },
  'gradiska': { latitude: 45.1433, longitude: 17.2550 },
  'konjic': { latitude: 43.6533, longitude: 17.9608 },
  'gorazde': { latitude: 43.6681, longitude: 18.9758 },
  'visoko': { latitude: 43.9889, longitude: 18.1806 },
  'zivinice': { latitude: 44.4500, longitude: 18.6500 },
  'kakanj': { latitude: 44.1333, longitude: 18.1167 },
  'livno': { latitude: 43.8267, longitude: 17.0050 },
  'velika-kladusa': { latitude: 45.1833, longitude: 15.8167 },
  'buzim': { latitude: 45.0000, longitude: 15.8667 },
  'sanski-most': { latitude: 44.7667, longitude: 16.6667 },
  'teslic': { latitude: 44.6167, longitude: 17.8500 },
  'kalesija': { latitude: 44.4500, longitude: 18.9167 },
  'srebrenik': { latitude: 44.7000, longitude: 18.4833 },
  'orasje': { latitude: 45.0500, longitude: 18.6833 },
  'stolac': { latitude: 43.0833, longitude: 17.9667 },
  'capljina': { latitude: 43.1167, longitude: 17.7167 }
}

async function updateCityCoordinates() {
  console.log('Starting to update city coordinates...')
  
  try {
    for (const [cityKey, coords] of Object.entries(cityCoordinates)) {
      const result = await prisma.city.updateMany({
        where: {
          key: cityKey
        },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      })
      
      if (result.count > 0) {
        console.log(`✓ Updated coordinates for ${cityKey}`)
      } else {
        console.log(`⚠ City with key "${cityKey}" not found`)
      }
    }
    
    console.log('✓ Finished updating city coordinates')
  } catch (error) {
    console.error('Error updating city coordinates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCityCoordinates()
