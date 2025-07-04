import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Categories data for Bosnia and Herzegovina job market
const categories = [
  {
    key: 'information-technology',
    nameBS: 'Informacijske tehnologije',
    nameEN: 'Information Technology',
    description: 'Software development, IT support, system administration',
    icon: '💻',
    color: '#3B82F6',
    sortOrder: 1,
    isPopular: true
  },
  {
    key: 'sales-marketing',
    nameBS: 'Prodaja i marketing',
    nameEN: 'Sales & Marketing',
    description: 'Sales representatives, marketing specialists, customer service',
    icon: '📈',
    color: '#10B981',
    sortOrder: 2,
    isPopular: true
  },
  {
    key: 'finance-accounting',
    nameBS: 'Finansije i računovodstvo',
    nameEN: 'Finance & Accounting',
    description: 'Accountants, financial analysts, bookkeepers',
    icon: '💰',
    color: '#F59E0B',
    sortOrder: 3,
    isPopular: true
  },
  {
    key: 'healthcare',
    nameBS: 'Zdravstvo',
    nameEN: 'Healthcare',
    description: 'Doctors, nurses, medical technicians, pharmacists',
    icon: '🏥',
    color: '#EF4444',
    sortOrder: 4,
    isPopular: true
  },
  {
    key: 'education',
    nameBS: 'Obrazovanje',
    nameEN: 'Education',
    description: 'Teachers, professors, tutors, educational support',
    icon: '📚',
    color: '#8B5CF6',
    sortOrder: 5,
    isPopular: true
  },
  {
    key: 'construction',
    nameBS: 'Građevinarstvo',
    nameEN: 'Construction',
    description: 'Construction workers, engineers, architects, project managers',
    icon: '🏗️',
    color: '#F97316',
    sortOrder: 6,
    isPopular: true
  },
  {
    key: 'hospitality-tourism',
    nameBS: 'Ugostiteljstvo i turizam',
    nameEN: 'Hospitality & Tourism',
    description: 'Hotel staff, restaurant workers, tour guides, travel agents',
    icon: '🏨',
    color: '#06B6D4',
    sortOrder: 7,
    isPopular: false
  },
  {
    key: 'manufacturing',
    nameBS: 'Proizvodnja',
    nameEN: 'Manufacturing',
    description: 'Factory workers, quality control, machine operators',
    icon: '🏭',
    color: '#64748B',
    sortOrder: 8,
    isPopular: false
  },
  {
    key: 'transportation-logistics',
    nameBS: 'Transport i logistika',
    nameEN: 'Transportation & Logistics',
    description: 'Drivers, warehouse workers, logistics coordinators',
    icon: '🚛',
    color: '#84CC16',
    sortOrder: 9,
    isPopular: false
  },
  {
    key: 'customer-service',
    nameBS: 'Korisničke usluge',
    nameEN: 'Customer Service',
    description: 'Call center agents, support representatives, help desk',
    icon: '📞',
    color: '#EC4899',
    sortOrder: 10,
    isPopular: false
  },
  {
    key: 'administration',
    nameBS: 'Administracija',
    nameEN: 'Administration',
    description: 'Office clerks, administrative assistants, data entry',
    icon: '📋',
    color: '#6B7280',
    sortOrder: 11,
    isPopular: false
  },
  {
    key: 'retail',
    nameBS: 'Maloprodaja',
    nameEN: 'Retail',
    description: 'Shop assistants, cashiers, store managers',
    icon: '🛍️',
    color: '#F43F5E',
    sortOrder: 12,
    isPopular: false
  },
  {
    key: 'agriculture',
    nameBS: 'Poljoprivreda',
    nameEN: 'Agriculture',
    description: 'Farm workers, agricultural technicians, livestock care',
    icon: '🌾',
    color: '#22C55E',
    sortOrder: 13,
    isPopular: false
  },
  {
    key: 'security',
    nameBS: 'Sigurnost',
    nameEN: 'Security',
    description: 'Security guards, safety officers, surveillance',
    icon: '🛡️',
    color: '#374151',
    sortOrder: 14,
    isPopular: false
  },
  {
    key: 'cleaning-maintenance',
    nameBS: 'Čišćenje i održavanje',
    nameEN: 'Cleaning & Maintenance',
    description: 'Cleaners, janitors, maintenance workers',
    icon: '🧹',
    color: '#9CA3AF',
    sortOrder: 15,
    isPopular: false
  }
];

// Cities data for Bosnia and Herzegovina
const cities = [
  // Major cities (isSpecial: true)
  {
    key: 'sarajevo',
    nameBS: 'Sarajevo',
    nameEN: 'Sarajevo',
    latitude: 43.8563,
    longitude: 18.4131,
    isSpecial: true,
    sortOrder: 1
  },
  {
    key: 'banja-luka',
    nameBS: 'Banja Luka',
    nameEN: 'Banja Luka',
    latitude: 44.7666,
    longitude: 17.1833,
    isSpecial: true,
    sortOrder: 2
  },
  {
    key: 'tuzla',
    nameBS: 'Tuzla',
    nameEN: 'Tuzla',
    latitude: 44.5369,
    longitude: 18.6739,
    isSpecial: true,
    sortOrder: 3
  },
  {
    key: 'zenica',
    nameBS: 'Zenica',
    nameEN: 'Zenica',
    latitude: 44.2014,
    longitude: 17.9061,
    isSpecial: true,
    sortOrder: 4
  },
  {
    key: 'mostar',
    nameBS: 'Mostar',
    nameEN: 'Mostar',
    latitude: 43.3438,
    longitude: 17.8078,
    isSpecial: true,
    sortOrder: 5
  },
  // Other important cities
  {
    key: 'bijeljina',
    nameBS: 'Bijeljina',
    nameEN: 'Bijeljina',
    latitude: 44.7597,
    longitude: 19.2133,
    isSpecial: false,
    sortOrder: 6
  },
  {
    key: 'doboj',
    nameBS: 'Doboj',
    nameEN: 'Doboj',
    latitude: 44.7311,
    longitude: 18.0869,
    isSpecial: false,
    sortOrder: 7
  },
  {
    key: 'cazin',
    nameBS: 'Cazin',
    nameEN: 'Cazin',
    latitude: 44.9667,
    longitude: 15.9500,
    isSpecial: false,
    sortOrder: 8
  },
  {
    key: 'velika-kladusa',
    nameBS: 'Velika Kladuša',
    nameEN: 'Velika Kladuša',
    latitude: 45.1833,
    longitude: 15.8167,
    isSpecial: false,
    sortOrder: 9
  },
  {
    key: 'visoko',
    nameBS: 'Visoko',
    nameEN: 'Visoko',
    latitude: 43.9889,
    longitude: 18.1833,
    isSpecial: false,
    sortOrder: 10
  },
  {
    key: 'travnik',
    nameBS: 'Travnik',
    nameEN: 'Travnik',
    latitude: 44.2289,
    longitude: 17.6661,
    isSpecial: false,
    sortOrder: 11
  },
  {
    key: 'lukavac',
    nameBS: 'Lukavac',
    nameEN: 'Lukavac',
    latitude: 44.5458,
    longitude: 18.5286,
    isSpecial: false,
    sortOrder: 12
  },
  {
    key: 'zivinice',
    nameBS: 'Živinice',
    nameEN: 'Živinice',
    latitude: 44.4511,
    longitude: 18.6489,
    isSpecial: false,
    sortOrder: 13
  },
  {
    key: 'gracanica',
    nameBS: 'Gračanica',
    nameEN: 'Gračanica',
    latitude: 44.7014,
    longitude: 18.3128,
    isSpecial: false,
    sortOrder: 14
  },
  {
    key: 'gradacac',
    nameBS: 'Gradačac',
    nameEN: 'Gradačac',
    latitude: 44.8792,
    longitude: 18.4258,
    isSpecial: false,
    sortOrder: 15
  },
  {
    key: 'brcko',
    nameBS: 'Brčko',
    nameEN: 'Brčko',
    latitude: 44.8667,
    longitude: 18.8000,
    isSpecial: false,
    sortOrder: 16
  },
  {
    key: 'prijedor',
    nameBS: 'Prijedor',
    nameEN: 'Prijedor',
    latitude: 44.9800,
    longitude: 16.7119,
    isSpecial: false,
    sortOrder: 17
  },
  {
    key: 'trebinje',
    nameBS: 'Trebinje',
    nameEN: 'Trebinje',
    latitude: 42.7097,
    longitude: 18.3439,
    isSpecial: false,
    sortOrder: 18
  },
  {
    key: 'konjic',
    nameBS: 'Konjic',
    nameEN: 'Konjic',
    latitude: 43.6514,
    longitude: 17.9639,
    isSpecial: false,
    sortOrder: 19
  },
  {
    key: 'capljina',
    nameBS: 'Čapljina',
    nameEN: 'Čapljina',
    latitude: 43.1181,
    longitude: 17.7161,
    isSpecial: false,
    sortOrder: 20
  }
];

async function seedCategoriesAndCities() {
  try {
    console.log('🌱 Starting seed process...');

    // Clear existing data
    console.log('🗑️  Clearing existing categories and cities...');
    await prisma.category.deleteMany();
    await prisma.city.deleteMany();

    // Seed categories
    console.log('📂 Seeding categories...');
    for (const category of categories) {
      await prisma.category.create({
        data: category
      });
      console.log(`✅ Created category: ${category.nameEN} (${category.nameBS})`);
    }

    // Seed cities
    console.log('🏙️  Seeding cities...');
    for (const city of cities) {
      await prisma.city.create({
        data: city
      });
      console.log(`✅ Created city: ${city.nameEN} (${city.nameBS})`);
    }

    console.log('🎉 Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Cities: ${cities.length}`);
    console.log(`   - Popular categories: ${categories.filter(c => c.isPopular).length}`);
    console.log(`   - Special cities: ${cities.filter(c => c.isSpecial).length}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategoriesAndCities();
