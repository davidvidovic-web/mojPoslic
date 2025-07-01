'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Mail } from 'lucide-react'

export function HelpSupportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Need help? Our support team is here to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
