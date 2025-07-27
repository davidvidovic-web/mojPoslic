'use client'

import { useState, useEffect } from 'react'
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
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/navigation'

// Static messages for role selection pages to avoid server-side complications
const getRoleSelectionMessages = (locale: string = 'bs') => {
  if (locale === 'en') {
    return {
      roleSelection: {
        selectRole: "Select Your Account Type",
        chooseRole: "Choose how you want to use mojPoslić",
        welcomeMessage: "Welcome! You've selected to join as a {role}",
        continue: "Continue as {role}",
        continueAsUser: "Select your role to continue",
        updating: "Updating...",
        canChangeRole: "You can change your role later in settings",
        tasker: {
          title: "Job Seeker",
          description: "Looking for work opportunities",
          badge: "Most Popular",
          features: {
            findJobs: "Find and apply for jobs",
            createProfile: "Create your professional profile",
            messaging: "Direct messaging with employers",
            notifications: "Get notified about new opportunities"
          }
        },
        client: {
          title: "Employer",
          description: "Looking to hire workers",
          features: {
            postJobs: "Post job listings",
            findWorkers: "Browse worker profiles",
            messaging: "Direct messaging with candidates", 
            management: "Manage your job postings"
          }
        },
        company: {
          title: "Company",
          description: "Enterprise hiring solutions",
          badge: "Coming Soon",
          features: {
            enterprise: "Enterprise-grade hiring tools",
            analytics: "Advanced analytics and reporting",
            branding: "Company branding on job posts",
            support: "Dedicated account support"
          }
        }
      }
    };
  }
  
  // Bosnian (default)
  return {
    roleSelection: {
      selectRole: "Odaberite Tip Vašeg Računa",
      chooseRole: "Odaberite kako želite koristiti mojPoslić",
      welcomeMessage: "Dobrodošli! Odabrali ste da se pridružite kao {role}",
      continue: "Nastavi kao {role}",
      continueAsUser: "Odaberite svoju ulogu da nastavite",
      updating: "Ažuriram...",
      canChangeRole: "Možete promijeniti svoju ulogu kasnije u postavkama",
      tasker: {
        title: "Tražim Posao",
        description: "Tražim prilike za rad",
        badge: "Najpopularnije",
        features: {
          findJobs: "Pronađi i prijavi se za poslove",
          createProfile: "Stvori svoj profesionalni profil",
          messaging: "Direktno porukovanje sa poslodavcima",
          notifications: "Budi obaviješten o novim prilikama"
        }
      },
      client: {
        title: "Poslodavac",
        description: "Tražim radnike za posao",
        features: {
          postJobs: "Objavi oglase za posao",
          findWorkers: "Pregledaj profile radnika",
          messaging: "Direktno porukovanje sa kandidatima",
          management: "Upravljaj svojimi oglasima"
        }
      },
      company: {
        title: "Kompanija",
        description: "Napredna rješenja za zapošljavanje",
        badge: "Uskoro",
        features: {
          enterprise: "Napredni alati za zapošljavanje",
          analytics: "Napredne analitike i izvještaji",
          branding: "Brendiranje kompanije na oglasima",
          support: "Dedicirana podrška za račun"
        }
      }
    }
  };
};

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
  const { user, loading, refreshUser } = useSupabaseAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'tasker' | 'client' | 'company' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detect locale from domain or default to Bosnian
  const locale = typeof window !== 'undefined' && window.location.hostname.startsWith('en.') ? 'en' : 'bs';
  const messages = getRoleSelectionMessages(locale);
  
  // Helper functions to access translations
  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value: any = messages.roleSelection;
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
    }
    
    return value || key;
  };

  // Handle navigation based on auth state
  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // Redirect to signin if not authenticated
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Redirect if already has completed profile setup
    if (user.profileSetupCompleted) {
      router.push('/dashboard')
      return
    }
  }, [user, loading, router])

  // Show loading if auth is still loading
  if (loading) {
    return (
      <NextIntlClientProvider messages={messages} locale={locale}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </NextIntlClientProvider>
    )
  }

  // Show loading while redirecting
  if (!user || user.profileSetupCompleted) {
    return (
      <NextIntlClientProvider messages={messages} locale={locale}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      </NextIntlClientProvider>
    )
  }

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
      // Get the current session from Supabase client
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No valid session found:', sessionError)
        toast.error('Please sign in again to continue')
        router.push('/auth/signin')
        return
      }

      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Pass session token
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          role: selectedRole
        })
      })
      
      if (response.ok) {
        toast.success('Role updated successfully!')
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
    <NextIntlClientProvider messages={messages} locale={locale}>
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
                    {Object.values(t(role.featuresKey) || {}).map((feature, index: number) => (
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
    </NextIntlClientProvider>
  )
}
