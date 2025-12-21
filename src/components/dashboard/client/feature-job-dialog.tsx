'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Star, Coins } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FeatureJobDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  jobTitle: string
  currentlyFeatured: boolean
  userConnections?: number
}

export function FeatureJobDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  jobTitle,
  currentlyFeatured,
  userConnections = 0
}: FeatureJobDialogProps) {
  const t = useTranslations('jobs.dialogs')
  
  const actionTitle = currentlyFeatured ? t('removeFeatureDialog') : t('featureJobDialog')
  const actionDescription = currentlyFeatured 
    ? t('removeFeatureDescription', { jobTitle })
    : t('featureJobDescription', { jobTitle })
  const confirmText = currentlyFeatured ? t('removeFeatureConfirm') : t('featureJobConfirm')
  
  const hasInsufficientConnections = !currentlyFeatured && userConnections < 6

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Star className={`h-5 w-5 ${currentlyFeatured ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
            {actionTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>{actionDescription}</div>
            
            {/* Connection Info */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Coins className="h-4 w-4 text-yellow-600" />
              <div className="text-sm">
                {currentlyFeatured ? (
                  <span>Nema troška konekcija za uklanjanje promocije</span>
                ) : (
                  <div>
                    <div className="font-medium">Vaše konekcije: {userConnections}</div>
                    <div className={hasInsufficientConnections ? 'text-destructive' : 'text-muted-foreground'}>
                      Potrebno: 6 konekcija
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {hasInsufficientConnections && (
              <div className="text-destructive text-sm font-medium">
                ⚠️ Nemate dovoljno konekcija da promovirate ovaj oglas.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={hasInsufficientConnections}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}