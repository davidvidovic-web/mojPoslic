#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'

async function updateCategories() {
  console.log('🏷️  Updating categories to focus on handyman jobs...')

  try {
    // First, delete all existing categories to start fresh
    await prisma.category.deleteMany({})
    console.log('🗑️  Cleared existing categories')

    // Now seed the handyman-focused categories
    const categoryData = [
      {
        key: 'majstorski-radovi',
        nameBS: 'Majstorski radovi i popravke',
        nameEN: 'Handyman work and repairs',
        sortOrder: 1,
        isPopular: true,
        children: [
          { key: 'popravke-u-kuci', nameBS: 'Popravke u kući', nameEN: 'Home repairs', sortOrder: 1 },
          { key: 'sastavljanje-namestaja', nameBS: 'Sastavljanje nameštaja', nameEN: 'Furniture assembly', sortOrder: 2 },
          { key: 'postavljanje-tv', nameBS: 'Postavljanje TV-a i tehnike', nameEN: 'TV and tech installation', sortOrder: 3 },
          { key: 'klima-uređaji', nameBS: 'Instalacija i servis klima uređaja', nameEN: 'AC installation and service', sortOrder: 4 },
          { key: 'elektricarske', nameBS: 'Električarske usluge', nameEN: 'Electrical services', sortOrder: 5 },
          { key: 'vodoinstalaterske', nameBS: 'Vodoinstalaterske usluge', nameEN: 'Plumbing services', sortOrder: 6 },
          { key: 'molerski-radovi', nameBS: 'Molerski radovi', nameEN: 'Painting work', sortOrder: 7 },
          { key: 'stolarske', nameBS: 'Stolarske usluge', nameEN: 'Carpentry services', sortOrder: 8 },
        ]
      },
      {
        key: 'selidbe-transport',
        nameBS: 'Selidbe i transport',
        nameEN: 'Moving and transport',
        sortOrder: 2,
        isPopular: true,
        children: [
          { key: 'kompletne-selidbe', nameBS: 'Kompletne usluge selidbe', nameEN: 'Complete moving services', sortOrder: 1 },
          { key: 'tesk-namestaj', nameBS: 'Selidba teškog nameštaja', nameEN: 'Heavy furniture moving', sortOrder: 2 },
          { key: 'bela-tehnika', nameBS: 'Selidba bele tehnike', nameEN: 'Appliance moving', sortOrder: 3 },
          { key: 'otpad', nameBS: 'Odnošenje otpada', nameEN: 'Waste removal', sortOrder: 4 },
        ]
      },
      {
        key: 'ciscenje-odrzavanje',
        nameBS: 'Čišćenje i održavanje',
        nameEN: 'Cleaning and maintenance',
        sortOrder: 3,
        isPopular: true,
        children: [
          { key: 'redovno-ciscenje', nameBS: 'Redovno čišćenje', nameEN: 'Regular cleaning', sortOrder: 1 },
          { key: 'dubinsko-ciscenje', nameBS: 'Dubinsko čišćenje', nameEN: 'Deep cleaning', sortOrder: 2 },
          { key: 'ciscenje-renoviranja', nameBS: 'Čišćenje nakon renoviranja', nameEN: 'Post-renovation cleaning', sortOrder: 3 },
        ]
      },
      {
        key: 'technology',
        nameBS: 'Tehnologija',
        nameEN: 'Technology',
        sortOrder: 4,
        isPopular: false,
        children: [
          { key: 'software-development', nameBS: 'Razvoj softvera', nameEN: 'Software Development', sortOrder: 1 },
          { key: 'it-support', nameBS: 'IT podrška', nameEN: 'IT Support', sortOrder: 2 },
          { key: 'web-design', nameBS: 'Web dizajn', nameEN: 'Web Design', sortOrder: 3 },
        ]
      },
      {
        key: 'sales',
        nameBS: 'Prodaja',
        nameEN: 'Sales',
        sortOrder: 5,
        isPopular: false,
        children: [
          { key: 'retail', nameBS: 'Maloprodaja', nameEN: 'Retail', sortOrder: 1 },
          { key: 'business-development', nameBS: 'Razvoj poslovanja', nameEN: 'Business Development', sortOrder: 2 },
        ]
      },
      {
        key: 'healthcare',
        nameBS: 'Zdravstvo',
        nameEN: 'Healthcare',
        sortOrder: 6,
        isPopular: false,
        children: [
          { key: 'nursing', nameBS: 'Njega', nameEN: 'Nursing', sortOrder: 1 },
          { key: 'medical-admin', nameBS: 'Medicinska administracija', nameEN: 'Medical Administration', sortOrder: 2 },
        ]
      },
      {
        key: 'education',
        nameBS: 'Obrazovanje',
        nameEN: 'Education',
        sortOrder: 7,
        isPopular: false,
        children: [
          { key: 'tutoring', nameBS: 'Privatni časovi', nameEN: 'Tutoring', sortOrder: 1 },
          { key: 'teaching', nameBS: 'Predavanje', nameEN: 'Teaching', sortOrder: 2 },
        ]
      },
      {
        key: 'hospitality',
        nameBS: 'Ugostiteljstvo',
        nameEN: 'Hospitality',
        sortOrder: 8,
        isPopular: false,
        children: [
          { key: 'waiter', nameBS: 'Konobar/ica', nameEN: 'Waiter/Waitress', sortOrder: 1 },
          { key: 'chef', nameBS: 'Kuhar/ica', nameEN: 'Chef/Cook', sortOrder: 2 },
          { key: 'bartender', nameBS: 'Barmen/ka', nameEN: 'Bartender', sortOrder: 3 },
        ]
      }
    ]

    // Create parent categories first
    for (const category of categoryData) {
      const parent = await prisma.category.create({
        data: {
          key: category.key,
          nameBS: category.nameBS,
          nameEN: category.nameEN,
          sortOrder: category.sortOrder,
          isPopular: category.isPopular || false,
          isActive: true,
        }
      })

      // Create child categories
      for (const child of category.children || []) {
        await prisma.category.create({
          data: {
            key: child.key,
            nameBS: child.nameBS,
            nameEN: child.nameEN,
            sortOrder: child.sortOrder,
            isPopular: false,
            isActive: true,
            parentId: parent.id,
          }
        })
      }

      console.log(`✅ Created category: ${category.nameEN} with ${category.children?.length || 0} subcategories`)
    }

    // Count final results
    const totalCategories = await prisma.category.count()
    const parentCategories = await prisma.category.count({ where: { parentId: null } })
    const childCategories = await prisma.category.count({ where: { parentId: { not: null } } })
    const popularCategories = await prisma.category.count({ where: { isPopular: true } })

    console.log('🎉 Categories update completed!')
    console.log(`📈 Summary:`)
    console.log(`   - Total categories: ${totalCategories}`)
    console.log(`   - Parent categories: ${parentCategories}`)
    console.log(`   - Child categories: ${childCategories}`)
    console.log(`   - Popular categories: ${popularCategories}`)
    
  } catch (error) {
    console.error('❌ Error updating categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCategories()
