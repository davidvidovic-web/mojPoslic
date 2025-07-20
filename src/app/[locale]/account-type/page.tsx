'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Briefcase, User, Building2, ArrowRight } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function AccountTypePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const tValidation = useTranslations('errors.validation')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Redirect non-authenticated users to register
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/register')
    }
  }, [user, authLoading, router])

  // Redirect if user already has a role and profile setup completed
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role && user.profileSetupCompleted) {
        router.replace('/dashboard')
      } else if (user.role) {
        // User has role but hasn't completed profile setup
        router.replace('/profile-setup')
      }
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole) {
      showToast.error(tValidation('pleaseSelectAccountType'))
      return
    }

    if (!user) {
      showToast.error('User not authenticated')
      return
    }

    setLoading(true)

    try {
      // Send the selected role to the API
      const response = await fetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      showToast.success('Account type set successfully!')
      
      // Redirect to profile setup
      router.push('/profile-setup')
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // If loading or user not authenticated, show loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-muted border">
              <Briefcase className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold">
              mojPoslić
            </h1>
          </div>
          <h2 className="text-xl font-semibold">Choose Account Type</h2>
          <p className="text-muted-foreground mt-2">
            Select the type of account that best describes you
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup 
              value={selectedRole} 
              onValueChange={setSelectedRole}
              className="space-y-4"
            >
              <div className={`flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-all ${selectedRole === 'client' ? 'border-primary bg-muted/50' : 'border-border'}`}>
                <RadioGroupItem value="client" id="client" className="mt-1" />
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedRole('client')}>
                  <Label htmlFor="client" className="flex items-center gap-2 font-semibold cursor-pointer">
                    <User className="h-4 w-4" />
                    Client
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I want to post jobs and hire professionals
                  </p>
                </div>
              </div>
              
              <div className={`flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-all ${selectedRole === 'tasker' ? 'border-primary bg-muted/50' : 'border-border'}`}>
                <RadioGroupItem value="tasker" id="tasker" className="mt-1" />
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedRole('tasker')}>
                  <Label htmlFor="tasker" className="flex items-center gap-2 font-semibold cursor-pointer">
                    <Briefcase className="h-4 w-4" />
                    Tasker
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I want to find work and apply for jobs
                  </p>
                </div>
              </div>
              
              <div className={`flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-all ${selectedRole === 'company' ? 'border-primary bg-muted/50' : 'border-border'}`}>
                <RadioGroupItem value="company" id="company" className="mt-1" />
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedRole('company')}>
                  <Label htmlFor="company" className="flex items-center gap-2 font-semibold cursor-pointer">
                    <Building2 className="h-4 w-4" />
                    Company
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I represent a business that wants to hire professionals
                  </p>
                </div>
              </div>
            </RadioGroup>

            <Button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2" 
              disabled={loading || !selectedRole}
            >
              {loading ? 'Setting up...' : 'Continue'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
