import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Load environment variables if needed
let stripeSecretKey = process.env.STRIPE_SECRET_KEY

// In development, provide a fallback if environment variable is not loaded
if (!stripeSecretKey && process.env.NODE_ENV !== 'production') {
  console.warn('STRIPE_SECRET_KEY not found in environment. Using backup key for development only.')
  // Use the key we know works from our test
  stripeSecretKey = 'sk_test_51QhqZaKT9svruQVBNQtWs6lG8QcbrmedyxFJPQar9uxcr8cczm80l4NQvV56GvWtrgB9oDiVIP26QOtHHA4zRIYD00KKX5c0BT'
}

// Server-side Stripe instance
export const stripe = new Stripe(stripeSecretKey || 'sk_test_invalid', {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// Client-side Stripe instance
export const getStripe = () => {
  // Support both naming conventions for the publishable key
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                         process.env.STRIPE_PUBLISHABLE_KEY || 
                         'pk_test_51QhqZaKT9svruQVBbDxyOYN9UwZRIMnDABGD5HVwLuQszUymLDs0bcA6mpLKXJJ5rNFZ8u8ARUc34u40K3coZUhZ00iOJRoHzE'
  
  if (!publishableKey) {
    console.warn('No Stripe publishable key found. Client-side Stripe functionality will not work.')
    return null
  }
  return loadStripe(publishableKey)
}

// Connection packages configuration
export const CONNECTION_PACKAGES = [
  {
    id: 'package_20',
    connections: 20,
    price: 1.00,
    currency: 'eur',
    name: '20 Connections',
    description: 'Perfect for occasional use'
  },
  {
    id: 'package_40',
    connections: 40,
    price: 2.00,
    currency: 'eur',
    name: '40 Connections',
    description: 'Great for regular job searching'
  },
  {
    id: 'package_60',
    connections: 60,
    price: 3.00,
    currency: 'eur',
    name: '60 Connections',
    description: 'Ideal for active users'
  },
  {
    id: 'package_100',
    connections: 100,
    price: 3.60,
    currency: 'eur',
    name: '100 Connections',
    description: 'Best value for power users'
  }
] as const

export type ConnectionPackage = typeof CONNECTION_PACKAGES[number]

export function getPackageById(packageId: string): ConnectionPackage | undefined {
  return CONNECTION_PACKAGES.find(pkg => pkg.id === packageId)
}
