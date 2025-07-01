#!/usr/bin/env tsx

/**
 * Comprehensive Database Seeding Script
 * 
 * This script seeds the database with:
 * - Cities and categories
 * - Test users (admin, clients, taskers)
 * - Sample job listings
 * 
 * Usage: npx tsx scripts/seed-comprehensive.ts
 */

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Sample data
const cities = [
  { key: 'sarajevo', nameBS: 'Sarajevo', nameEN: 'Sarajevo', latitude: 43.8563, longitude: 18.4131, sortOrder: 1 },
  { key: 'banja-luka', nameBS: 'Banja Luka', nameEN: 'Banja Luka', latitude: 44.7666, longitude: 17.1739, sortOrder: 2 },
  { key: 'tuzla', nameBS: 'Tuzla', nameEN: 'Tuzla', latitude: 44.5386, longitude: 18.6672, sortOrder: 3 },
  { key: 'zenica', nameBS: 'Zenica', nameEN: 'Zenica', latitude: 44.2039, longitude: 17.9060, sortOrder: 4 },
  { key: 'mostar', nameBS: 'Mostar', nameEN: 'Mostar', latitude: 43.3438, longitude: 17.8078, sortOrder: 5 },
  { key: 'bijeljina', nameBS: 'Bijeljina', nameEN: 'Bijeljina', latitude: 44.7594, longitude: 19.2144, sortOrder: 6 },
  { key: 'prijedor', nameBS: 'Prijedor', nameEN: 'Prijedor', latitude: 44.9799, longitude: 16.7120, sortOrder: 7 },
  { key: 'doboj', nameBS: 'Doboj', nameEN: 'Doboj', latitude: 44.7320, longitude: 18.0870, sortOrder: 8 }
]

const categories = [
  { key: 'information-technology', nameBS: 'Informacione tehnologije', nameEN: 'Information Technology', sortOrder: 1 },
  { key: 'construction-trades', nameBS: 'Građevinarstvo i zanati', nameEN: 'Construction & Trades', sortOrder: 2 },
  { key: 'healthcare-medicine', nameBS: 'Zdravstvo i medicina', nameEN: 'Healthcare & Medicine', sortOrder: 3 },
  { key: 'education-training', nameBS: 'Obrazovanje i obuka', nameEN: 'Education & Training', sortOrder: 4 },
  { key: 'sales-marketing', nameBS: 'Prodaja i marketing', nameEN: 'Sales & Marketing', sortOrder: 5 },
  { key: 'finance-accounting', nameBS: 'Finansije i računovodstvo', nameEN: 'Finance & Accounting', sortOrder: 6 },
  { key: 'customer-service', nameBS: 'Usluge korisnicima', nameEN: 'Customer Service', sortOrder: 7 },
  { key: 'transportation-logistics', nameBS: 'Transport i logistika', nameEN: 'Transportation & Logistics', sortOrder: 8 },
  { key: 'manufacturing-production', nameBS: 'Proizvodnja', nameEN: 'Manufacturing & Production', sortOrder: 9 },
  { key: 'design-creative', nameBS: 'Dizajn i kreativnost', nameEN: 'Design & Creative', sortOrder: 10 },
  { key: 'engineering', nameBS: 'Inženjerstvo', nameEN: 'Engineering', sortOrder: 11 },
  { key: 'hospitality-tourism', nameBS: 'Ugostiteljstvo i turizam', nameEN: 'Hospitality & Tourism', sortOrder: 12 },
  { key: 'legal-services', nameBS: 'Pravne usluge', nameEN: 'Legal Services', sortOrder: 13 },
  { key: 'administrative-support', nameBS: 'Administrativna podrška', nameEN: 'Administrative Support', sortOrder: 14 },
  { key: 'consulting-strategy', nameBS: 'Konsalting i strategija', nameEN: 'Consulting & Strategy', sortOrder: 15 }
]

const clients = [
  { name: 'Marko Petrović', email: 'marko@techcorp.ba', company: 'TechCorp BiH' },
  { name: 'Ana Jovanović', email: 'ana@webdev.ba', company: 'WebDev Studio' },
  { name: 'Stefan Nikolić', email: 'stefan@digital.ba', company: 'Digital Innovations' }
]

const companies = [
  { name: 'Milica Đurić', email: 'milica@fintech.ba', company: 'Fintech Solutions' },
  { name: 'Nemanja Stojanović', email: 'nemanja@gamedev.ba', company: 'Gaming Studio BiH' },
  { name: 'Aleksandra Mitrović', email: 'aleksandra@construction.ba', company: 'BuildCorp BiH' }
]

const taskers = [
  { name: 'Petar Marković', email: 'petar.worker@test.com', skills: 'JavaScript, React, Node.js' },
  { name: 'Milena Savić', email: 'milena.dev@test.com', skills: 'Python, Django, PostgreSQL' },
  { name: 'Stefan Popović', email: 'stefan.builder@test.com', skills: 'Construction, Carpentry' },
  { name: 'Jelena Kostić', email: 'jelena.designer@test.com', skills: 'UI/UX Design, Figma, Adobe' },
  { name: 'Miloš Đorđević', email: 'milos.analyst@test.com', skills: 'Data Analysis, Excel, SQL' }
]

const jobTemplates = [
  {
    title: 'Frontend Developer',
    description: 'We are looking for a skilled Frontend Developer to join our team.',
    requirements: 'Experience with React, TypeScript, and modern CSS frameworks.',
    benefits: 'Competitive salary, flexible working hours, remote work options.',
    type: 'full_time' as const,
    salaryMin: 2500,
    salaryMax: 4000
  },
  {
    title: 'Marketing Specialist',
    description: 'Digital marketing specialist needed for growing startup.',
    requirements: 'Experience with social media marketing and Google Ads.',
    benefits: 'Creative environment, professional development, health insurance.',
    type: 'full_time' as const,
    salaryMin: 2000,
    salaryMax: 3500
  },
  {
    title: 'Quick Task Helper',
    description: 'Need someone for a quick task - data entry and basic admin work.',
    requirements: 'Basic computer skills and attention to detail.',
    benefits: 'Flexible timing, quick payment, good for side income.',
    type: 'quick_job' as const,
    salaryMin: 20,
    salaryMax: 50
  }
]

async function seedCities() {
  console.log('🏙️ Seeding cities...')
  
  for (const city of cities) {
    await prisma.city.upsert({
      where: { key: city.key },
      update: city,
      create: city
    })
  }
  
  console.log(`✅ Seeded ${cities.length} cities`)
}

async function seedCategories() {
  console.log('📂 Seeding categories...')
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: category,
      create: category
    })
  }
  
  console.log(`✅ Seeded ${categories.length} categories`)
}

async function seedUsers() {
  console.log('👥 Seeding users...')
  
  const defaultPassword = await bcrypt.hash('Password123!', 12)
  
  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@poslic.com' },
    update: {},
    create: {
      email: 'admin@poslic.com',
      username: 'admin',
      name: 'Administrator',
      password: defaultPassword,
      role: 'admin' as UserRole
    }
  })
  
  // Create client users
  for (const client of clients) {
    await prisma.user.upsert({
      where: { email: client.email },
      update: {},
      create: {
        email: client.email,
        username: client.email.split('@')[0],
        name: client.name,
        password: defaultPassword,
        role: 'client' as UserRole,
        companyName: client.company
      }
    })
  }
  
  // Create company users
  for (const company of companies) {
    await prisma.user.upsert({
      where: { email: company.email },
      update: {},
      create: {
        email: company.email,
        username: company.email.split('@')[0],
        name: company.name,
        password: defaultPassword,
        role: 'company' as UserRole,
        companyName: company.company
      }
    })
  }
  
  // Create tasker users
  for (const tasker of taskers) {
    await prisma.user.upsert({
      where: { email: tasker.email },
      update: {},
      create: {
        email: tasker.email,
        username: tasker.email.split('@')[0],
        name: tasker.name,
        password: defaultPassword,
        role: 'tasker' as UserRole,
        skills: tasker.skills
      }
    })
  }
  
  console.log(`✅ Seeded ${1 + clients.length + companies.length + taskers.length} users`)
}

async function seedJobs() {
  console.log('💼 Seeding job listings...')
  
  // Get some client and company users to post jobs
  const clientUsers = await prisma.user.findMany({
    where: { 
      role: { 
        in: ['client' as UserRole, 'company' as UserRole] 
      } 
    },
    take: 5
  })
  
  if (clientUsers.length === 0) {
    console.log('❌ No client users found. Skipping job seeding.')
    return
  }
  
  // Get some cities and categories
  const allCities = await prisma.city.findMany({ take: 5 })
  const allCategories = await prisma.category.findMany({ take: 10 })
  
  let jobCount = 0
  
  for (const template of jobTemplates) {
    for (let i = 0; i < 3; i++) {
      const randomClient = clientUsers[Math.floor(Math.random() * clientUsers.length)]
      const randomCity = allCities[Math.floor(Math.random() * allCities.length)]
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
      
      await prisma.jobListing.create({
        data: {
          title: template.title,
          description: template.description,
          requirements: template.requirements,
          benefits: template.benefits,
          type: template.type,
          salaryMin: template.salaryMin,
          salaryMax: template.salaryMax,
          company: randomClient.companyName || 'Sample Company',
          email: randomClient.email,
          contactEmail: randomClient.email,
          postedById: randomClient.id,
          cityId: randomCity.id,
          categoryId: randomCategory.id,
          transportation: 'provided'
        }
      })
      
      jobCount++
    }
  }
  
  console.log(`✅ Seeded ${jobCount} job listings`)
}

async function main() {
  console.log('🚀 Starting comprehensive database seeding...')
  
  try {
    await seedCities()
    await seedCategories()
    await seedUsers()
    await seedJobs()
    
    // Print summary
    const stats = {
      cities: await prisma.city.count(),
      categories: await prisma.category.count(),
      users: await prisma.user.count(),
      jobs: await prisma.jobListing.count(),
      admins: await prisma.user.count({ where: { role: 'admin' as UserRole } }),
      clients: await prisma.user.count({ where: { role: 'client' as UserRole } }),
      companies: await prisma.user.count({ where: { role: 'company' as UserRole } }),
      taskers: await prisma.user.count({ where: { role: 'tasker' as UserRole } })
    }
    
    console.log('\n📊 Database seeding completed!')
    console.log('=' .repeat(40))
    console.log(`🏙️ Cities: ${stats.cities}`)
    console.log(`📂 Categories: ${stats.categories}`)
    console.log(`👥 Users: ${stats.users}`)
    console.log(`   • Admins: ${stats.admins}`)
    console.log(`   • Clients: ${stats.clients}`)
    console.log(`   • Companies: ${stats.companies}`)
    console.log(`   • Taskers: ${stats.taskers}`)
    console.log(`💼 Job Listings: ${stats.jobs}`)
    console.log('=' .repeat(40))
    console.log('\n🔑 Default login credentials:')
    console.log('📧 Email: admin@poslic.com')
    console.log('🔐 Password: Password123!')
    console.log('\n✨ All users use the same password: Password123!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

export { main as seedDatabase }
