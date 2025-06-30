#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const employers = [
  { name: 'Marko Petrović', email: 'marko@techcorp.ba', company: 'TechCorp BiH' },
  { name: 'Ana Jovanović', email: 'ana@webdev.ba', company: 'WebDev Studio' },
  { name: 'Stefan Nikolić', email: 'stefan@digitalinnovations.ba', company: 'Digital Innovations' },
  { name: 'Milica Đurić', email: 'milica@fintech.ba', company: 'Fintech Solutions' },
  { name: 'Nemanja Stojanović', email: 'nemanja@gamedev.ba', company: 'Gaming Studio BiH' },
  { name: 'Jelena Milosavljević', email: 'jelena@consulting.ba', company: 'Consulting Group BiH' },
  { name: 'Miloš Radovanović', email: 'milos@startup.ba', company: 'StartUp Incubator' },
  { name: 'Tijana Popović', email: 'tijana@marketing.ba', company: 'Marketing Pro Agency' },
  { name: 'Aleksandar Milić', email: 'aleksandar@cloudtech.ba', company: 'CloudSystems Ltd' },
  { name: 'Jovana Stanković', email: 'jovana@aitech.ba', company: 'AI Solutions BiH' },
  { name: 'Dragan Kostić', email: 'dragan@mobiledev.ba', company: 'MobileDev Hub' },
  { name: 'Marija Živković', email: 'marija@datacorp.ba', company: 'DataTech Bosnia' },
  { name: 'Nikola Vasić', email: 'nikola@itsolutions.ba', company: 'IT Solutions Pro' },
  { name: 'Sofija Rašić', email: 'sofija@designstudio.ba', company: 'Creative Studio' },
  { name: 'Vladimir Đorđević', email: 'vladimir@ecommerce.ba', company: 'E-commerce Plus' }
]

const companies = [
  { name: 'BiH Tech Solutions', email: 'info@bihtech.ba', companyName: 'BiH Tech Solutions' },
  { name: 'Sarajevo Digital', email: 'contact@sarajevodigital.ba', companyName: 'Sarajevo Digital' },
  { name: 'Mostar Innovation Hub', email: 'hello@mostarhub.ba', companyName: 'Mostar Innovation Hub' },
  { name: 'Tuzla Development Center', email: 'info@tuzladev.ba', companyName: 'Tuzla Development Center' },
  { name: 'Banja Luka Software', email: 'contact@blsoftware.ba', companyName: 'Banja Luka Software' }
]

const jobSeekers = [
  { name: 'Petar Marković', email: 'petar.markovic@gmail.com' },
  { name: 'Milena Stanić', email: 'milena.stanic@outlook.com' },
  { name: 'Igor Božović', email: 'igor.bozovic@yahoo.com' },
  { name: 'Tamara Jovanović', email: 'tamara.jovanovic@gmail.com' },
  { name: 'Bojan Ristić', email: 'bojan.ristic@hotmail.com' },
  { name: 'Katarina Spasić', email: 'katarina.spasic@gmail.com' },
  { name: 'Mihailo Petković', email: 'mihailo.petkovic@outlook.com' },
  { name: 'Jelena Simić', email: 'jelena.simic@yahoo.com' },
  { name: 'Uroš Milošević', email: 'uros.milosevic@gmail.com' },
  { name: 'Danijela Nikolić', email: 'danijela.nikolic@hotmail.com' },
  { name: 'Filip Stojanović', email: 'filip.stojanovic@gmail.com' },
  { name: 'Isidora Pavlović', email: 'isidora.pavlovic@outlook.com' },
  { name: 'Marko Radivojević', email: 'marko.radivojevic@yahoo.com' },
  { name: 'Anastasija Đurić', email: 'anastasija.djuric@gmail.com' },
  { name: 'Stefan Milenković', email: 'stefan.milenkovic@hotmail.com' },
  { name: 'Milica Obradović', email: 'milica.obradovic@gmail.com' },
  { name: 'Luka Jovanović', email: 'luka.jovanovic@outlook.com' },
  { name: 'Teodora Kostić', email: 'teodora.kostic@yahoo.com' },
  { name: 'Nemanja Živković', email: 'nemanja.zivkovic@gmail.com' },
  { name: 'Jovana Mitrović', email: 'jovana.mitrovic@hotmail.com' }
]

async function seedUsers() {
  try {
    console.log('👥 Starting to seed users for all types...\n')

    const defaultPassword = await bcrypt.hash('password123', 12)

    // Create employers
    console.log('🏢 Creating employers...')
    for (const employer of employers) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: employer.email }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: employer.name,
              email: employer.email,
              password: defaultPassword,
              role: 'employer',
              companyName: employer.company
            }
          })
          console.log(`✅ Created employer: ${employer.name} (${employer.company})`)
        } else {
          console.log(`⚠️  Employer already exists: ${employer.email}`)
        }
      } catch (error) {
        console.log(`❌ Failed to create employer ${employer.email}:`, error)
      }
    }

    // Create companies
    console.log('\n🏛️  Creating company accounts...')
    for (const company of companies) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: company.email }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: company.name,
              email: company.email,
              password: defaultPassword,
              role: 'company',
              companyName: company.companyName
            }
          })
          console.log(`✅ Created company: ${company.name}`)
        } else {
          console.log(`⚠️  Company already exists: ${company.email}`)
        }
      } catch (error) {
        console.log(`❌ Failed to create company ${company.email}:`, error)
      }
    }

    // Create job seekers
    console.log('\n👤 Creating job seekers...')
    for (const jobSeeker of jobSeekers) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: jobSeeker.email }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: jobSeeker.name,
              email: jobSeeker.email,
              password: defaultPassword,
              role: 'employee'
            }
          })
          console.log(`✅ Created job seeker: ${jobSeeker.name}`)
        } else {
          console.log(`⚠️  Job seeker already exists: ${jobSeeker.email}`)
        }
      } catch (error) {
        console.log(`❌ Failed to create job seeker ${jobSeeker.email}:`, error)
      }
    }

    // Show final statistics
    console.log('\n📊 Final user statistics:')
    const totalUsers = await prisma.user.count()
    const employerCount = await prisma.user.count({ where: { role: 'employer' } })
    const employeeCount = await prisma.user.count({ where: { role: 'employee' } })
    const companyCount = await prisma.user.count({ where: { role: 'company' } })
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })

    console.log(`   • Total users: ${totalUsers}`)
    console.log(`   • Employers: ${employerCount}`)
    console.log(`   • Companies: ${companyCount}`)
    console.log(`   • Job seekers: ${employeeCount}`)
    console.log(`   • Admins: ${adminCount}`)

    console.log('\n🎉 User seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('\n✨ User seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 User seeding failed:', error)
      process.exit(1)
    })
}

export { seedUsers }
