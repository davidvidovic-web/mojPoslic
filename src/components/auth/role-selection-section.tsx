'use client'

import { Label } from '@/components/ui/label'
import { User, Briefcase, Building } from 'lucide-react'
import { UserRole } from '@/types/user'

interface RoleSelectionSectionProps {
  signupRole: UserRole
  setSignupRole: (role: UserRole) => void
}

export function RoleSelectionSection({ signupRole, setSignupRole }: RoleSelectionSectionProps) {
  return (
    <div className="space-y-4">
      <Label>
        <div className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          You are a:
        </div>
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
            signupRole === 'tasker' 
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => setSignupRole('tasker')}
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium">Tasker</h3>
            <p className="text-sm text-muted-foreground">
              Looking for work opportunities
            </p>
          </div>
        </div>
        
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
            signupRole === 'client' 
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => setSignupRole('client')}
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium">Client</h3>
            <p className="text-sm text-muted-foreground">
              Need to hire for projects
            </p>
          </div>
        </div>
        
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
            signupRole === 'company' 
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => setSignupRole('company')}
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Company</h3>
            <p className="text-sm text-muted-foreground">
              Business with multiple roles
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
