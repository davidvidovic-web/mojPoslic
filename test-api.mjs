import fetch from 'node-fetch'

async function testCategoriesAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/categories')
    const data = await response.json()
    
    console.log('API Response Status:', response.status)
    console.log('Categories Count:', data.categories?.length || 0)
    console.log('First Category:', data.categories?.[0]?.nameEN || 'N/A')
    console.log('Has Children:', data.categories?.[0]?.children?.length || 0)
    
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}

testCategoriesAPI()
