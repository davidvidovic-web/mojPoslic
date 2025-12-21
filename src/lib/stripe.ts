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
// Note: Stripe processes in EUR, but we display prices in BAM equivalent
// Conversion rate: 1 EUR = 2.0373 BAM (includes 4% conversion fee)
// Rounded prices for better UX: 2.5, 4.5, 8.0 BAM
export const CONNECTION_PACKAGES = [
  {
    id: 'package_10',
    connections: 10,
    price: 1.23, // Price in EUR for Stripe (2.5 BAM ÷ 2.0373)
    displayPrice: 2.50, // Display price in BAM (rounded up)
    currency: 'eur', // Stripe currency
    displayCurrency: 'bam', // Display currency
    name: '10 Connections',
    description: 'Perfect for occasional use'
  },
  {
    id: 'package_20',
    connections: 20,
    price: 2.21, // Price in EUR for Stripe (4.5 BAM ÷ 2.0373)
    displayPrice: 4.50, // Display price in BAM (rounded up)
    currency: 'eur',
    displayCurrency: 'bam',
    name: '20 Connections',
    description: 'Great for regular job searching'
  },
  {
    id: 'package_50',
    connections: 50,
    price: 3.93, // Price in EUR for Stripe (8.0 BAM ÷ 2.0373)
    displayPrice: 8.00, // Display price in BAM (rounded up)
    currency: 'eur',
    displayCurrency: 'bam',
    name: '50 Connections',
    description: 'Best value for power users'
  }
] as const

export type ConnectionPackage = typeof CONNECTION_PACKAGES[number]

export function getPackageById(packageId: string): ConnectionPackage | undefined {
  return CONNECTION_PACKAGES.find(pkg => pkg.id === packageId)
}
