'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, CreditCard } from 'lucide-react'
import { CONNECTION_PACKAGES, type ConnectionPackage } from '@/lib/stripe'
import { getStripe } from '@/lib/stripe'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface PurchaseConnectionsProps {
  onClose?: () => void
}

export function PurchaseConnections({ onClose }: PurchaseConnectionsProps) {
  const t = useTranslations('purchase.connections')
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null)

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
    // Mark the 50 connections package as best value (selected appearance)
    if (pkg.id === 'package_50') {
      return <Badge variant="default" className="mb-2">{t('bestValue')}</Badge>
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CONNECTION_PACKAGES.map((pkg) => {
          const isSelected = pkg.id === 'package_50'
          const isHovered = hoveredPackage === pkg.id
          const showBorder = isSelected || isHovered
          
          return (
            <Card 
              key={pkg.id}
              onMouseEnter={() => setHoveredPackage(pkg.id)}
              onMouseLeave={() => setHoveredPackage(null)}
              className={`relative transition-all duration-500 ease-in-out hover:shadow-lg hover:scale-[1.02] h-full flex flex-col group ${
                showBorder
                  ? isSelected && !isHovered
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'ring-2 ring-primary/70 shadow-md'
                  : 'hover:shadow-md'
              }`}
              style={{
                transform: showBorder ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="min-h-[32px] flex items-start">
                  {getPopularBadge(pkg)}
                </div>
                <CardTitle className="text-lg h-[28px] flex items-center">
                  {pkg.connections} {t('connections')}
                </CardTitle>
                <div className="space-y-2">
                  <div className="text-2xl font-bold h-[32px] flex items-center">
                    {t('currency')}{pkg.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground min-h-[40px] flex items-center">
                    {t(`package_${pkg.connections}_description`)}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between text-sm h-[20px]">
                    <span>{t('connections')}</span>
                    <span className="font-medium">{pkg.connections}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm h-[20px]">
                    <span>{t('pricePerConnection')}</span>
                    <span className="font-medium">
                      {t('currency')}{(pkg.price / pkg.connections).toFixed(3)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading}
                  className="w-full mt-4 h-[40px]"
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {loading && selectedPackage === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('purchaseNow')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-blue-500" />
          <span>{t('securePayment')}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-blue-500" />
          <span>{t('instantAdd')}</span>
        </div>
      </div>

      {onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose}>
            {t('cancel')}
          </Button>
        </div>
      )}
    </div>
  )
}
