'use client'

import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ReviewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rating: number, comment: string) => Promise<void>
  isSubmitting?: boolean
  jobTitle?: string
  clientName?: string
  clientAvatarUrl?: string
}

export function ReviewClientDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  jobTitle = "this job",
  clientName = "the client",
}: ReviewClientDialogProps) {
  const t = useTranslations('jobs.dialogs')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleConfirm = async () => {
    if (rating === 0) {
      return // Rating is required
    }

    try {
      await onSubmit(rating, comment)
      // Reset form
      setRating(0)
      setComment('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const handleCancel = () => {
    setRating(0)
    setComment('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Star className="h-5 w-5" />
            {t('reviewClientDialog') || 'Review Client'}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('reviewClientDescription', { jobTitle }) || `Share your experience working with ${clientName} on "${jobTitle}".`}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t('rateClient') || `Rate ${clientName}`} <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} {rating === 1 ? t('star') : t('stars')}
                </span>
              )}
            </div>
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('ratingRequired') || 'Please select a rating'}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="review-comment" className="text-sm font-medium">
              {t('reviewComment') || 'Review (optional)'}
            </Label>
            <Textarea
              id="review-comment"
              placeholder={t('reviewClientPlaceholder') || 'Share your experience working with this client...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t('reviewClientNote') || 'Your review will be visible to other taskers and the client.'}
            </p>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>{t('reviewClientInfoTitle') || 'Note:'}</strong>{' '}
              {t('reviewClientInfoText') || 'This review will help other taskers make informed decisions about working with this client.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || rating === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>{t('submitting') || 'Submitting...'}</>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('submitReview') || 'Submit Review'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
