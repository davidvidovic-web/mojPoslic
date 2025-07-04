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
