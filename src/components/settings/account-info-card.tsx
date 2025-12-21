'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserCircle, Crown, Building2, User } from 'lucide-react'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useTranslations, useLocale } from 'next-intl'
import { formatMemberSince } from '@/lib/date-format'

export function AccountInfoCard() {
  const { user: profile, loading } = useSupabaseAuth()
  const t = useTranslations('settings.accountInfo')
  const locale = useLocale() as 'bs' | 'en'

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return t('roles.administrator')
      case 'client': return t('roles.client')
      case 'tasker': return t('roles.tasker')
      case 'company': return t('roles.company')
      default: return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />
      case 'client': return <Building2 className="h-4 w-4" />
      case 'tasker': return <User className="h-4 w-4" />
      case 'company': return <Building2 className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'client': return 'default'
      case 'tasker': return 'secondary'
      case 'company': return 'outline'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('loadingAccount')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('noAccountInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('pleaseLogin')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">{t('username')}</Label>
            <p className="text-sm text-muted-foreground">
              {profile.username ? `@${profile.username}` : t('noUsername')}
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">{t('accountType')}</Label>
            <div className="mt-1">
              <Badge variant={getRoleBadgeVariant(profile.role || 'tasker')} className="flex items-center w-fit">
                {getRoleIcon(profile.role || 'tasker')}
                <span className="ml-1">{getRoleDisplayName(profile.role || 'tasker')}</span>
              </Badge>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">{t('memberSince')}</Label>
            <p className="text-sm text-muted-foreground">
              {formatMemberSince(profile.created_at, locale)}
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">{t('emailAddress')}</Label>
            <p className="text-sm text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
