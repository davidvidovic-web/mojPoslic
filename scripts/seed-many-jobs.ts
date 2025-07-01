#!/usr/bin/env tsx

import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// Expanded job data for better variety
const jobTitles = [
  // Tech & Development
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer', 'Vue.js Developer',
  'Angular Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', 'C# Developer',
  'PHP Developer', 'Mobile App Developer', 'iOS Developer', 'Android Developer', 'Flutter Developer',
  'DevOps Engineer', 'Cloud Engineer', 'Infrastructure Engineer', 'Site Reliability Engineer',
  'Data Scientist', 'Data Engineer', 'Data Analyst', 'Machine Learning Engineer', 'AI Specialist',
  'Cybersecurity Specialist', 'Security Engineer', 'Penetration Tester', 'Network Administrator',
  'System Administrator', 'Database Administrator', 'Solutions Architect', 'Technical Lead',
  
  // Design & Creative
  'UX/UI Designer', 'Graphic Designer', 'Web Designer', 'Product Designer', 'Visual Designer',
  'Motion Graphics Designer', 'Brand Designer', 'Illustrator', 'Art Director',
  
  // Business & Management
  'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Product Owner',
  'Operations Manager', 'General Manager', 'Team Lead', 'Department Head',
  
  // Marketing & Sales
  'Digital Marketing Specialist', 'Content Marketing Manager', 'SEO Specialist', 'PPC Specialist',
  'Social Media Manager', 'Email Marketing Specialist', 'Growth Hacker', 'Brand Manager',
  'Sales Representative', 'Account Manager', 'Business Development Manager', 'Sales Manager',
  
  // Support & Service
  'Customer Support Specialist', 'Technical Support Engineer', 'Help Desk Technician',
  'Customer Success Manager', 'Community Manager',
  
  // HR & Finance
  'HR Specialist', 'Talent Acquisition Specialist', 'HR Business Partner', 'Recruiter',
  'Accountant', 'Financial Analyst', 'Controller', 'Bookkeeper',
  
  // Content & Writing
  'Content Writer', 'Technical Writer', 'Copywriter', 'Editor', 'Translator',
  'Communications Specialist', 'PR Specialist'
]

const companies = [
  // Tech Companies
  'TechCorp BiH', 'Sarajevo Software Solutions', 'Banja Luka Tech', 'Digital Innovations BiH',
  'IT Solutions Pro', 'WebDev Studio', 'DataTech Bosnia', 'CloudSystems Ltd', 'AI Solutions BiH',
  'MobileDev Hub', 'CodeCraft Studio', 'ByteWorks', 'PixelPerfect', 'DevMasters',
  
  // Fintech & Banking
  'Fintech Solutions', 'Digital Banking BiH', 'PayTech Solutions', 'CryptoTech', 'InsurTech Pro',
  
  // E-commerce & Retail
  'E-commerce Plus', 'ShopTech Solutions', 'RetailPro BiH', 'MarketPlace Systems',
  
  // Gaming & Entertainment
  'Gaming Studio BiH', 'Entertainment Tech', 'GameDev Hub', 'Interactive Media',
  
  // Consulting & Services
  'Consulting Group BiH', 'Business Solutions Pro', 'Enterprise Systems', 'Strategy Consultants',
  'Management Solutions', 'Digital Transformation Co',
  
  // Marketing & Advertising
  'Marketing Pro Agency', 'Digital Agency BiH', 'Creative Studio', 'Brand Solutions',
  'Social Media Hub', 'Content Creators Co',
  
  // Startups & Innovation
  'StartUp Incubator', 'Innovation Lab', 'TechHub Sarajevo', 'Venture Studio',
  'Accelerator BiH', 'Future Tech Solutions',
  
  // Traditional Industries
  'Manufacturing Solutions', 'Logistics Pro', 'Healthcare Tech', 'Education Innovation',
  'Real Estate Tech', 'Construction Digital', 'Energy Solutions BiH', 'Transport Systems',
  
  // International Companies
  'Global Tech Solutions', 'International Systems', 'Worldwide Digital', 'Euro Tech BiH',
  'Balkan Software House', 'Regional Innovation Center'
]

const descriptions = [
  'Join our dynamic team and work on cutting-edge projects using the latest technologies. We offer excellent growth opportunities and a collaborative work environment with modern tools and methodologies.',
  
  'We are looking for a passionate professional to contribute to our innovative products. Remote work options available with flexible schedule and work-life balance as our top priority.',
  
  'Exciting opportunity to work with modern tech stack and contribute to products used by thousands of users across Bosnia and Herzegovina and the broader region.',
  
  'Be part of our growing team and help shape the future of technology in the region. Competitive salary and comprehensive benefits package with health insurance and professional development budget.',
  
  'Work on challenging projects with international clients from Europe and North America. Great learning opportunities and professional development programs with conference attendance support.',
  
  'Join a fast-paced startup environment where your ideas matter and innovation is encouraged. Equity options available and modern office space in the city center with all amenities.',
  
  'Remote-first company looking for dedicated team members who value flexibility. Work-life balance is our priority with unlimited PTO policy and flexible working hours.',
  
  'Established company with 10+ years of experience seeking talented individuals to join our expanding team. Clear career progression path and comprehensive mentorship programs available.',
  
  'Contribute to open-source projects and work with the latest frameworks and technologies. Conference attendance budget, learning stipend, and time allocated for personal projects.',
  
  'International company with strong local presence looking for ambitious professionals. Opportunity to work with global teams, diverse client base, and cutting-edge technologies.',
  
  'Scale-up company in the growth phase offering unique opportunities for career advancement. Work on products that impact millions of users with direct access to leadership team.',
  
  'Join our mission to digitally transform traditional industries using modern technologies. Work with enterprise clients and implement solutions that make a real difference.',
  
  'Creative agency environment where design and technology meet. Collaborate with talented designers, developers, and strategists on award-winning projects for local and international brands.',
  
  'Data-driven company looking for analytical minds to help extract insights from complex datasets. Work with big data technologies and machine learning algorithms to solve real business problems.',
  
  'Fintech startup revolutionizing the financial services industry in the Balkans. Be part of building the next generation of financial products with focus on user experience and security.'
]

const requirements = [
  'Bachelor\'s degree in Computer Science, Engineering, or related field\n• 3+ years of professional experience in relevant technologies\n• Strong problem-solving and analytical skills\n• Excellent written and verbal communication abilities\n• Experience with version control systems (Git)\n• Knowledge of software development best practices',
  
  'Proven experience with modern development frameworks and libraries\n• Solid understanding of database design and management\n• Familiarity with software development lifecycle and agile methodologies\n• Team player with demonstrated leadership potential\n• Experience with testing frameworks and quality assurance practices',
  
  'Hands-on experience with cloud platforms (AWS, Azure, or Google Cloud)\n• Understanding of DevOps practices and CI/CD pipelines\n• Strong analytical thinking and attention to detail\n• Fluency in English and Bosnian/Croatian/Serbian languages\n• Experience with containerization technologies (Docker, Kubernetes)',
  
  'Portfolio demonstrating relevant skills and completed projects\n• Experience with project management tools (Jira, Trello, Asana)\n• Client-facing experience and strong presentation skills\n• Continuous learning mindset and passion for technology\n• Understanding of UX/UI principles and design thinking',
  
  'Relevant industry certifications preferred but not required\n• Experience working in agile/scrum environments\n• Strong attention to detail and quality orientation\n• Ability to work under pressure and meet tight deadlines\n• Experience with performance optimization and scalability',
  
  'Advanced knowledge of programming languages and frameworks\n• Experience with microservices architecture and distributed systems\n• Understanding of security best practices and data protection\n• Mentoring experience and ability to guide junior team members\n• Experience with monitoring and logging tools',
  
  'Master\'s degree preferred or equivalent practical experience\n• Experience with machine learning frameworks and data science tools\n• Knowledge of statistical analysis and data visualization\n• Experience with API design and integration\n• Understanding of business processes and requirements analysis'
]

const benefits = [
  'Competitive salary package with annual performance reviews\n• Comprehensive health insurance for you and your family\n• Flexible working hours and hybrid work options\n• Professional development budget (€2000 annually)\n• Team building events and company retreats\n• Modern office with free parking',
  
  'Remote work options with occasional office visits\n• Top-tier equipment provided (MacBook Pro, external monitors)\n• Gym membership or sports activities allowance\n• Free parking and public transport coverage\n• Unlimited coffee, snacks, and healthy meals\n• Birthday and work anniversary bonuses',
  
  'Annual performance bonus based on individual and company results\n• Conference attendance budget and learning sabbaticals\n• Comprehensive mentorship and career development programs\n• Stock options or equity participation\n• Additional vacation days based on tenure\n• Family-friendly policies and parental leave',
  
  'Startup equity package with growth potential\n• Flexible PTO policy and mental health support\n• Training and certification reimbursement\n• International project exposure and travel opportunities\n• Collaborative and innovative team environment\n• Modern office space with gaming area and relaxation zones',
  
  'Performance-based salary increases and bonuses\n• Transportation allowance or company car\n• Meal vouchers and catered lunches\n• Regular social events and team activities\n• Continuing education support and skills development\n• Life and disability insurance coverage',
  
  'Comprehensive benefits package including dental care\n• Flexible spending account for health expenses\n• 401(k) equivalent retirement savings plan\n• Professional coaching and leadership development\n• Innovation time (20% time for personal projects)\n• Relocation assistance for international candidates',
  
  'Competitive base salary plus commission structure\n• Health, dental, and vision insurance\n• Laptop and home office setup allowance\n• Quarterly team bonuses and recognition programs\n• Access to industry events and networking opportunities\n• Career advancement with clear promotion criteria'
]

const jobTypes = ['full_time', 'part_time', 'remote', 'quick_job']
const transportationOptions = ['provided', 'not_provided', 'tasker_responsible', 'compensated']

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomSalary(): string {
  const salaries = [
    '1200-2000 BAM', '1500-2500 BAM', '2000-3000 BAM', '2500-3500 BAM',
    '3000-4500 BAM', '3500-5000 BAM', '4000-6000 BAM', '5000-7000 BAM',
    '6000-8000 BAM', '7000-10000 BAM', 'Competitive salary', 'Based on experience',
    '€1000-1500', '€1500-2500', '€2000-3000', '€2500-4000'
  ]
  return getRandomElement(salaries)
}

function generateEmail(company: string): string {
  const domain = company.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
  return `careers@${domain}.ba`
}

function generateWebsite(company: string): string {
  const domain = company.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
  return `https://www.${domain}.ba`
}

function generateApplicationUrl(company: string, jobId: number): string {
  const domain = company.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
  return `https://careers.${domain}.ba/positions/${jobId}`
}

function getRandomTransportationAmount(): number | null {
  // Generate random amounts between 50-500 BAM for compensated transportation
  const amounts = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
  return getRandomElement(amounts)
}

async function seedManyJobs() {
  try {
    console.log('🏢 Starting to seed many dummy job posts for pagination testing...\n')

    // Get available cities
    const cities = await prisma.city.findMany({
      where: { isActive: true }
    })

    if (cities.length === 0) {
      console.error('❌ No cities found. Please run city seeding first.')
      return
    }

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

    // Create 50 dummy jobs for better pagination testing
    const numberOfJobs = 50
    console.log(`🎯 Creating ${numberOfJobs} jobs...\n`)

    for (let i = 0; i < numberOfJobs; i++) {
      const title = getRandomElement(jobTitles)
      const company = getRandomElement(companies)
      const city = getRandomElement(cities)
      const type = getRandomElement(jobTypes) as 'full_time' | 'part_time' | 'remote' | 'quick_job'
      
      // Generate transportation data
      const transportation = getRandomElement(transportationOptions) as 'provided' | 'not_provided' | 'tasker_responsible' | 'compensated'
      const transportationAmount = transportation === 'compensated' ? getRandomTransportationAmount() : null
      
      // Create more realistic posting dates (spread over last 3 months)
      const daysAgo = Math.floor(Math.random() * 90)
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      
      const jobData = {
        title,
        company,
        cityId: city.id,
        type,
        transportation,
        transportationAmount,
        description: getRandomElement(descriptions),
        requirements: getRandomElement(requirements),
        benefits: getRandomElement(benefits),
        salary: getRandomSalary(),
        email: generateEmail(company),
        website: Math.random() > 0.2 ? generateWebsite(company) : null, // 80% chance of website
        applicationUrl: Math.random() > 0.4 ? generateApplicationUrl(company, i + 1) : null, // 60% chance
        contactEmail: Math.random() > 0.6 ? generateEmail(company) : null, // 40% chance
        isFeatured: Math.random() > 0.85, // 15% chance of being featured
        postedById: defaultUser.id,
        isActive: Math.random() > 0.05, // 95% active, 5% inactive for variety
        expiresAt: new Date(createdAt.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000), // 30-90 days from posting
        createdAt: createdAt,
        updatedAt: createdAt
      }

      const job = await prisma.jobListing.create({
        data: jobData
      })

      // Fetch city info for display
      const cityInfo = await prisma.city.findUnique({ where: { id: job.cityId } })

      const cityName = cityInfo?.nameEN || 'Unknown City'
      const featured = job.isFeatured ? '⭐' : '  '
      const status = job.isActive ? '✅' : '⏸️'
      
      console.log(`${featured} ${status} (${i + 1}/${numberOfJobs}) "${job.title}" at ${job.company} | ${cityName} | ${job.type}`)
    }

    console.log('\n🎉 Successfully created job posts for pagination testing!')
    console.log('\n📋 Summary:')
    
    // Show summary statistics
    const totalJobs = await prisma.jobListing.count()
    const activeJobs = await prisma.jobListing.count({ where: { isActive: true } })
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
      take: 10
    })

    console.log(`   • Total jobs: ${totalJobs}`)
    console.log(`   • Active jobs: ${activeJobs}`)
    console.log(`   • Featured jobs: ${featuredJobs}`)
    console.log('\n📊 Jobs by type:')
    for (const group of jobsByType) {
      console.log(`   • ${group.type.replace('_', '-')}: ${group._count.type}`)
    }

    console.log('\n🏙️ Top 10 cities by job count:')
    for (const group of jobsByCity) {
      const city = await prisma.city.findUnique({ where: { id: group.cityId } })
      console.log(`   • ${city?.nameEN}: ${group._count.cityId}`)
    }

    console.log('\n🚀 Perfect for testing pagination with 20+ items!')
    console.log('💡 You can now implement pagination with 10-20 items per page.')

  } catch (error) {
    console.error('❌ Error seeding jobs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedManyJobs()
    .then(() => {
      console.log('\n✨ Large job seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Large job seeding failed:', error)
      process.exit(1)
    })
}

export { seedManyJobs }
