'use client'

import { Briefcase } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function DashboardFooter() {
  const t = useTranslations('common.footer')
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold">mojPoslić</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  {t('browseJobs')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-foreground transition-colors">
                  {t('settings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-medium">{t('support')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('contactSupport')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('privacyPolicy')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
