'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PurchaseConnections } from '@/components/common/purchase-connections'
import { useTranslations } from 'next-intl'

interface PurchaseConnectionsSectionProps {
  userRole?: string
}

export function PurchaseConnectionsSection({ userRole = 'tasker' }: PurchaseConnectionsSectionProps) {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const t = useTranslations('dashboard.connections')

  const getDescription = () => {
    switch (userRole) {
      case 'client':
        return t('purchaseAdditionalClient')
      case 'company':
        return t('purchaseAdditionalCompany')
      case 'tasker':
      default:
        return t('purchaseAdditionalTasker')
    }
  }

  return (
    <div className="text-center">
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default"
            className="w-full"
          >
            {t('purchaseConnects')}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto thin-scrollbar p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('purchaseConnections')}</DialogTitle>
          </DialogHeader>
          <PurchaseConnections onClose={() => setPurchaseDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <p className="text-xs text-muted-foreground mt-2">
        {getDescription()}
      </p>
    </div>
  )
}
