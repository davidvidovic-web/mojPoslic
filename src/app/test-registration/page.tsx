'use client'

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'

export default function TestRegistrationFlowPage() {
  const testMagicLinkRegistration = () => {
    showToast.info('Testing magic link registration flow')
    window.location.href = '/login?tab=magic'
  }

  return (
    <div className="min-h-screen container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Test New Registration Flow</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Magic Link Registration Flow</h2>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Test the new registration flow:</p>
          <ol className="list-decimal pl-5 mb-6 space-y-2">
            <li>Enter name and email (magic link)</li>
            <li>Check email and click on magic link</li>
            <li>Set password</li>
            <li>Select account type</li>
            <li>Get redirected to dashboard</li>
          </ol>
          <Button onClick={testMagicLinkRegistration}>
            Test Magic Link Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
