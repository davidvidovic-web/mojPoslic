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
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

interface PurchaseConnectionsProps {
  onClose?: () => void
}

export function PurchaseConnections({ onClose }: PurchaseConnectionsProps) {
  const t = useTranslations('purchase.connections')
  const { session, user } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(true)
      setSelectedPackage(packageId)

      // Check if user is authenticated
      if (!session?.access_token || !user?.id) {
        console.log('Purchase: No session, access token, or user available', { 
          hasSession: !!session, 
          hasToken: !!session?.access_token, 
          hasUser: !!user?.id 
        })
        throw new Error(t('authenticationRequired') || t('errors.authenticationRequired') || 'Please sign in to purchase connections')
      }

      console.log('Purchase: Making request with auth token')
      
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ packageId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('Purchase: API request failed', { 
          status: response.status, 
          statusText: response.statusText,
          errorData 
        })
        
        let errorMessage = 'Failed to create checkout session'
        
        // Map API error codes to translation keys
        if (errorData.error === 'AUTHENTICATION_REQUIRED') {
          errorMessage = t('authenticationRequired') || t('errors.authenticationRequired') || 'Please sign in to purchase connections'
        } else if (errorData.error === 'INVALID_PACKAGE_ID') {
          errorMessage = t('invalidPackage') || t('errors.invalidPackage') || 'Invalid package selected'
        } else if (errorData.error === 'STRIPE_INVALID_URL') {
          errorMessage = t('stripeInvalidUrl') || t('errors.stripeInvalidUrl') || 'Configuration error: Invalid URL'
        } else if (errorData.error === 'STRIPE_CARD_ERROR') {
          errorMessage = t('stripeCardError') || t('errors.stripeCardError') || 'Card error occurred'
        } else if (errorData.error === 'STRIPE_VALIDATION_ERROR') {
          errorMessage = t('stripeValidationError') || t('errors.stripeValidationError') || 'Validation error occurred'
        } else if (errorData.error === 'STRIPE_ERROR' || errorData.stripeError) {
          errorMessage = t('stripeError') || t('errors.stripeError') || 'Payment system error occurred'
        } else {
          errorMessage = errorData.message || t('sessionCreationFailed') || t('errors.sessionCreationFailed') || 'Failed to create checkout session'
        }
        
        throw new Error(errorMessage)
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error(t('stripeLoadFailed') || t('errors.stripeLoadFailed') || 'Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Purchase error:', error)
      const errorMessage = error instanceof Error ? error.message : (t('checkoutFailed') || t('errors.checkoutFailed') || 'Failed to start checkout process')
      toast.error(errorMessage)
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
                    {t('currency')}{pkg.displayPrice.toFixed(2)}
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
                      {t('currency')}{(pkg.displayPrice / pkg.connections).toFixed(3)}
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
