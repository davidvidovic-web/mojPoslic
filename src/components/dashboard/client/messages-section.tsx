'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, Users, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ClientMessagesSection() {
  const t = useTranslations('dashboard.client.messages')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('unreadMessages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">{t('newMessagesFromTaskers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeConversations')}</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">{t('ongoingConversations')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            {t('recentMessages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('noMessagesYet')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('messagesFromTaskersWillAppear')}
            </p>
            <Button variant="outline" className="mt-4">
              <Send className="h-4 w-4 mr-2" />
              {t('startConversation')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
