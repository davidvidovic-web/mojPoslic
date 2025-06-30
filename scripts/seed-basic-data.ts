import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCities() {
  console.log('Checking cities...')

  const existingCities = await prisma.city.count()
  console.log(`Found ${existingCities} cities in database`)

  if (existingCities === 0) {
    console.log('No cities found, seeding basic cities...')

    const cities = [
      { key: 'sarajevo', nameBS: 'Sarajevo', nameEN: 'Sarajevo', isSpecial: true, sortOrder: 1 },
      { key: 'banja-luka', nameBS: 'Banja Luka', nameEN: 'Banja Luka', isSpecial: true, sortOrder: 2 },
      { key: 'tuzla', nameBS: 'Tuzla', nameEN: 'Tuzla', isSpecial: true, sortOrder: 3 },
      { key: 'zenica', nameBS: 'Zenica', nameEN: 'Zenica', isSpecial: true, sortOrder: 4 },
      { key: 'mostar', nameBS: 'Mostar', nameEN: 'Mostar', isSpecial: true, sortOrder: 5 },
      { key: 'remote', nameBS: 'Rad na daljinu', nameEN: 'Remote Work', isSpecial: true, sortOrder: 10 },
    ]

    for (const city of cities) {
      try {
        await prisma.city.create({ data: city })
        console.log(`Created city: ${city.nameEN}`)
      } catch (error) {
        console.error(`Error creating city ${city.nameEN}:`, error)
      }
    }
  } else {
    console.log('Cities already exist, listing them:')
    const cities = await prisma.city.findMany({
      select: { key: true, nameEN: true, nameBS: true }
    })
    cities.forEach(city => {
      console.log(`- ${city.key}: ${city.nameEN} (${city.nameBS})`)
    })
  }
}

async function seedCategories() {
  console.log('Checking categories...')

  const existingCategories = await prisma.category.count()
  console.log(`Found ${existingCategories} categories in database`)

  if (existingCategories === 0) {
    console.log('No categories found, seeding basic categories...')

    const categories = [
      { key: 'construction', nameBS: 'Građevinarstvo', nameEN: 'Construction', isPopular: true, sortOrder: 1 },
      { key: 'cleaning', nameBS: 'Čišćenje', nameEN: 'Cleaning', isPopular: true, sortOrder: 2 },
      { key: 'delivery', nameBS: 'Dostava', nameEN: 'Delivery', isPopular: true, sortOrder: 3 },
      { key: 'handyman', nameBS: 'Majstorski posao', nameEN: 'Handyman', isPopular: true, sortOrder: 4 },
      { key: 'it', nameBS: 'IT', nameEN: 'Information Technology', isPopular: true, sortOrder: 5 },
    ]

    for (const category of categories) {
      try {
        await prisma.category.create({ data: category })
        console.log(`Created category: ${category.nameEN}`)
      } catch (error) {
        console.error(`Error creating category ${category.nameEN}:`, error)
      }
    }
  } else {
    console.log('Categories already exist, listing them:')
    const categories = await prisma.category.findMany({
      select: { key: true, nameEN: true, nameBS: true }
    })
    categories.forEach(category => {
      console.log(`- ${category.key}: ${category.nameEN} (${category.nameBS})`)
    })
  }
}

async function main() {
  try {
    await seedCities()
    await seedCategories()
    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedCities, seedCategories }
