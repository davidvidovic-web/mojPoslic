import { prisma } from '@/lib/prisma'

async function checkCategories() {
  console.log('Checking categories in database...')
  
  if (!prisma) {
    console.error('Prisma client not available')
    return
  }
  
  const totalCategories = await prisma.category.count()
  console.log('Total categories:', totalCategories)
  
  const parentCategories = await prisma.category.count({
    where: { parentId: null }
  })
  console.log('Parent categories (parentId = null):', parentCategories)
  
  const subcategories = await prisma.category.count({
    where: { parentId: { not: null } }
  })
  console.log('Subcategories (parentId != null):', subcategories)
  
  // Get a few examples of each
  const sampleParents = await prisma.category.findMany({
    where: { parentId: null },
    take: 3,
    select: { id: true, key: true, nameEN: true, parentId: true }
  })
  console.log('Sample parent categories:', sampleParents)
  
  const sampleSubs = await prisma.category.findMany({
    where: { parentId: { not: null } },
    take: 5,
    select: { id: true, key: true, nameEN: true, parentId: true }
  })
  console.log('Sample subcategories:', sampleSubs)
  
  await prisma.$disconnect()
}

checkCategories().catch(console.error)
