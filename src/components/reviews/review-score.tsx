'use client'

import { Star } from 'lucide-react'
import { useUserReviewStats } from '@/hooks/queries/useReviews'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

interface ReviewScoreProps {
  userId: string | undefined
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function ReviewScore({ userId, size = 'md', showCount = true, className = '' }: ReviewScoreProps) {
  const { data: stats, isLoading } = useUserReviewStats(userId)
  const t = useTranslations('jobs.dialogs')

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
        <Star className={`${size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
        <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {t('noReviewsYet')}
        </span>
      </div>
    )
  }

  const sizeClasses = {
    sm: 'h-3.5 w-3.5 text-xs',
    md: 'h-4 w-4 text-sm',
    lg: 'h-5 w-5 text-base'
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star 
        className={`${sizeClasses[size].split(' ').slice(0, 2).join(' ')} fill-yellow-400 text-yellow-400`} 
      />
      <span className={`font-semibold ${sizeClasses[size].split(' ')[2]}`}>
        {stats.averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`text-muted-foreground ${sizeClasses[size].split(' ')[2]}`}>
          ({stats.totalReviews})
        </span>
      )}
    </div>
  )
}
