// Debug utility for realtime connection issues
// Add this temporarily to troubleshoot realtime problems

export function debugRealtimeConnection() {
  console.log('🔍 Debugging realtime connection state...')
  
  // Check authentication state
  import('@/lib/supabase').then(({ supabase }) => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('❌ Auth error during realtime debug:', error)
      } else {
        console.log('✅ User authenticated for realtime:', {
          id: data.user?.id,
          email: data.user?.email,
          role: data.user?.user_metadata?.role
        })
      }
    })
    
    // Check realtime connection status
    const channel = supabase.channel('debug_test')
      .subscribe((status, err) => {
        console.log('🔗 Debug channel status:', status)
        if (err) {
          console.error('❌ Debug channel error:', err)
        }
        
        // Clean up debug channel
        setTimeout(() => {
          supabase.removeChannel(channel)
        }, 1000)
      })
  })
}

// Call this when you see realtime errors to get more context
if (typeof window !== 'undefined') {
  (window as any).debugRealtimeConnection = debugRealtimeConnection
}
