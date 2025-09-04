// Simple test to check if we can delete applications
console.log('Testing application deletion...')

// This would be run from browser console to test API
const testDeletion = async (applicationId) => {
  try {
    console.log('Attempting to delete application:', applicationId)
    
    const response = await fetch(`/api/applications/${applicationId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    console.log('Deletion result:', result)
    
    if (!response.ok) {
      console.error('Deletion failed:', result)
    } else {
      console.log('Deletion successful:', result)
    }
    
    return result
  } catch (error) {
    console.error('Error during deletion:', error)
  }
}

// Test function - replace with actual application ID
// testDeletion('your-application-id-here')
