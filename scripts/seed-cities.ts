#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'

interface CityData {
  key: string
  nameBS: string
  nameEN: string
  isSpecial?: boolean
  sortOrder: number
}

const bosnianCities: CityData[] = [
  // Major cities (higher sort order for priority)
  { key: 'sarajevo', nameBS: 'Sarajevo', nameEN: 'Sarajevo', isSpecial: true, sortOrder: 1 },
  { key: 'banja-luka', nameBS: 'Banja Luka', nameEN: 'Banja Luka', isSpecial: true, sortOrder: 2 },
  { key: 'tuzla', nameBS: 'Tuzla', nameEN: 'Tuzla', isSpecial: true, sortOrder: 3 },
  { key: 'zenica', nameBS: 'Zenica', nameEN: 'Zenica', isSpecial: true, sortOrder: 4 },
  { key: 'mostar', nameBS: 'Mostar', nameEN: 'Mostar', isSpecial: true, sortOrder: 5 },
  { key: 'bijeljina', nameBS: 'Bijeljina', nameEN: 'Bijeljina', isSpecial: true, sortOrder: 6 },
  { key: 'brčko', nameBS: 'Brčko', nameEN: 'Brčko', isSpecial: true, sortOrder: 7 },
  { key: 'prijedor', nameBS: 'Prijedor', nameEN: 'Prijedor', isSpecial: true, sortOrder: 8 },
  { key: 'trebinje', nameBS: 'Trebinje', nameEN: 'Trebinje', isSpecial: true, sortOrder: 9 },
  { key: 'doboj', nameBS: 'Doboj', nameEN: 'Doboj', isSpecial: true, sortOrder: 10 },

  // Remote option
  { key: 'remote', nameBS: 'Rad na daljinu', nameEN: 'Remote', isSpecial: true, sortOrder: 0 },

  // Federation of Bosnia and Herzegovina cities
  { key: 'bihać', nameBS: 'Bihać', nameEN: 'Bihać', sortOrder: 11 },
  { key: 'cazin', nameBS: 'Cazin', nameEN: 'Cazin', sortOrder: 12 },
  { key: 'velika-kladuša', nameBS: 'Velika Kladuša', nameEN: 'Velika Kladuša', sortOrder: 13 },
  { key: 'bosanska-krupa', nameBS: 'Bosanska Krupa', nameEN: 'Bosanska Krupa', sortOrder: 14 },
  { key: 'buzim', nameBS: 'Buzim', nameEN: 'Buzim', sortOrder: 15 },
  
  // Zenica-Doboj Canton
  { key: 'visoko', nameBS: 'Visoko', nameEN: 'Visoko', sortOrder: 16 },
  { key: 'kakanj', nameBS: 'Kakanj', nameEN: 'Kakanj', sortOrder: 17 },
  { key: 'vareš', nameBS: 'Vareš', nameEN: 'Vareš', sortOrder: 18 },
  { key: 'žepče', nameBS: 'Žepče', nameEN: 'Žepče', sortOrder: 19 },
  { key: 'maglaj', nameBS: 'Maglaj', nameEN: 'Maglaj', sortOrder: 20 },
  { key: 'zavidovići', nameBS: 'Zavidovići', nameEN: 'Zavidovići', sortOrder: 21 },
  { key: 'olovo', nameBS: 'Olovo', nameEN: 'Olovo', sortOrder: 22 },
  { key: 'breza', nameBS: 'Breza', nameEN: 'Breza', sortOrder: 23 },
  { key: 'usora', nameBS: 'Usora', nameEN: 'Usora', sortOrder: 24 },

  // Tuzla Canton
  { key: 'lukavac', nameBS: 'Lukavac', nameEN: 'Lukavac', sortOrder: 25 },
  { key: 'živinice', nameBS: 'Živinice', nameEN: 'Živinice', sortOrder: 26 },
  { key: 'banovići', nameBS: 'Banovići', nameEN: 'Banovići', sortOrder: 27 },
  { key: 'gradačac', nameBS: 'Gradačac', nameEN: 'Gradačac', sortOrder: 28 },
  { key: 'gračanica', nameBS: 'Gračanica', nameEN: 'Gračanica', sortOrder: 29 },
  { key: 'srebnik', nameBS: 'Srebnik', nameEN: 'Srebnik', sortOrder: 30 },
  { key: 'sapna', nameBS: 'Sapna', nameEN: 'Sapna', sortOrder: 31 },
  { key: 'teočak', nameBS: 'Teočak', nameEN: 'Teočak', sortOrder: 32 },
  { key: 'čelić', nameBS: 'Čelić', nameEN: 'Čelić', sortOrder: 33 },
  { key: 'kalesija', nameBS: 'Kalesija', nameEN: 'Kalesija', sortOrder: 34 },

  // Sarajevo Canton
  { key: 'ilidža', nameBS: 'Ilidža', nameEN: 'Ilidža', sortOrder: 35 },
  { key: 'vogošća', nameBS: 'Vogošća', nameEN: 'Vogošća', sortOrder: 36 },
  { key: 'hadžići', nameBS: 'Hadžići', nameEN: 'Hadžići', sortOrder: 37 },
  { key: 'ilijaš', nameBS: 'Ilijaš', nameEN: 'Ilijaš', sortOrder: 38 },

  // Bosnian-Podrinje Canton
  { key: 'goražde', nameBS: 'Goražde', nameEN: 'Goražde', sortOrder: 39 },
  { key: 'pale-fbih', nameBS: 'Pale (FBiH)', nameEN: 'Pale (FBiH)', sortOrder: 40 },
  { key: 'ustikolina', nameBS: 'Ustikolina', nameEN: 'Ustikolina', sortOrder: 41 },

  // Central Bosnia Canton
  { key: 'travnik', nameBS: 'Travnik', nameEN: 'Travnik', sortOrder: 42 },
  { key: 'vitez', nameBS: 'Vitez', nameEN: 'Vitez', sortOrder: 43 },
  { key: 'busovača', nameBS: 'Busovača', nameEN: 'Busovača', sortOrder: 44 },
  { key: 'novi-travnik', nameBS: 'Novi Travnik', nameEN: 'Novi Travnik', sortOrder: 45 },
  { key: 'kiseljak', nameBS: 'Kiseljak', nameEN: 'Kiseljak', sortOrder: 46 },
  { key: 'kreševo', nameBS: 'Kreševo', nameEN: 'Kreševo', sortOrder: 47 },
  { key: 'fojnica', nameBS: 'Fojnica', nameEN: 'Fojnica', sortOrder: 48 },

  // Herzegovina-Neretva Canton
  { key: 'čapljina', nameBS: 'Čapljina', nameEN: 'Čapljina', sortOrder: 49 },
  { key: 'stolac', nameBS: 'Stolac', nameEN: 'Stolac', sortOrder: 50 },
  { key: 'neum', nameBS: 'Neum', nameEN: 'Neum', sortOrder: 51 },
  { key: 'ravno', nameBS: 'Ravno', nameEN: 'Ravno', sortOrder: 52 },
  { key: 'konjic', nameBS: 'Konjic', nameEN: 'Konjic', sortOrder: 53 },
  { key: 'jablanica', nameBS: 'Jablanica', nameEN: 'Jablanica', sortOrder: 54 },
  { key: 'prozor-rama', nameBS: 'Prozor-Rama', nameEN: 'Prozor-Rama', sortOrder: 55 },

  // West Herzegovina Canton
  { key: 'široki-brijeg', nameBS: 'Široki Brijeg', nameEN: 'Široki Brijeg', sortOrder: 56 },
  { key: 'posušje', nameBS: 'Posušje', nameEN: 'Posušje', sortOrder: 57 },
  { key: 'grude', nameBS: 'Grude', nameEN: 'Grude', sortOrder: 58 },
  { key: 'ljubuški', nameBS: 'Ljubuški', nameEN: 'Ljubuški', sortOrder: 59 },
  { key: 'čitluk', nameBS: 'Čitluk', nameEN: 'Čitluk', sortOrder: 60 },

  // Canton 10
  { key: 'livno', nameBS: 'Livno', nameEN: 'Livno', sortOrder: 61 },
  { key: 'tomislavgrad', nameBS: 'Tomislavgrad', nameEN: 'Tomislavgrad', sortOrder: 62 },
  { key: 'kupres-fbih', nameBS: 'Kupres (FBiH)', nameEN: 'Kupres (FBiH)', sortOrder: 63 },
  { key: 'glamoč', nameBS: 'Glamoč', nameEN: 'Glamoč', sortOrder: 64 },
  { key: 'bosansko-grahovo', nameBS: 'Bosansko Grahovo', nameEN: 'Bosansko Grahovo', sortOrder: 65 },
  { key: 'drvar', nameBS: 'Drvar', nameEN: 'Drvar', sortOrder: 66 },

  // Republika Srpska cities
  { key: 'zvornik', nameBS: 'Zvornik', nameEN: 'Zvornik', sortOrder: 67 },
  { key: 'vlasenica', nameBS: 'Vlasenica', nameEN: 'Vlasenica', sortOrder: 68 },
  { key: 'milići', nameBS: 'Milići', nameEN: 'Milići', sortOrder: 69 },
  { key: 'šekovići', nameBS: 'Šekovići', nameEN: 'Šekovići', sortOrder: 70 },
  { key: 'osmaci', nameBS: 'Osmaci', nameEN: 'Osmaci', sortOrder: 71 },
  { key: 'bratunac', nameBS: 'Bratunac', nameEN: 'Bratunac', sortOrder: 72 },
  { key: 'srebrenica', nameBS: 'Srebrenica', nameEN: 'Srebrenica', sortOrder: 73 },
  { key: 'skelani', nameBS: 'Skelani', nameEN: 'Skelani', sortOrder: 74 },
  { key: 'rogatica', nameBS: 'Rogatica', nameEN: 'Rogatica', sortOrder: 75 },
  { key: 'višegrad', nameBS: 'Višegrad', nameEN: 'Višegrad', sortOrder: 76 },
  { key: 'čajniče', nameBS: 'Čajniče', nameEN: 'Čajniče', sortOrder: 77 },
  { key: 'foča', nameBS: 'Foča', nameEN: 'Foča', sortOrder: 78 },
  { key: 'gacko', nameBS: 'Gacko', nameEN: 'Gacko', sortOrder: 79 },
  { key: 'kalinovik', nameBS: 'Kalinovik', nameEN: 'Kalinovik', sortOrder: 80 },
  { key: 'nevesinje', nameBS: 'Nevesinje', nameEN: 'Nevesinje', sortOrder: 81 },
  { key: 'berkovići', nameBS: 'Berkovići', nameEN: 'Berkovići', sortOrder: 82 },
  { key: 'pale-rs', nameBS: 'Pale (RS)', nameEN: 'Pale (RS)', sortOrder: 83 },
  { key: 'trnovo-rs', nameBS: 'Trnovo (RS)', nameEN: 'Trnovo (RS)', sortOrder: 84 },
  { key: 'istočno-sarajevo', nameBS: 'Istočno Sarajevo', nameEN: 'Istočno Sarajevo', sortOrder: 85 },
  { key: 'sokolac', nameBS: 'Sokolac', nameEN: 'Sokolac', sortOrder: 86 },
  { key: 'han-pijesak', nameBS: 'Han Pijesak', nameEN: 'Han Pijesak', sortOrder: 87 },
  { key: 'ključ', nameBS: 'Ključ', nameEN: 'Ključ', sortOrder: 89 },
  { key: 'sanski-most', nameBS: 'Sanski Most', nameEN: 'Sanski Most', sortOrder: 90 },
  { key: 'petrovac', nameBS: 'Petrovac', nameEN: 'Petrovac', sortOrder: 91 },
  { key: 'kostajnica', nameBS: 'Kostajnica', nameEN: 'Kostajnica', sortOrder: 92 },
  { key: 'kozarska-dubica', nameBS: 'Kozarska Dubica', nameEN: 'Kozarska Dubica', sortOrder: 93 },
  { key: 'gradiška', nameBS: 'Gradiška', nameEN: 'Gradiška', sortOrder: 94 },
  { key: 'laktaši', nameBS: 'Laktaši', nameEN: 'Laktaši', sortOrder: 95 },
  { key: 'čelinac', nameBS: 'Čelinac', nameEN: 'Čelinac', sortOrder: 96 },
  { key: 'prnjavor', nameBS: 'Prnjavor', nameEN: 'Prnjavor', sortOrder: 97 },
  { key: 'derventa', nameBS: 'Derventa', nameEN: 'Derventa', sortOrder: 98 },
  { key: 'modriča', nameBS: 'Modriča', nameEN: 'Modriča', sortOrder: 99 },
  { key: 'šamac', nameBS: 'Šamac', nameEN: 'Šamac', sortOrder: 100 },
  { key: 'odžak', nameBS: 'Odžak', nameEN: 'Odžak', sortOrder: 101 },
  { key: 'orašje', nameBS: 'Orašje', nameEN: 'Orašje', sortOrder: 102 },
  { key: 'lopare', nameBS: 'Lopare', nameEN: 'Lopare', sortOrder: 103 },
  { key: 'ugljevik', nameBS: 'Ugljevik', nameEN: 'Ugljevik', sortOrder: 104 },
]

async function seedBosnianCities() {
  try {
    console.log('🏙️  Starting to seed Bosnian cities...')
    
    // First, check if cities already exist to avoid duplicates
    const existingCities = await prisma.city.findMany()
    console.log(`📊 Found ${existingCities.length} existing cities in database`)
    
    let created = 0
    let updated = 0
    let skipped = 0
    
    for (const cityData of bosnianCities) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingCity = existingCities.find((city: any) => city.key === cityData.key)
      
      if (existingCity) {
        // Update existing city if data has changed
        const needsUpdate = 
          existingCity.nameBS !== cityData.nameBS ||
          existingCity.nameEN !== cityData.nameEN ||
          existingCity.isSpecial !== (cityData.isSpecial || false) ||
          existingCity.sortOrder !== cityData.sortOrder
        
        if (needsUpdate) {
          await prisma.city.update({
            where: { id: existingCity.id },
            data: {
              nameBS: cityData.nameBS,
              nameEN: cityData.nameEN,
              isSpecial: cityData.isSpecial || false,
              sortOrder: cityData.sortOrder,
            },
          })
          updated++
          console.log(`✏️  Updated: ${cityData.nameEN} (${cityData.nameBS})`)
        } else {
          skipped++
        }
      } else {
        // Create new city
        await prisma.city.create({
          data: {
            key: cityData.key,
            nameBS: cityData.nameBS,
            nameEN: cityData.nameEN,
            isSpecial: cityData.isSpecial || false,
            sortOrder: cityData.sortOrder,
            isActive: true,
          },
        })
        created++
        console.log(`✅ Created: ${cityData.nameEN} (${cityData.nameBS})`)
      }
    }
    
    console.log('🎉 Cities seeding completed!')
    console.log(`📈 Summary:`)
    console.log(`   - Created: ${created} cities`)
    console.log(`   - Updated: ${updated} cities`)
    console.log(`   - Skipped: ${skipped} cities`)
    console.log(`   - Total processed: ${bosnianCities.length} cities`)
    
    // Show final count
    const finalCount = await prisma.city.count()
    console.log(`🏙️  Total cities in database: ${finalCount}`)
    
  } catch (error) {
    console.error('❌ Error seeding cities:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  seedBosnianCities()
    .then(() => {
      console.log('✨ Seeding process completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error)
      process.exit(1)
    })
}

export { seedBosnianCities }
