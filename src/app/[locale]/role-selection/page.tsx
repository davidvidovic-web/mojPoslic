'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { OnboardingPageGuard } from '@/components/auth/registration-flow-guard'
import { useRouter } from 'next/navigation'

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
  return (
    <OnboardingPageGuard allowedStates={['needs-role']}>
      <RoleSelectionContent />
    </OnboardingPageGuard>
  )
}

function RoleSelectionContent() {
  const t = useTranslations('roleSelection')
  const { refreshUser } = useAuth()
  const { update } = useSession()
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
      toast.error('Please select your account type')
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
        toast.success('Role updated successfully!')
        await update()
        await refreshUser()
        router.push('/profile-setup')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update your role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update your role')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('selectRole')}</h1>
          <p className="text-muted-foreground text-lg">
            {selectedRole ? t('welcomeMessage', { role: t(`${selectedRole}.title`) }) : t('chooseRole')}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => (
            <Card
              key={role.id}
              className={`relative transition-all duration-300 ${
                role.id === 'company'
                  ? 'opacity-50 cursor-not-allowed'
                  : selectedRole === role.id
                  ? 'ring-2 ring-primary shadow-lg bg-primary/5 border-primary cursor-pointer'
                  : 'hover:shadow-md border-border cursor-pointer'
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              {role.badgeKey && (
                <Badge 
                  className="absolute -top-2 left-4 bg-primary text-primary-foreground"
                  variant="default"
                >
                  {t(role.badgeKey)}
                </Badge>
              )}
              
              {selectedRole === role.id && role.id !== 'company' && (
                <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full transition-colors ${
                    selectedRole === role.id && role.id !== 'company'
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
                <ul className="space-y-2 text-sm">
                  {Object.values(t.raw(role.featuresKey) || {}).map((feature, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {String(feature)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting}
            size="lg"
            className="px-8 py-3 text-lg font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                {t('updating')}
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
