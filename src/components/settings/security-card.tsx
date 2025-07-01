'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function SecurityCard() {
  const handleDeleteAccount = () => {
    // This would typically open a confirmation modal
    // For now, just show a toast
    toast.error('Account deletion is not available at this time. Please contact support.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Privacy
        </CardTitle>
        <CardDescription>
          Manage your account security settings and privacy preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data Privacy</h4>
            <p className="text-sm text-muted-foreground">
              We take your privacy seriously. Your personal information is securely stored and never shared without your explicit consent. 
              As a Tasker or Client, your profile information helps others connect with you for job opportunities.
            </p>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteAccount}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
