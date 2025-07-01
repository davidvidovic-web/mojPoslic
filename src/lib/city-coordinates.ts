// Common Bosnia city coordinates for map centering
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'sarajevo': { lat: 43.8563, lng: 18.4131, name: 'Sarajevo' },
  'banja-luka': { lat: 44.7666, lng: 17.1831, name: 'Banja Luka' },
  'tuzla': { lat: 44.5386, lng: 18.6708, name: 'Tuzla' },
  'zenica': { lat: 44.2031, lng: 17.9061, name: 'Zenica' },
  'mostar': { lat: 43.3438, lng: 17.8078, name: 'Mostar' },
  'bijeljina': { lat: 44.7594, lng: 19.2144, name: 'Bijeljina' },
  'brčko': { lat: 44.8694, lng: 18.8108, name: 'Brčko' },
  'doboj': { lat: 44.7328, lng: 18.0869, name: 'Doboj' },
  'cazin': { lat: 44.9669, lng: 15.9431, name: 'Cazin' },
  'livno': { lat: 43.8269, lng: 17.0050, name: 'Livno' },
  'trebinje': { lat: 42.7125, lng: 18.3428, name: 'Trebinje' },
  'goražde': { lat: 43.6683, lng: 18.9758, name: 'Goražde' },
  'prijedor': { lat: 44.9778, lng: 16.7144, name: 'Prijedor' },
  'bihać': { lat: 44.8167, lng: 15.8700, name: 'Bihać' },
  'velika-kladuša': { lat: 45.1847, lng: 15.8058, name: 'Velika Kladuša' },
  'bosanska-krupa': { lat: 44.8833, lng: 16.1547, name: 'Bosanska Krupa' },
  'buzim': { lat: 45.0333, lng: 15.8667, name: 'Buzim' },
  'visoko': { lat: 43.9897, lng: 18.1819, name: 'Visoko' },
  'kakanj': { lat: 44.1319, lng: 18.1211, name: 'Kakanj' },
  'vareš': { lat: 44.1667, lng: 18.3167, name: 'Vareš' },
  'žepče': { lat: 44.4269, lng: 18.0381, name: 'Žepče' },
  'maglaj': { lat: 44.5467, lng: 18.0933, name: 'Maglaj' },
  'zavidovići': { lat: 44.4456, lng: 18.1497, name: 'Zavidovići' },
  'travnik': { lat: 44.2289, lng: 17.6658, name: 'Travnik' },
  'vitez': { lat: 44.1467, lng: 17.7631, name: 'Vitez' },
  'busovača': { lat: 44.0978, lng: 17.8764, name: 'Busovača' },
  'novi-travnik': { lat: 44.1700, lng: 17.6617, name: 'Novi Travnik' },
  'kiseljak': { lat: 43.9436, lng: 18.0789, name: 'Kiseljak' },
  'fojnica': { lat: 43.9581, lng: 17.9019, name: 'Fojnica' },
  'čapljina': { lat: 43.1161, lng: 17.7186, name: 'Čapljina' },
  'stolac': { lat: 43.0833, lng: 17.9667, name: 'Stolac' },
  'neum': { lat: 42.9225, lng: 17.6161, name: 'Neum' },
  'konjic': { lat: 43.6517, lng: 17.9611, name: 'Konjic' },
  'jablanica': { lat: 43.6597, lng: 17.7653, name: 'Jablanica' },
  'široki-brijeg': { lat: 43.3850, lng: 17.5944, name: 'Široki Brijeg' },
  'posušje': { lat: 43.4739, lng: 17.3414, name: 'Posušje' },
  'grude': { lat: 43.3689, lng: 17.3917, name: 'Grude' },
  'ljubuški': { lat: 43.2006, lng: 17.5450, name: 'Ljubuški' },
  'čitluk': { lat: 43.2281, lng: 17.7011, name: 'Čitluk' },
  'tomislavgrad': { lat: 43.7283, lng: 17.2258, name: 'Tomislavgrad' },
  'glamoč': { lat: 44.0467, lng: 16.8500, name: 'Glamoč' },
  'drvar': { lat: 44.3739, lng: 16.3781, name: 'Drvar' },
  'zvornik': { lat: 44.3856, lng: 19.1017, name: 'Zvornik' },
  'vlasenica': { lat: 44.1833, lng: 18.9333, name: 'Vlasenica' },
  'bratunac': { lat: 44.1167, lng: 19.3167, name: 'Bratunac' },
  'srebrenica': { lat: 44.1069, lng: 19.2969, name: 'Srebrenica' },
  'rogatica': { lat: 43.7967, lng: 19.0097, name: 'Rogatica' },
  'višegrad': { lat: 43.7825, lng: 19.2911, name: 'Višegrad' },
  'foča': { lat: 43.5114, lng: 18.7786, name: 'Foča' },
  'gacko': { lat: 43.1697, lng: 18.5336, name: 'Gacko' },
  'nevesinje': { lat: 43.2583, lng: 18.1133, name: 'Nevesinje' },
  'istočno-sarajevo': { lat: 43.8061, lng: 18.3403, name: 'Istočno Sarajevo' },
  'sokolac': { lat: 43.9383, lng: 18.8000, name: 'Sokolac' }
}

export interface CityCoordinate {
  lat: number
  lng: number
  name: string
}

export interface City {
  id: number
  key: string
  nameEN: string
  nameBS: string
}

export function getCityCoordinates(cityId: string, cities: City[]): CityCoordinate | null {
  // First check if we have predefined coordinates
  const predefinedCoords = CITY_COORDINATES[cityId]
  if (predefinedCoords) {
    console.log(`Found coordinates for ${cityId}:`, predefinedCoords)
    return predefinedCoords
  }
  
  // If not found in predefined coordinates, try to find from loaded cities
  const selectedCity = cities.find(city => city.key === cityId)
  if (selectedCity) {
    console.log(`City ${cityId} not in coordinates mapping, using fallback for:`, selectedCity.nameEN)
    // For cities not in our static mapping, provide approximate coordinates
    return {
      lat: 43.8563, // Default to Sarajevo area
      lng: 18.4131,
      name: selectedCity.nameEN
    }
  }
  
  console.log(`No coordinates found for city key: ${cityId}`)
  return null
}
