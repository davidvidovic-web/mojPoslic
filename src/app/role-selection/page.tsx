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
  Target
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

interface RoleOption {
  id: 'tasker' | 'client' | 'company'
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  badge?: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'tasker',
    title: 'Tasker',
    description: 'Find and apply for jobs that match your skills',
    icon: <User className="h-8 w-8" />,
    features: [
      'Browse and apply for jobs',
      'Build your professional profile',
      'Receive job recommendations',
      'Track your applications',
      'Connect with clients'
    ],
    badge: 'Most Popular'
  },
  {
    id: 'client',
    title: 'Client',
    description: 'Post jobs and hire talented professionals',
    icon: <Briefcase className="h-8 w-8" />,
    features: [
      'Post quick job opportunities',
      'Review applications',
      'Hire qualified taskers',
      'Direct messaging with taskers',
      'Access to local talent pool'
    ]
  },
  {
    id: 'company',
    title: 'Company',
    description: 'Manage your team and scale your business',
    icon: <Building2 className="h-8 w-8" />,
    features: [
      'Everything in Client',
      'Access to Professional job listings',
      'Multiple concurrent job listings',
      'Advanced hiring tools',
      'Premium support'
    ],
    badge: 'Pro'
  }
]

export default function RoleSelectionPage() {
  const { refreshUser } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'tasker' | 'client' | 'company' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRoleSelect = (roleId: 'tasker' | 'client' | 'company') => {
    setSelectedRole(roleId)
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue')
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

        toast.success(`Welcome to MojPoslic as a ${selectedRole}!`)
        
        // Redirect to profile setup to complete the onboarding
        router.push('/profile-setup')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to MojPoslic! Please select how you&apos;d like to use our platform to get started.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => (
            <Card
              key={role.id}
              className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedRole === role.id
                  ? 'ring-2 ring-primary shadow-lg bg-primary/5'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              {role.badge && (
                <Badge 
                  className="absolute -top-2 left-4 bg-primary text-primary-foreground"
                  variant="default"
                >
                  {role.badge}
                </Badge>
              )}
              
              {selectedRole === role.id && (
                <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    selectedRole === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {role.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up your account...
              </>
            ) : (
              <>
                Continue as {selectedRole ? roleOptions.find(r => r.id === selectedRole)?.title : 'User'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          {selectedRole && (
            <p className="text-sm text-muted-foreground mt-3">
              You can change your role later in account settings
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
