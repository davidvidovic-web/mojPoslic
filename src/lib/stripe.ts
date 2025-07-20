import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Lazy-loaded Stripe instance
let stripeInstance: Stripe | null = null

const getStripeInstance = (): Stripe => {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  }
  
  return stripeInstance
}

// Server-side Stripe instance - use getter to avoid initialization at module load
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripeInstance()[prop as keyof Stripe]
  }
})

// Client-side Stripe instance
export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  if (!publishableKey) {
    console.warn('No Stripe publishable key found. Client-side Stripe functionality will not work.')
    return null
  }
  return loadStripe(publishableKey)
}

// Connection packages configuration
export const CONNECTION_PACKAGES = [
  {
    id: 'package_10',
    connections: 10,
    price: 1.00,
    currency: 'eur',
    name: '10 Connections',
    description: 'Perfect for occasional use'
  },
  {
    id: 'package_20',
    connections: 20,
    price: 2.00,
    currency: 'eur',
    name: '20 Connections',
    description: 'Great for regular job searching'
  },
  {
    id: 'package_50',
    connections: 50,
    price: 3.75,
    currency: 'eur',
    name: '50 Connections',
    description: 'Best value for power users'
  }
] as const

export type ConnectionPackage = typeof CONNECTION_PACKAGES[number]

export function getPackageById(packageId: string): ConnectionPackage | undefined {
  return CONNECTION_PACKAGES.find(pkg => pkg.id === packageId)
}
