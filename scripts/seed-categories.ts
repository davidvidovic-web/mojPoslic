#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'

interface CategoryData {
  key: string
  nameBS: string
  nameEN: string
  sortOrder: number
  isPopular?: boolean
  children?: {
    key: string
    nameBS: string
    nameEN: string
    sortOrder: number
  }[]
}

const categoryGroups: CategoryData[] = [
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
      { key: 'molerski-radovi', nameBS: 'Molerski radovi', nameEN: 'Painting work', sortOrder: 5 },
      { key: 'vodoinstalaterske', nameBS: 'Vodoinstalaterske usluge', nameEN: 'Plumbing services', sortOrder: 6 },
      { key: 'police-ormani', nameBS: 'Postavljanje polica i ormana', nameEN: 'Shelves and cabinets installation', sortOrder: 7 },
      { key: 'osvetljenje', nameBS: 'Instalacija osvetljenja', nameEN: 'Lighting installation', sortOrder: 8 },
      { key: 'elektricarske', nameBS: 'Električarske usluge', nameEN: 'Electrical services', sortOrder: 9 },
      { key: 'stolarske', nameBS: 'Stolarske usluge', nameEN: 'Carpentry services', sortOrder: 10 },
      { key: 'tapete', nameBS: 'Postavljanje tapeta', nameEN: 'Wallpaper installation', sortOrder: 11 },
      { key: 'zavese-roletne', nameBS: 'Postavljanje zavesa i roletni', nameEN: 'Curtains and blinds installation', sortOrder: 12 },
      { key: 'zvono-interfon', nameBS: 'Instalacija zvona i interfona', nameEN: 'Doorbell and intercom installation', sortOrder: 13 },
      { key: 'visinski-radovi', nameBS: 'Visinski radovi', nameEN: 'Height work', sortOrder: 14 },
      { key: 'adaptacija', nameBS: 'Adaptacija i renoviranje', nameEN: 'Adaptation and renovation', sortOrder: 15 },
      { key: 'staklorezac', nameBS: 'Staklorezačke usluge', nameEN: 'Glass cutting services', sortOrder: 16 },
      { key: 'zavarivacke', nameBS: 'Zavarivačke usluge', nameEN: 'Welding services', sortOrder: 17 },
      { key: 'keramicarske', nameBS: 'Keramičarske usluge', nameEN: 'Ceramic tiling services', sortOrder: 18 },
      { key: 'parketerski', nameBS: 'Parketerski radovi', nameEN: 'Parquet flooring work', sortOrder: 19 },
      { key: 'gipskartonski', nameBS: 'Gipskartonski radovi', nameEN: 'Drywall work', sortOrder: 20 },
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
      { key: 'pakovanje', nameBS: 'Pakovanje i raspakivanje', nameEN: 'Packing and unpacking', sortOrder: 2 },
      { key: 'tesk-namestaj', nameBS: 'Selidba teškog nameštaja', nameEN: 'Heavy furniture moving', sortOrder: 3 },
      { key: 'bela-tehnika', nameBS: 'Selidba bele tehnike', nameEN: 'Appliance moving', sortOrder: 4 },
      { key: 'pojedinacni-predmeti', nameBS: 'Prenošenje pojedinačnih predmeta', nameEN: 'Single item moving', sortOrder: 5 },
      { key: 'medjugradske-selidbe', nameBS: 'Međugradske selidbe', nameEN: 'Inter-city moving', sortOrder: 6 },
      { key: 'medjunarodne-selidbe', nameBS: 'Međunarodne selidbe', nameEN: 'International moving', sortOrder: 7 },
      { key: 'skladistenje', nameBS: 'Skladištenje stvari', nameEN: 'Storage services', sortOrder: 8 },
      { key: 'otpad', nameBS: 'Odnošenje otpada i starih stvari', nameEN: 'Waste and old item removal', sortOrder: 9 },
      { key: 'slep-sluzba', nameBS: 'Šlep služba', nameEN: 'Towing service', sortOrder: 10 },
      { key: 'kamionski-prevoz', nameBS: 'Kamionski prevoz', nameEN: 'Truck transport', sortOrder: 11 },
      { key: 'servis-tehnike', nameBS: 'Servis bele tehnike', nameEN: 'Appliance repair service', sortOrder: 12 },
    ]
  },
  {
    key: 'ciscenje-odrzavanje',
    nameBS: 'Čišćenje i održavanje',
    nameEN: 'Cleaning and maintenance',
    sortOrder: 3,
    isPopular: true,
    children: [
      { key: 'redovno-ciscenje', nameBS: 'Redovno čišćenje kuće/stana', nameEN: 'Regular house/apartment cleaning', sortOrder: 1 },
      { key: 'dubinsko-ciscenje', nameBS: 'Dubinsko čišćenje', nameEN: 'Deep cleaning', sortOrder: 2 },
      { key: 'useljenje-iseljenje', nameBS: 'Čišćenje prilikom useljenja/iseljenja', nameEN: 'Move-in/move-out cleaning', sortOrder: 3 },
      { key: 'nakon-renoviranja', nameBS: 'Čišćenje nakon renoviranja', nameEN: 'Post-renovation cleaning', sortOrder: 4 },
      { key: 'kancelarije', nameBS: 'Čišćenje kancelarija', nameEN: 'Office cleaning', sortOrder: 5 },
      { key: 'tepisi-namestaj', nameBS: 'Čišćenje tepiha i nameštaja', nameEN: 'Carpet and furniture cleaning', sortOrder: 6 },
      { key: 'prozori', nameBS: 'Pranje prozora', nameEN: 'Window washing', sortOrder: 7 },
      { key: 'pranje-peglanje', nameBS: 'Pranje i peglanje', nameEN: 'Washing and ironing', sortOrder: 8 },
      { key: 'automobili', nameBS: 'Pranje automobila', nameEN: 'Car washing', sortOrder: 9 },
      { key: 'garaze-podrumi', nameBS: 'Čišćenje garaža i podruma', nameEN: 'Garage and basement cleaning', sortOrder: 10 },
      { key: 'dezinfekcija', nameBS: 'Dezinfekcija prostora', nameEN: 'Space disinfection', sortOrder: 11 },
      { key: 'fasade', nameBS: 'Čišćenje fasada', nameEN: 'Facade cleaning', sortOrder: 12 },
    ]
  },
  {
    key: 'bastenske-usluge',
    nameBS: 'Baštenske usluge i dvorište',
    nameEN: 'Garden services and yard work',
    sortOrder: 4,
    children: [
      { key: 'uredjenje-baste', nameBS: 'Uređenje i održavanje bašte', nameEN: 'Garden design and maintenance', sortOrder: 1 },
      { key: 'kosenje-travnjaka', nameBS: 'Košenje travnjaka', nameEN: 'Lawn mowing', sortOrder: 2 },
      { key: 'orezivanje-drveca', nameBS: 'Orezivanje drveća i grmlja', nameEN: 'Tree and shrub pruning', sortOrder: 3 },
      { key: 'uklanjanje-korova', nameBS: 'Uklanjanje korova', nameEN: 'Weed removal', sortOrder: 4 },
      { key: 'sadnja-biljaka', nameBS: 'Sadnja biljaka i cveća', nameEN: 'Plant and flower planting', sortOrder: 5 },
      { key: 'navodnjavanje', nameBS: 'Postavljanje sistema za navodnjavanje', nameEN: 'Irrigation system installation', sortOrder: 6 },
      { key: 'oluk', nameBS: 'Čišćenje oluka', nameEN: 'Gutter cleaning', sortOrder: 7 },
      { key: 'sneg', nameBS: 'Uklanjanje snega', nameEN: 'Snow removal', sortOrder: 8 },
      { key: 'ograde', nameBS: 'Postavljanje ograde', nameEN: 'Fence installation', sortOrder: 9 },
      { key: 'namestaj-terasa', nameBS: 'Montaža nameštaja za terasu', nameEN: 'Patio furniture assembly', sortOrder: 10 },
      { key: 'bazeni', nameBS: 'Čišćenje bazena', nameEN: 'Pool cleaning', sortOrder: 11 },
      { key: 'zimske-baste', nameBS: 'Održavanje zimskih bašti', nameEN: 'Winter garden maintenance', sortOrder: 12 },
    ]
  },
  {
    key: 'dostava-kupovina',
    nameBS: 'Dostava i kupovina',
    nameEN: 'Delivery and shopping',
    sortOrder: 5,
    isPopular: true,
    children: [
      { key: 'hrana-namirnice', nameBS: 'Dostava hrane i namirnica', nameEN: 'Food and grocery delivery', sortOrder: 1 },
      { key: 'lekovi', nameBS: 'Dostava lekova', nameEN: 'Medicine delivery', sortOrder: 2 },
      { key: 'paketi', nameBS: 'Dostava paketa', nameEN: 'Package delivery', sortOrder: 3 },
      { key: 'ekspresna-dostava', nameBS: 'Ekspresna dostava', nameEN: 'Express delivery', sortOrder: 4 },
      { key: 'cvece', nameBS: 'Dostava cveća', nameEN: 'Flower delivery', sortOrder: 5 },
      { key: 'kupovina-umesto', nameBS: 'Kupovina umesto vas', nameEN: 'Shopping on your behalf', sortOrder: 6 },
      { key: 'cekanje-redovi', nameBS: 'Čekanje u redovima', nameEN: 'Waiting in lines', sortOrder: 7 },
      { key: 'placanje-racuna', nameBS: 'Plaćanje računa', nameEN: 'Bill payment', sortOrder: 8 },
      { key: 'vracanje-razmena', nameBS: 'Vraćanje i razmena proizvoda', nameEN: 'Product returns and exchanges', sortOrder: 9 },
      { key: 'dostava-firme', nameBS: 'Dostava za firme', nameEN: 'Business delivery', sortOrder: 10 },
    ]
  },
  {
    key: 'licna-nega',
    nameBS: 'Lična nega i wellness',
    nameEN: 'Personal care and wellness',
    sortOrder: 6,
    children: [
      { key: 'friziranje', nameBS: 'Friziranje kod kuće', nameEN: 'Home hairdressing', sortOrder: 1 },
      { key: 'manikir-pedikir', nameBS: 'Manikir i pedikir', nameEN: 'Manicure and pedicure', sortOrder: 2 },
      { key: 'masaza', nameBS: 'Masaža', nameEN: 'Massage', sortOrder: 3 },
      { key: 'fitness-treniranje', nameBS: 'Lična fitness treniranja', nameEN: 'Personal fitness training', sortOrder: 4 },
      { key: 'joga', nameBS: 'Joga instruktor', nameEN: 'Yoga instructor', sortOrder: 5 },
      { key: 'nutricionista', nameBS: 'Nutricionista konsultacije', nameEN: 'Nutritionist consultations', sortOrder: 6 },
      { key: 'medicinska-nega', nameBS: 'Medicinska nega kod kuće', nameEN: 'Home medical care', sortOrder: 7 },
      { key: 'fizioterapija', nameBS: 'Fizioterapija', nameEN: 'Physiotherapy', sortOrder: 8 },
      { key: 'stari-nemocni', nameBS: 'Pomoć starima i nemoćnima', nameEN: 'Assistance for elderly and disabled', sortOrder: 9 },
    ]
  },
  {
    key: 'cuvanje-edukacija',
    nameBS: 'Čuvanje i edukacija',
    nameEN: 'Childcare and education',
    sortOrder: 7,
    isPopular: true,
    children: [
      { key: 'cuvanje-dece', nameBS: 'Čuvanje dece (bejbisiting)', nameEN: 'Childcare (babysitting)', sortOrder: 1 },
      { key: 'cuvanje-starijih', nameBS: 'Čuvanje starijih', nameEN: 'Elderly care', sortOrder: 2 },
      { key: 'ljubimci', nameBS: 'Šetanje i čuvanje ljubimaca', nameEN: 'Pet walking and care', sortOrder: 3 },
      { key: 'privatni-casovi', nameBS: 'Privatni časovi (svi predmeti)', nameEN: 'Private lessons (all subjects)', sortOrder: 4 },
      { key: 'strani-jezici', nameBS: 'Učenje stranih jezika', nameEN: 'Foreign language learning', sortOrder: 5 },
      { key: 'muzika', nameBS: 'Instrukcije muzike', nameEN: 'Music lessons', sortOrder: 6 },
      { key: 'domaci-zadaci', nameBS: 'Pomoć oko domaćih zadataka', nameEN: 'Homework help', sortOrder: 7 },
      { key: 'priprema-ispiti', nameBS: 'Priprema za ispite', nameEN: 'Exam preparation', sortOrder: 8 },
      { key: 'obuka-racunara', nameBS: 'Obuka računara', nameEN: 'Computer training', sortOrder: 9 },
      { key: 'vozacki-kurs', nameBS: 'Vozački kursevi', nameEN: 'Driving courses', sortOrder: 10 },
    ]
  },
  {
    key: 'kreativne-usluge',
    nameBS: 'Kreativne i dizajnerske usluge',
    nameEN: 'Creative and design services',
    sortOrder: 8,
    children: [
      { key: 'graficki-dizajn', nameBS: 'Grafički dizajn', nameEN: 'Graphic design', sortOrder: 1 },
      { key: 'web-dizajn', nameBS: 'Web dizajn', nameEN: 'Web design', sortOrder: 2 },
      { key: 'dizajn-enterijera', nameBS: 'Dizajn enterijera', nameEN: 'Interior design', sortOrder: 3 },
      { key: 'arhitektonski', nameBS: 'Arhitektonski projekti', nameEN: 'Architectural projects', sortOrder: 4 },
      { key: 'fotografske', nameBS: 'Fotografske usluge', nameEN: 'Photography services', sortOrder: 5 },
      { key: 'video-produkcija', nameBS: 'Video produkcija', nameEN: 'Video production', sortOrder: 6 },
      { key: 'logotip', nameBS: 'Izrada logotipa', nameEN: 'Logo creation', sortOrder: 7 },
      { key: 'drustvene-mreze', nameBS: 'Kreiranje društvenih mreža', nameEN: 'Social media creation', sortOrder: 8 },
      { key: 'copywriting', nameBS: 'Copywriting', nameEN: 'Copywriting', sortOrder: 9 },
      { key: '3d-modelovanje', nameBS: '3D modelovanje', nameEN: '3D modeling', sortOrder: 10 },
      { key: 'ilustracije', nameBS: 'Ilustracije i crtanje', nameEN: 'Illustrations and drawing', sortOrder: 11 },
    ]
  },
  {
    key: 'it-tehnologije',
    nameBS: 'IT i tehnološke usluge',
    nameEN: 'IT and technology services',
    sortOrder: 9,
    children: [
      { key: 'web-sajtovi', nameBS: 'Izrada web sajtova', nameEN: 'Website development', sortOrder: 1 },
      { key: 'aplikacije', nameBS: 'Programiranje aplikacija', nameEN: 'Application programming', sortOrder: 2 },
      { key: 'it-podrska', nameBS: 'IT podrška', nameEN: 'IT support', sortOrder: 3 },
      { key: 'softver', nameBS: 'Instalacija softvera', nameEN: 'Software installation', sortOrder: 4 },
      { key: 'popravka-racunara', nameBS: 'Popravka računara', nameEN: 'Computer repair', sortOrder: 5 },
      { key: 'mreze', nameBS: 'Instalacija mreža', nameEN: 'Network installation', sortOrder: 6 },
      { key: 'bezbednost', nameBS: 'Cyber bezbednost', nameEN: 'Cybersecurity', sortOrder: 7 },
      { key: 'backup', nameBS: 'Backup podataka', nameEN: 'Data backup', sortOrder: 8 },
      { key: 'online-marketing', nameBS: 'Online marketing', nameEN: 'Online marketing', sortOrder: 9 },
      { key: 'seo', nameBS: 'SEO optimizacija', nameEN: 'SEO optimization', sortOrder: 10 },
      { key: 'ecommerce', nameBS: 'E-commerce rešenja', nameEN: 'E-commerce solutions', sortOrder: 11 },
    ]
  },
  {
    key: 'dogadjaji-zabava',
    nameBS: 'Događaji i zabava',
    nameEN: 'Events and entertainment',
    sortOrder: 10,
    children: [
      { key: 'rodjendan', nameBS: 'Organizacija rođendana', nameEN: 'Birthday party organization', sortOrder: 1 },
      { key: 'svadbe', nameBS: 'Organizacija svadbi', nameEN: 'Wedding organization', sortOrder: 2 },
      { key: 'dj-usluge', nameBS: 'DJ usluge', nameEN: 'DJ services', sortOrder: 3 },
      { key: 'ketering', nameBS: 'Ketering', nameEN: 'Catering', sortOrder: 4 },
      { key: 'dekoracija', nameBS: 'Dekoracija prostora', nameEN: 'Space decoration', sortOrder: 5 },
      { key: 'animatori', nameBS: 'Animatori za decu', nameEN: 'Children\'s entertainers', sortOrder: 6 },
      { key: 'muzicari', nameBS: 'Muzičari i bendovi', nameEN: 'Musicians and bands', sortOrder: 7 },
      { key: 'fotografisanje', nameBS: 'Fotografisanje događaja', nameEN: 'Event photography', sortOrder: 8 },
      { key: 'oprema', nameBS: 'Iznajmljivanje opreme', nameEN: 'Equipment rental', sortOrder: 9 },
      { key: 'bartender', nameBS: 'Bartender usluge', nameEN: 'Bartender services', sortOrder: 10 },
      { key: 'deda-mraz', nameBS: 'Poseta Deda Mraza', nameEN: 'Santa Claus visit', sortOrder: 11 },
      { key: 'firmski-dogadjaji', nameBS: 'Organizacija firmskih događaja', nameEN: 'Corporate event organization', sortOrder: 12 },
    ]
  },
  {
    key: 'prevoz-logistika',
    nameBS: 'Prevoz i logistika',
    nameEN: 'Transport and logistics',
    sortOrder: 11,
    children: [
      { key: 'taksi', nameBS: 'Taksi usluge', nameEN: 'Taxi services', sortOrder: 1 },
      { key: 'rent-car', nameBS: 'Rent-a-car', nameEN: 'Car rental', sortOrder: 2 },
      { key: 'aerodrom', nameBS: 'Aerodromski transfer', nameEN: 'Airport transfer', sortOrder: 3 },
      { key: 'posebne-prilike', nameBS: 'Prevoz za posebne prilike', nameEN: 'Special occasion transport', sortOrder: 4 },
      { key: 'medicinski', nameBS: 'Medicinski transport', nameEN: 'Medical transport', sortOrder: 5 },
      { key: 'invaliditet', nameBS: 'Prevoz za osobe sa invaliditetom', nameEN: 'Transport for disabled persons', sortOrder: 6 },
      { key: 'turisticki', nameBS: 'Turistički obilasci', nameEN: 'Tourist tours', sortOrder: 7 },
      { key: 'kurirske', nameBS: 'Kurirske usluge', nameEN: 'Courier services', sortOrder: 8 },
      { key: 'medjugradski', nameBS: 'Međugradski prevoz', nameEN: 'Inter-city transport', sortOrder: 9 },
      { key: 'firme', nameBS: 'Prevoz za firme', nameEN: 'Corporate transport', sortOrder: 10 },
      { key: 'pokojnici', nameBS: 'Prevoz pokojnika', nameEN: 'Funeral transport', sortOrder: 11 },
    ]
  },
  {
    key: 'poslovne-usluge',
    nameBS: 'Poslovne usluge',
    nameEN: 'Business services',
    sortOrder: 12,
    children: [
      { key: 'racunovodstvo', nameBS: 'Računovodstvene usluge', nameEN: 'Accounting services', sortOrder: 1 },
      { key: 'pravne', nameBS: 'Pravne konsultacije', nameEN: 'Legal consultations', sortOrder: 2 },
      { key: 'prevodi', nameBS: 'Prevodi dokumenata', nameEN: 'Document translation', sortOrder: 3 },
      { key: 'notarske', nameBS: 'Notarske usluge', nameEN: 'Notary services', sortOrder: 4 },
      { key: 'kucanje', nameBS: 'Kucanje tekstova', nameEN: 'Text typing', sortOrder: 5 },
      { key: 'virtualna-asistencija', nameBS: 'Virtuelna asistencija', nameEN: 'Virtual assistance', sortOrder: 6 },
      { key: 'telefonski-operater', nameBS: 'Telefonski operater', nameEN: 'Phone operator', sortOrder: 7 },
      { key: 'bookkeeping', nameBS: 'Bookkeeping', nameEN: 'Bookkeeping', sortOrder: 8 },
      { key: 'prezentacije', nameBS: 'Izrada prezentacija', nameEN: 'Presentation creation', sortOrder: 9 },
      { key: 'konsalting', nameBS: 'Poslovni konsalting', nameEN: 'Business consulting', sortOrder: 10 },
      { key: 'marketing', nameBS: 'Marketing usluge', nameEN: 'Marketing services', sortOrder: 11 },
    ]
  },
  {
    key: 'zdravlje-lepota',
    nameBS: 'Zdravlje i lepota',
    nameEN: 'Health and beauty',
    sortOrder: 13,
    children: [
      { key: 'mobilni-frizer', nameBS: 'Mobilni frizer', nameEN: 'Mobile hairdresser', sortOrder: 1 },
      { key: 'kozmeticarske', nameBS: 'Kozmetičarske usluge', nameEN: 'Cosmetic services', sortOrder: 2 },
      { key: 'higijena', nameBS: 'Lična higijena', nameEN: 'Personal hygiene', sortOrder: 3 },
      { key: 'medicinske-kuca', nameBS: 'Medicinske usluge kod kuće', nameEN: 'Home medical services', sortOrder: 4 },
      { key: 'stomatologija', nameBS: 'Stomatološke usluge', nameEN: 'Dental services', sortOrder: 5 },
      { key: 'veterina', nameBS: 'Veterinarske usluge', nameEN: 'Veterinary services', sortOrder: 6 },
      { key: 'apoteka', nameBS: 'Apotekarske usluge', nameEN: 'Pharmacy services', sortOrder: 7 },
      { key: 'opticarske', nameBS: 'Optičarske usluge', nameEN: 'Optical services', sortOrder: 8 },
      { key: 'laboratorija', nameBS: 'Laboratorijske analize', nameEN: 'Laboratory analyses', sortOrder: 9 },
    ]
  }
]

async function seedCategories() {
  try {
    console.log('🏷️  Starting to seed categories...')
    
    // Get existing categories
    const existingCategories = await prisma.category.findMany()
    console.log(`📊 Found ${existingCategories.length} existing categories in database`)
    
    let created = 0
    let updated = 0
    let skipped = 0
    
    for (const groupData of categoryGroups) {
      // Create or update parent category
      const existingParent = existingCategories.find(cat => cat.key === groupData.key)
      
      let parentCategory
      if (existingParent) {
        // Update existing parent
        const needsUpdate = 
          existingParent.nameBS !== groupData.nameBS ||
          existingParent.nameEN !== groupData.nameEN ||
          existingParent.sortOrder !== groupData.sortOrder ||
          existingParent.isPopular !== (groupData.isPopular || false)
        
        if (needsUpdate) {
          parentCategory = await prisma.category.update({
            where: { id: existingParent.id },
            data: {
              nameBS: groupData.nameBS,
              nameEN: groupData.nameEN,
              sortOrder: groupData.sortOrder,
              isPopular: groupData.isPopular || false,
            },
          })
          updated++
          console.log(`✏️  Updated parent: ${groupData.nameEN}`)
        } else {
          parentCategory = existingParent
          skipped++
        }
      } else {
        // Create new parent
        parentCategory = await prisma.category.create({
          data: {
            key: groupData.key,
            nameBS: groupData.nameBS,
            nameEN: groupData.nameEN,
            sortOrder: groupData.sortOrder,
            isPopular: groupData.isPopular || false,
            isActive: true,
          },
        })
        created++
        console.log(`✅ Created parent: ${groupData.nameEN}`)
      }
      
      // Create or update child categories
      if (groupData.children) {
        for (const childData of groupData.children) {
          const existingChild = existingCategories.find(cat => cat.key === childData.key)
          
          if (existingChild) {
            // Update existing child
            const needsUpdate = 
              existingChild.nameBS !== childData.nameBS ||
              existingChild.nameEN !== childData.nameEN ||
              existingChild.sortOrder !== childData.sortOrder ||
              existingChild.parentId !== parentCategory.id
            
            if (needsUpdate) {
              await prisma.category.update({
                where: { id: existingChild.id },
                data: {
                  nameBS: childData.nameBS,
                  nameEN: childData.nameEN,
                  sortOrder: childData.sortOrder,
                  parentId: parentCategory.id,
                },
              })
              updated++
              console.log(`  ✏️  Updated child: ${childData.nameEN}`)
            } else {
              skipped++
            }
          } else {
            // Create new child
            await prisma.category.create({
              data: {
                key: childData.key,
                nameBS: childData.nameBS,
                nameEN: childData.nameEN,
                parentId: parentCategory.id,
                sortOrder: childData.sortOrder,
                isActive: true,
              },
            })
            created++
            console.log(`  ✅ Created child: ${childData.nameEN}`)
          }
        }
      }
    }
    
    console.log('🎉 Categories seeding completed!')
    console.log(`📈 Summary:`)
    console.log(`   - Created: ${created} categories`)
    console.log(`   - Updated: ${updated} categories`)
    console.log(`   - Skipped: ${skipped} categories`)
    
    // Show final count
    const finalCount = await prisma.category.count()
    const parentCount = await prisma.category.count({ where: { parentId: null } })
    const childCount = await prisma.category.count({ where: { parentId: { not: null } } })
    
    console.log(`🏷️  Total categories in database: ${finalCount}`)
    console.log(`   - Parent categories: ${parentCount}`)
    console.log(`   - Child categories: ${childCount}`)
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('✨ Categories seeding process completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Categories seeding process failed:', error)
      process.exit(1)
    })
}

export { seedCategories }
