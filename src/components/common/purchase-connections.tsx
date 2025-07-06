'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, CreditCard } from 'lucide-react'
import { CONNECTION_PACKAGES, type ConnectionPackage } from '@/lib/stripe'
import { getStripe } from '@/lib/stripe'
import { toast } from 'sonner'

interface PurchaseConnectionsProps {
  onClose?: () => void
}

export function PurchaseConnections({ onClose }: PurchaseConnectionsProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(true)
      setSelectedPackage(packageId)

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setLoading(false)
      setSelectedPackage(null)
    }
  }

  const getPopularBadge = (pkg: ConnectionPackage) => {
    // Mark the 40 connections package as popular
    if (pkg.id === 'package_40') {
      return <Badge variant="default" className="mb-2">Most Popular</Badge>
    }
    // Mark the 100 connections package as best value
    if (pkg.id === 'package_100') {
      return <Badge variant="outline" className="mb-2">Best Value</Badge>
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Purchase Connections</h3>
        <p className="text-sm text-muted-foreground">
          Get more connections to apply for jobs and post opportunities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CONNECTION_PACKAGES.map((pkg) => (
          <Card 
            key={pkg.id}
            className={`relative transition-all duration-200 hover:shadow-md ${
              pkg.id === 'package_40' ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader className="pb-3">
              {getPopularBadge(pkg)}
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  €{pkg.price.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Connections:</span>
                  <span className="font-medium">{pkg.connections}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Price per connection:</span>
                  <span className="font-medium">
                    €{(pkg.price / pkg.connections).toFixed(3)}
                  </span>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading}
                  className="w-full"
                  variant={pkg.id === 'package_40' ? 'default' : 'outline'}
                >
                  {loading && selectedPackage === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-blue-500" />
          <span>Secure payment powered by Stripe</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-blue-500" />
          <span>Connections are added instantly after payment</span>
        </div>
      </div>

      {onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
