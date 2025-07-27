'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SkillsBubbleInput } from '@/components/ui/skills-bubble-input'
import { CitiesFilter } from '@/components/filters/cities-filter'
import { PhoneInput } from '@/components/ui/phone-input'
import { Badge } from '@/components/ui/badge'
import { X, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/navigation'

// Static messages for profile setup pages to avoid server-side complications
const getProfileSetupMessages = (locale: string = 'bs') => {
  if (locale === 'en') {
    return {
      profile: {
        setup: {
          loading: "Loading...",
          saving: "Saving...",
          completeSetup: "Complete Setup",
          titles: {
            tasker: "Complete Your Profile",
            client: "Set Up Your Employer Profile",
            company: "Set Up Your Company Profile",
            admin: "Set Up Your Admin Profile",
            default: "Complete Your Profile"
          },
          descriptions: {
            tasker: "Help employers find you by completing your profile",
            client: "Set up your profile to start posting jobs",
            company: "Set up your company profile for hiring",
            admin: "Set up your admin profile",
            default: "Complete your profile to get started"
          },
          sections: {
            basicInformation: "Basic Information",
            location: "Location",
            professionalSkills: "Professional Skills",
            experienceLevels: "Experience Levels",
            additional: "Additional Information"
          },
          fields: {
            fullName: "Full Name",
            companyName: "Company Name",
            phoneNumber: "Phone Number",
            yourCity: "Your City",
            yourSkills: "Your Skills",
            websitePortfolio: "Website/Portfolio",
            companyWebsite: "Company Website",
            username: "Username",
            optional: "optional"
          },
          placeholders: {
            fullName: "Enter your full name",
            companyName: "Enter your company name",
            phoneNumber: "Enter your phone number",
            selectYourCity: "Select your city",
            addSkills: "Add your skills...",
            websitePortfolio: "https://yourportfolio.com",
            companyWebsite: "https://yourcompany.com",
            chooseUsername: "Choose a unique username"
          },
          helpText: {
            skillsRecommendation: "Add skills that match the jobs you're interested in. This helps employers find you!",
            skillsDescription: "Add skills relevant to the work you want to do",
            experienceDescription: "Set your experience level for each skill to help employers understand your expertise"
          },
          experienceLevels: {
            notSpecified: "Not specified",
            beginner: "Beginner (< 1 year)",
            oneToTwoYears: "1-2 years",
            threeToFiveYears: "3-5 years",
            fivePlusYears: "5+ years"
          },
          errors: {
            profileSetupCompleted: "Profile setup completed successfully!"
          }
        },
        autoGenerateUsername: "Auto-generated username"
      },
      errors: {
        validation: {
          usernameExists: "Username already exists. Please choose another."
        },
        failedToUpdate: {
          profile: "Failed to update profile. Please try again."
        }
      },
      filters: {
        allLocations: "All locations",
        allCategories: "All categories", 
        allSubcategories: "All subcategories",
        loadingLocations: "Loading locations...",
        loadingCategories: "Loading categories...",
        otherCities: "Other cities",
        popular: "Popular"
      }
    };
  }
  
  // Bosnian (default)
  return {
    profile: {
      setup: {
        loading: "Učitavanje...",
        saving: "Čuvam...",
        completeSetup: "Završi Postavke",
        titles: {
          tasker: "Završite Vaš Profil",
          client: "Postavite Vaš Profil Poslodavca",
          company: "Postavite Profil Vaše Kompanije",
          admin: "Postavite Vaš Admin Profil",
          default: "Završite Vaš Profil"
        },
        descriptions: {
          tasker: "Pomozite poslodavcima da vas pronađu završavanjem vašeg profila",
          client: "Postavite vaš profil da počnete objavljivati poslove",
          company: "Postavite profil vaše kompanije za zapošljavanje",
          admin: "Postavite vaš admin profil",
          default: "Završite vaš profil da počnete"
        },
        sections: {
          basicInformation: "Osnovne Informacije",
          location: "Lokacija",
          professionalSkills: "Profesionalne Vještine",
          experienceLevels: "Nivoi Iskustva",
          additional: "Dodatne Informacije"
        },
        fields: {
          fullName: "Puno Ime",
          companyName: "Naziv Kompanije",
          phoneNumber: "Broj Telefona",
          yourCity: "Vaš Grad",
          yourSkills: "Vaše Vještine",
          websitePortfolio: "Website/Portfolio",
          companyWebsite: "Website Kompanije",
          username: "Korisničko ime",
          optional: "opcionalno"
        },
        placeholders: {
          fullName: "Unesite vaše puno ime",
          companyName: "Unesite naziv vaše kompanije",
          phoneNumber: "Unesite vaš broj telefona",
          selectYourCity: "Odaberite vaš grad",
          addSkills: "Dodajte vaše vještine...",
          websitePortfolio: "https://vasportfolio.com",
          companyWebsite: "https://vasakompanija.com",
          chooseUsername: "Odaberite jedinstveno korisničko ime"
        },
        helpText: {
          skillsRecommendation: "Dodajte vještine koje odgovaraju poslovima za koje ste zainteresovani. Ovo pomaže poslodavcima da vas pronađu!",
          skillsDescription: "Dodajte vještine relevantne za posao koji želite raditi",
          experienceDescription: "Postavite vaš nivo iskustva za svaku vještinu da pomognete poslodavcima da razumiju vašu ekspertizu"
        },
        experienceLevels: {
          notSpecified: "Nije specificirano",
          beginner: "Početnik (< 1 godina)",
          oneToTwoYears: "1-2 godine",
          threeToFiveYears: "3-5 godina",
          fivePlusYears: "5+ godina"
        },
        errors: {
          profileSetupCompleted: "Postavke profila su uspješno završene!"
        }
      },
      autoGenerateUsername: "Auto-generirano korisničko ime"
    },
    errors: {
      validation: {
        usernameExists: "Korisničko ime već postoji. Molimo odaberite drugo."
      },
      failedToUpdate: {
        profile: "Neuspješno ažuriranje profila. Molimo pokušajte ponovo."
      }
    },
    filters: {
      allLocations: "Sve lokacije",
      allCategories: "Sve kategorije",
      allSubcategories: "Sve podkategorije", 
      loadingLocations: "Učitavanje lokacija...",
      loadingCategories: "Učitavanje kategorija...",
      otherCities: "Ostali gradovi",
      popular: "Popularno"
    }
  };
};

interface SkillExperience {
  skill: string
  experienceLevel: 'not-specified' | 'beginner' | '1-2-years' | '3-5-years' | '5plus-years'
  experienceYears?: string
}

export default function ProfileSetupPage() {
  const { user, loading, refreshUser } = useSupabaseAuth()
  const router = useRouter()
  
  // Detect locale from domain or default to Bosnian
  const locale = typeof window !== 'undefined' && window.location.hostname.startsWith('en.') ? 'en' : 'bs';
  const messages = getProfileSetupMessages(locale);
  
  // Helper functions to access translations
  const t = (key: string) => {
    const keys = key.split('.');
    let value: Record<string, unknown> = messages;
    for (const k of keys) {
      value = (value?.[k] as Record<string, unknown>) || {};
    }
    return (typeof value === 'string' ? value : key);
  };

  const tErrors = (key: string) => t(`errors.${key}`);
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    username: '',
    phone: '',
    location: '',
    skills: [] as string[],
    skillExperiences: [] as SkillExperience[],
    bio: '',
    website: '',
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form with existing user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Only populate phone if it exists, don't auto-populate name from email
        phone: user.phone || '',
        // Don't auto-populate other fields - let user enter them fresh
      }))
    }
  }, [user])

  // Handle redirects after hooks
  useEffect(() => {
    if (loading) return

    // Redirect to signin if not authenticated
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Redirect if already completed profile setup
    if (user.profileSetupCompleted) {
      router.push('/dashboard')
      return
    }

    // Redirect if no role selected yet
    if (!user.role) {
      router.push('/role-selection')
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

  // Return null while redirecting
  if (!user || user.profileSetupCompleted || !user.role) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Auto-generate username from email if not provided
    const finalUsername = formData.username || generateUsernameFromEmail(user.email || '')

    setIsSubmitting(true)

    try {
      // Check if username already exists (only if user provided a custom username)
      if (formData.username) {
        const usernameCheckResponse = await fetch(`/api/user/check-username?username=${encodeURIComponent(formData.username)}`)
        if (usernameCheckResponse.ok) {
          const { exists } = await usernameCheckResponse.json()
          if (exists) {
            toast.error(tErrors('validation.usernameExists'))
            setIsSubmitting(false)
            return
          }
        }
      }

      // Get session for auth header
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast.error('Please sign in again to continue')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          username: finalUsername,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Show success message immediately
      toast.success(t('profile.setup.errors.profileSetupCompleted'))
      
      // Refresh user context to get updated profileSetupCompleted status
      await refreshUser()
      
      // Wait for state to sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(tErrors('failedToUpdate.profile'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateUsernameFromEmail = (email: string): string => {
    // Extract username part from email (before @)
    const emailUsername = email.split('@')[0]
    return emailUsername.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) + Math.floor(Math.random() * 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillsChange = (newSkills: string[]) => {
    setFormData(prev => {
      // Update skill experiences when skills change
      const currentSkillExperiences = prev.skillExperiences
      const newSkillExperiences = newSkills.map(skill => {
        const existing = currentSkillExperiences.find((exp: SkillExperience) => exp.skill === skill)
        return existing || { skill, experienceLevel: 'not-specified' as const }
      })
      
      return {
        ...prev,
        skills: newSkills,
        skillExperiences: newSkillExperiences
      }
    })
  }

  const updateSkillExperience = (skillIndex: number, field: keyof SkillExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      skillExperiences: prev.skillExperiences.map((exp, index) =>
        index === skillIndex ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeSkillExperience = (skillIndex: number) => {
    const skillToRemove = formData.skillExperiences[skillIndex].skill
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
      skillExperiences: prev.skillExperiences.filter((_, index) => index !== skillIndex)
    }))
  }

  if (loading) {
    return (
      <NextIntlClientProvider messages={messages} locale={locale}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('profile.setup.loading')}</p>
          </div>
        </div>
      </NextIntlClientProvider>
    )
  }

  if (!user) {
    return null
  }

  // Get role-specific content
  const getRoleContent = () => {
    switch (user.role) {
      case 'client':
        return {
          title: t('profile.setup.titles.client'),
          description: t('profile.setup.descriptions.client')
        }
      case 'company':
        return {
          title: t('profile.setup.titles.company'),
          description: t('profile.setup.descriptions.company')
        }
      case 'tasker':
        return {
          title: t('profile.setup.titles.tasker'),
          description: t('profile.setup.descriptions.tasker')
        }
      case 'admin':
        return {
          title: t('profile.setup.titles.admin'),
          description: t('profile.setup.descriptions.admin')
        }
      case null:
      case undefined:
        return {
          title: t('profile.setup.titles.default'),
          description: t('profile.setup.descriptions.default')
        }
      default:
        return {
          title: t('profile.setup.titles.default'),
          description: t('profile.setup.descriptions.default')
        }
    }
  }

  const roleContent = getRoleContent()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{roleContent.title}</CardTitle>
                <CardDescription>
                  {roleContent.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information - Show for all roles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t('profile.setup.sections.basicInformation')}</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {user.role === 'company' ? t('profile.setup.fields.companyName') : t('profile.setup.fields.fullName')} *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={user.role === 'company' ? t('profile.setup.placeholders.companyName') : t('profile.setup.placeholders.fullName')}
                        required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.setup.fields.phoneNumber')} *</Label>
                    <PhoneInput
                      id="phone"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      placeholder={t('profile.setup.placeholders.phoneNumber')}
                      required
                    />
                  </div>
                </div>

                {/* Location - Show for all roles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('profile.setup.sections.location')}</h3>
                  <div className="space-y-2">
                    <Label>{t('profile.setup.fields.yourCity')} *</Label>
                    <CitiesFilter
                      value={formData.location}
                      onChange={(value) => handleInputChange('location', value)}
                      placeholder={t('profile.setup.placeholders.selectYourCity')}
                      className="w-full"
                      includeAllOption={false}
                    />
                  </div>
                </div>

                {/* Professional Skills - Only show for taskers */}
                {user.role === 'tasker' && (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{t('profile.setup.sections.professionalSkills')}</h3>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                          <span>{t('profile.setup.helpText.skillsRecommendation')}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('profile.setup.fields.yourSkills')}</Label>
                        <SkillsBubbleInput
                          value={formData.skills}
                          onChange={handleSkillsChange}
                          placeholder={t('profile.setup.placeholders.addSkills')}
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('profile.setup.helpText.skillsDescription')}
                        </p>
                      </div>
                    </div>

                    {/* Experience Levels - Only show for taskers */}
                    {formData.skillExperiences.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t('profile.setup.sections.experienceLevels')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('profile.setup.helpText.experienceDescription')}
                        </p>
                        
                        <div className="space-y-3">
                          {formData.skillExperiences.map((skillExp, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <Badge variant="secondary" className="shrink-0">
                                {skillExp.skill}
                              </Badge>
                              
                              <Select
                                value={skillExp.experienceLevel}
                                onValueChange={(value) => updateSkillExperience(index, 'experienceLevel', value)}
                              >
                                <SelectTrigger className="flex-1 truncate">
                                  <SelectValue className="truncate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not-specified">{t('profile.setup.experienceLevels.notSpecified')}</SelectItem>
                                  <SelectItem value="beginner">{t('profile.setup.experienceLevels.beginner')}</SelectItem>
                                  <SelectItem value="1-2-years">{t('profile.setup.experienceLevels.oneToTwoYears')}</SelectItem>
                                  <SelectItem value="3-5-years">{t('profile.setup.experienceLevels.threeToFiveYears')}</SelectItem>
                                  <SelectItem value="5plus-years">{t('profile.setup.experienceLevels.fivePlusYears')}</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkillExperience(index)}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </>
                )}

                {/* Additional Information section is hidden - username auto-generated from email */}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !formData.name || !formData.phone || formData.location === 'all'}
                >
                  {isSubmitting ? t('profile.setup.saving') : t('profile.setup.completeSetup')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
