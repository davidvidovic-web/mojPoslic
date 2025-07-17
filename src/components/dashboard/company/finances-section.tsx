'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, Receipt } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ClientFinancesSection() {
  const t = useTranslations('dashboard.finances')
  const tStats = useTranslations('dashboard.stats')
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSpent')}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0 BAM</div>
            <p className="text-xs text-muted-foreground">{t('totalProjectPayments')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('thisMonth')}</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0 BAM</div>
            <p className="text-xs text-muted-foreground">{t('currentMonthSpending')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingPayments')}</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0 BAM</div>
            <p className="text-xs text-muted-foreground">{t('awaitingCompletion')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            {t('paymentHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('noPaymentHistory')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('projectPaymentsWillAppear')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
