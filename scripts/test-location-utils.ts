/**
 * Test file for enhanced location utilities
 */

import { validateLocationInCity, cleanMapAddress, cyrillicToLatin, extractCityFromMapAddress } from '../src/lib/location-utils'

// Test cases for enhanced location validation
const testCases = [
  {
    address: "Vilsonovo šetalište, Grbavica, Sarajevo, Željeznička, Novo Sarajevo Municipality, City of Sarajevo, Sarajevo Canton, Federation of Bosnia and Herzegovina, 71000",
    city: "Sarajevo",
    expectedValid: true,
    description: "Complex map address with correct city - Sarajevo"
  },
  {
    address: "Vilsonovo šetalište, Grbavica, Sarajevo, Željeznička, Novo Sarajevo Municipality, City of Sarajevo, Sarajevo Canton, Federation of Bosnia and Herzegovina, 71000",
    city: "Tuzla",
    expectedValid: false,
    description: "Complex map address with wrong city selection - should detect Sarajevo vs Tuzla mismatch"
  },
  {
    address: "Krajiška ulica, Banja Luka 78000, Република Српска, Bosnia and Herzegovina",
    city: "Banja Luka", 
    expectedValid: true,
    description: "Address with mixed scripts - Banja Luka"
  },
  {
    address: "Trg Slobode 5, Tuzla, Tuzla Municipality, Tuzla Canton, Federation of Bosnia and Herzegovina, 75000",
    city: "Sarajevo",
    expectedValid: false,
    description: "Clear city mismatch - Tuzla address selected as Sarajevo"
  },
  {
    address: "Zmaja od Bosne 8, Sarajevo 71000, Bosnia and Herzegovina",
    city: "Sarajevo",
    expectedValid: true,
    description: "Simple address format - should work"
  },
  {
    address: "Ulica Ante Starčevića, Mostar, Herzegovina-Neretva Canton, Federation of Bosnia and Herzegovina, 88000",
    city: "Mostar",
    expectedValid: true,
    description: "Mostar address - should validate correctly"
  }
]

console.log("Testing Enhanced Location Utilities")
console.log("==================================")

// Test city extraction
console.log("\n1. Testing city extraction from complex addresses:")
testCases.forEach((test, index) => {
  const extractedCities = extractCityFromMapAddress(test.address)
  console.log(`\nTest ${index + 1}: ${test.description}`)
  console.log(`Address: "${test.address}"`)
  console.log(`Extracted cities: [${extractedCities.join(', ')}]`)
})

// Test Cyrillic conversion
console.log("\n\n2. Testing Cyrillic to Latin conversion:")
console.log("Сарајево →", cyrillicToLatin("Сарајево"))
console.log("Бања Лука →", cyrillicToLatin("Бања Лука"))
console.log("Република Српска →", cyrillicToLatin("Република Српска"))

// Test address cleaning
console.log("\n3. Testing address cleaning:")
const messyAddress = "Vilsonovo šetalište, Grbavica, Sarajevo, Željeznička, Novo Sarajevo Municipality, City of Sarajevo, Sarajevo Canton, Federation of Bosnia and Herzegovina, 71000"
console.log("Original:", messyAddress)
console.log("Cleaned:", cleanMapAddress(messyAddress))

// Test enhanced location validation
console.log("\n4. Testing enhanced location validation:")
testCases.forEach((test, index) => {
  const result = validateLocationInCity(test.address, test.city)
  const status = result.isValid === test.expectedValid ? "✅ PASS" : "❌ FAIL"
  
  console.log(`\n--- Test ${index + 1}: ${test.description} ---`)
  console.log(`Address: "${test.address}"`)
  console.log(`Selected City: "${test.city}"`)
  console.log(`Expected: ${test.expectedValid ? 'Valid' : 'Invalid'}`)
  console.log(`Result: ${result.isValid ? 'Valid' : 'Invalid'} (${result.confidence} confidence)`)
  console.log(`Details: ${result.details}`)
  if (result.extractedCities) {
    console.log(`Extracted Cities: [${result.extractedCities.join(', ')}]`)
  }
  console.log(`Status: ${status}`)
})

export { }
