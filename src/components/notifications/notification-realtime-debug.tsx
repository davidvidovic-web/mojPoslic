'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { useNotificationsQuery } from '@/hooks/queries/useNotifications'
import { supabase } from '@/lib/supabase'

export function NotificationRealtimeDebug() {
  const { user } = useSupabaseAuth()
  const { notifications: realtimeNotifications, unreadCount: realtimeUnreadCount } = useRealtimeNotifications()
  const { data: queryNotifications = [] } = useNotificationsQuery(user?.id || '')
  const [testing, setTesting] = useState(false)

  const queryUnreadCount = queryNotifications.filter(n => !n.is_read).length

  const createTestNotification = async () => {
    if (!user?.id) {
      console.error('No user logged in')
      return
    }

    setTesting(true)
    try {
      console.log('🧪 Creating test notification for user:', user.id)
      
      // Use service role to create notification
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          type: 'SYSTEM',
          title: 'Test Notification',
          message: `Test notification created at ${new Date().toLocaleTimeString()}`,
          data: { test: true, timestamp: Date.now() }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Test notification created:', result.data)
      } else {
        console.error('❌ Failed to create test notification:', result.error)
      }
    } catch (error) {
      console.error('❌ Error creating test notification:', error)
    } finally {
      setTesting(false)
    }
  }

  if (!user) {
    return <div className="p-4 bg-yellow-100 rounded">Please log in to test notifications</div>
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Notification Realtime Debug</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <strong>User ID:</strong>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded">{user.id}</div>
          </div>
          <div>
            <strong>Realtime Unread:</strong>
            <div className="text-lg font-bold text-blue-600">{realtimeUnreadCount}</div>
          </div>
          <div>
            <strong>Header Query Unread:</strong>
            <div className="text-lg font-bold text-green-600">{queryUnreadCount}</div>
            <div className="text-xs text-gray-500">
              {realtimeUnreadCount === queryUnreadCount ? '✅ Synced' : '❌ Out of sync'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Realtime Notifications ({realtimeNotifications.length}):</strong>
            <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
              {realtimeNotifications.length === 0 ? (
                <div className="text-gray-500">No notifications</div>
              ) : (
                realtimeNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-600">{notification.message}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <strong>Query Notifications ({queryNotifications.length}):</strong>
            <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
              {queryNotifications.length === 0 ? (
                <div className="text-gray-500">No notifications</div>
              ) : (
                queryNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-600">{notification.message}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(notification.created_at || '').toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          onClick={createTestNotification}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Creating...' : 'Create Test Notification'}
        </button>

        <div className="text-sm text-gray-600">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Click &ldquo;Create Test Notification&rdquo;</li>
            <li>Watch the browser console for realtime events</li>
            <li>Both unread counts should increment immediately</li>
            <li>Header notifications should update without refresh</li>
            <li>Both notification lists should show the new notification</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
