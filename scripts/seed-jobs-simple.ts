#!/usr/bin/env tsx

import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// Sample job data
const jobTitles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'UX/UI Designer',
  'DevOps Engineer',
  'Quality Assurance Engineer',
  'Business Analyst',
  'Project Manager',
  'Marketing Manager',
  'Sales Representative',
  'Customer Support Specialist',
  'HR Specialist',
  'Accountant',
  'Graphic Designer',
  'Content Writer',
  'Digital Marketing Specialist',
  'System Administrator',
  'Database Administrator'
]

const companies = [
  'TechCorp BiH',
  'Sarajevo Software Solutions',
  'Banja Luka Tech',
  'Digital Innovations',
  'IT Solutions Pro',
  'WebDev Studio',
  'DataTech Bosnia',
  'CloudSystems Ltd',
  'AI Solutions BiH',
  'MobileDev Hub',
  'Fintech Solutions',
  'E-commerce Plus',
  'Gaming Studio BiH',
  'StartUp Incubator',
  'Consulting Group',
  'Design Agency',
  'Marketing Pro',
  'Business Solutions',
  'Enterprise Systems',
  'Innovation Lab'
]

const descriptions = [
  'Join our dynamic team and work on cutting-edge projects using the latest technologies. We offer excellent growth opportunities and a collaborative work environment.',
  'We are looking for a passionate professional to contribute to our innovative products. Remote work options available with flexible schedule.',
  'Exciting opportunity to work with modern tech stack and contribute to products used by thousands of users across Bosnia and Herzegovina.',
  'Be part of our growing team and help shape the future of technology in the region. Competitive salary and benefits package included.',
  'Work on challenging projects with international clients. Great learning opportunities and professional development programs available.',
  'Join a fast-paced startup environment where your ideas matter. Equity options and modern office space in the city center.',
  'Remote-first company looking for dedicated team members. Work-life balance is our priority with unlimited PTO policy.',
  'Established company with 10+ years of experience seeking talented individuals. Clear career progression path and mentorship programs.',
  'Contribute to open-source projects and work with the latest frameworks. Conference attendance and learning budget provided.',
  'International company with local presence. Opportunity to work with global teams and diverse client base.'
]

const requirements = [
  'Bachelor\'s degree in Computer Science or related field\n• 3+ years of relevant experience\n• Strong problem-solving skills\n• Excellent communication abilities',
  'Proven experience with modern development frameworks\n• Knowledge of database systems\n• Understanding of software development lifecycle\n• Team player with leadership potential',
  'Experience with cloud platforms (AWS, Azure, GCP)\n• Familiarity with DevOps practices\n• Strong analytical thinking\n• Fluency in English and Bosnian/Croatian/Serbian',
  'Portfolio demonstrating relevant skills\n• Experience with project management tools\n• Client-facing experience preferred\n• Continuous learning mindset',
  'Relevant certifications preferred\n• Experience in agile environments\n• Strong attention to detail\n• Ability to work under pressure'
]

const benefits = [
  'Competitive salary package\n• Health insurance\n• Flexible working hours\n• Professional development budget\n• Team building events',
  'Remote work options\n• Modern equipment provided\n• Gym membership\n• Free parking\n• Coffee and snacks',
  'Annual bonus based on performance\n• Conference attendance budget\n• Mentorship programs\n• Career advancement opportunities\n• Work-life balance',
  'Stock options\n• Additional vacation days\n• Training and certification support\n• International project exposure\n• Collaborative team environment',
  'Performance bonuses\n• Transportation allowance\n• Meal vouchers\n• Social events\n• Continuing education support'
]

const jobTypes = ['full_time', 'part_time', 'remote', 'quick_job']

const transportationOptions = ['provided', 'not_provided', 'employee_responsible', 'compensated']

function getRandomTransportation(): { transportation: string, amount?: number } {
  const option = getRandomElement(transportationOptions)
  if (option === 'compensated') {
    // Generate random compensation amount between 20-100 BAM
    const amount = Math.floor(Math.random() * 81) + 20 // 20-100
    return { transportation: option, amount }
  }
  return { transportation: option }
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomSalary(): string {
  const salaries = [
    '1500-2500 BAM',
    '2000-3000 BAM',
    '2500-4000 BAM',
    '3000-5000 BAM',
    '4000-6000 BAM',
    '5000-8000 BAM',
    'Competitive salary',
    'Based on experience'
  ]
  return getRandomElement(salaries)
}

function generateEmail(company: string): string {
  const domain = company.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
  return `jobs@${domain}.ba`
}

function generateWebsite(company: string): string {
  const domain = company.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
  return `https://www.${domain}.ba`
}

async function seedJobs() {
  try {
    console.log('🏢 Starting to seed dummy job posts...\n')

    // Get available cities
    const cities = await prisma.city.findMany({
      where: { isActive: true }
    })

    // Get or create a default user to post jobs
    let defaultUser = await prisma.user.findFirst({
      where: { role: 'client' as UserRole }
    })

    if (!defaultUser) {
      console.log('Creating default client user...')
      defaultUser = await prisma.user.create({
        data: {
          email: 'client@example.com',
          name: 'Default Client',
          role: 'client' as UserRole,
          companyName: 'Sample Company'
        }
      })
    }

    console.log(`📊 Found ${cities.length} cities`)
    console.log(`👤 Using user: ${defaultUser.name} (${defaultUser.email})\n`)

    // Create 20 dummy jobs
    for (let i = 0; i < 20; i++) {
      const title = getRandomElement(jobTitles)
      const company = getRandomElement(companies)
      const city = getRandomElement(cities)
      const type = getRandomElement(jobTypes) as 'full_time' | 'part_time' | 'remote' | 'quick_job'
      const transportationData = getRandomTransportation()
      
      const jobData = {
        title,
        company,
        cityId: city.id,
        type,
        description: getRandomElement(descriptions),
        requirements: getRandomElement(requirements),
        benefits: getRandomElement(benefits),
        salary: getRandomSalary(),
        email: generateEmail(company),
        website: Math.random() > 0.3 ? generateWebsite(company) : null, // 70% chance of website
        applicationUrl: Math.random() > 0.5 ? `https://apply.${company.toLowerCase().replace(/\s+/g, '')}.ba/jobs/${i + 1}` : null,
        contactEmail: Math.random() > 0.7 ? generateEmail(company) : null,
        transportation: transportationData.transportation,
        transportationAmount: transportationData.amount || null,
        isFeatured: Math.random() > 0.8, // 20% chance of being featured
        postedById: defaultUser.id,
        isActive: true,
        expiresAt: new Date(Date.now() + (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000) // 30-120 days from now
      }

      const job = await prisma.jobListing.create({
        data: jobData
      })

      // Fetch city info for display
      const cityInfo = await prisma.city.findUnique({ where: { id: job.cityId } })

      const cityName = cityInfo?.nameEN || 'Unknown City'
      const featured = job.isFeatured ? '⭐' : '  '
      
      console.log(`${featured} ✅ Created: "${job.title}" at ${job.company} | ${cityName} | ${job.type}`)
    }

    console.log('\n🎉 Successfully created 20 dummy job posts!')
    console.log('\n📋 Summary:')
    
    // Show summary statistics
    const totalJobs = await prisma.jobListing.count({ where: { isActive: true } })
    const featuredJobs = await prisma.jobListing.count({ where: { isActive: true, isFeatured: true } })
    
    const jobsByType = await prisma.jobListing.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { type: true }
    })

    const jobsByCity = await prisma.jobListing.groupBy({
      by: ['cityId'],
      where: { isActive: true },
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 5
    })

    console.log(`   • Total active jobs: ${totalJobs}`)
    console.log(`   • Featured jobs: ${featuredJobs}`)
    console.log('\n📊 Jobs by type:')
    for (const group of jobsByType) {
      console.log(`   • ${group.type}: ${group._count.type}`)
    }

    console.log('\n🏙️ Top 5 cities by job count:')
    for (const group of jobsByCity) {
      const city = await prisma.city.findUnique({ where: { id: group.cityId } })
      console.log(`   • ${city?.nameEN}: ${group._count.cityId}`)
    }

    console.log('\n🚀 Ready to test the job list with filters!')

  } catch (error) {
    console.error('❌ Error seeding jobs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedJobs()
    .then(() => {
      console.log('\n✨ Job seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Job seeding failed:', error)
      process.exit(1)
    })
}

export { seedJobs }
