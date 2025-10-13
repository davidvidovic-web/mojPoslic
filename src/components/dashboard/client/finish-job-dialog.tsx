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
import { CheckCircle2, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FinishJobDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (rating: number, comment: string, taskerId: string) => Promise<void>
  jobTitle?: string
  taskerName?: string
  taskerId?: string
}

export function FinishJobDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  jobTitle = "this job",
  taskerName = "the tasker",
  taskerId
}: FinishJobDialogProps) {
  const t = useTranslations('jobs.dialogs')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!taskerId) {
      return
    }
    
    if (rating === 0) {
      return // Rating is required
    }

    setIsSubmitting(true)
    try {
      await onConfirm(rating, comment, taskerId)
      // Reset form
      setRating(0)
      setComment('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error finishing job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setRating(0)
    setComment('')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            {t('finishJobDialog') || 'Finish Job'}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('finishJobDescription', { jobTitle }) || `Mark "${jobTitle}" as finished and review ${taskerName}.`}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t('rateTasker') || `Rate ${taskerName}'s work`} <span className="text-destructive">*</span>
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
                  {rating} {rating === 1 ? 'star' : 'stars'}
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
              placeholder={t('reviewPlaceholder') || 'Share your experience working with this tasker...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t('reviewNote') || 'Your review will be visible to other clients and the tasker can respond to it.'}
            </p>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>{t('finishJobNote') || 'Note:'}  </strong>
              {t('finishJobNoteText') || 'After you submit this review, the tasker will be notified and can leave a review for you as well. The job will be marked as completed.'}
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
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>{t('finishing') || 'Finishing...'}</>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('finishJobConfirm') || 'Finish Job & Submit Review'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
