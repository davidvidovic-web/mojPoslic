'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Moon, Sun, Monitor, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/common/language-switcher'

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('settings.appearance')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">{t('theme')}</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectTheme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t('light')}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t('dark')}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t('system')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('themeDescription')}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('language')}
            </Label>
            <LanguageSwitcher />
            <p className="text-xs text-muted-foreground">
              {t('languageDescription')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
