'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle,
  Target,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'

interface RoleOption {
  id: 'tasker' | 'client' | 'company'
  titleKey: string
  descriptionKey: string
  icon: React.ReactNode
  featuresKey: string
  badgeKey?: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'tasker',
    titleKey: 'tasker.title',
    descriptionKey: 'tasker.description',
    icon: <User className="h-8 w-8" />,
    featuresKey: 'tasker.features',
    badgeKey: 'tasker.badge'
  },
  {
    id: 'client',
    titleKey: 'client.title',
    descriptionKey: 'client.description',
    icon: <Briefcase className="h-8 w-8" />,
    featuresKey: 'client.features'
  },
  {
    id: 'company',
    titleKey: 'company.title',
    descriptionKey: 'company.description',
    icon: <Building2 className="h-8 w-8" />,
    featuresKey: 'company.features',
    badgeKey: 'company.badge'
  }
]

export default function RoleSelectionPage() {
  const t = useTranslations('roleSelection')
  const { refreshUser } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'tasker' | 'client' | 'company' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRoleSelect = (roleId: 'tasker' | 'client' | 'company') => {
    // Disable company role selection for now
    if (roleId === 'company') {
      return
    }
    setSelectedRole(roleId)
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error(t('selectRole'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: selectedRole
        })
      })

      if (response.ok) {
        // Refresh user context to get updated role
        await refreshUser()

        toast.success(t('welcomeMessage', { role: t(`${selectedRole}.title`) }))
        
        // Redirect to profile setup to complete the onboarding
        router.push('/profile-setup')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || t('updateRoleFailed'))
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(t('common.messages.somethingWentWrong'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => {
            const isCompanyDisabled = role.id === 'company'
            return (
              <Card
                key={role.id}
                className={`relative transition-all duration-200 border ${
                  isCompanyDisabled
                    ? 'opacity-60 cursor-not-allowed border-border'
                    : selectedRole === role.id
                    ? 'ring-2 ring-primary shadow-lg bg-primary/5 border-primary cursor-pointer hover:scale-105'
                    : 'hover:shadow-md border-border cursor-pointer hover:scale-105'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                {/* Lock Overlay for Company */}
                {isCompanyDisabled && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">{t('company.badge')}</p>
                    </div>
                  </div>
                )}

                {role.badgeKey && !isCompanyDisabled && (
                  <Badge 
                    className="absolute -top-2 left-4 bg-primary text-primary-foreground"
                    variant="default"
                  >
                    {t(role.badgeKey)}
                  </Badge>
                )}
                
                {selectedRole === role.id && !isCompanyDisabled && (
                  <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-full transition-colors ${
                      selectedRole === role.id && !isCompanyDisabled 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {role.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{t(role.titleKey)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(role.descriptionKey)}
                  </p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {(t.raw(`${role.id}.features`) as string[]).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting}
            size="lg"
            className="px-8 py-3 text-lg font-medium bg-foreground hover:bg-foreground/90 text-background"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                {t('settingUpAccount')}
              </>
            ) : (
              <>
                {selectedRole ? t('continue', { role: t(`${selectedRole}.title`) }) : t('continueAsUser')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          {selectedRole && (
            <p className="text-sm text-muted-foreground mt-3">
              {t('canChangeRole')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
