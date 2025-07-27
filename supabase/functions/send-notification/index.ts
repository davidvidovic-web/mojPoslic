import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  userId: string
  type: 'JOB_APPLICATION' | 'JOB_UPDATE' | 'NEW_MESSAGE' | 'SYSTEM' | 'PROMOTION'
  title: string
  message: string
  data?: Record<string, any>
  notificationId?: string
  sendEmail?: boolean
  sendPush?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      userId, 
      type, 
      title, 
      message, 
      data = {}, 
      notificationId,
      sendEmail = false,
      sendPush = false 
    }: NotificationRequest = await req.json()

    if (!userId || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user preferences
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('email, name, notification_preferences')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let finalNotificationId = notificationId

    // Create notification record if not provided
    if (!finalNotificationId) {
      const { data: notification, error: notifError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          is_read: false
        })
        .select('id')
        .single()

      if (notifError) {
        throw notifError
      }

      finalNotificationId = notification.id
    }

    // Send real-time notification via Supabase Realtime
    const realtimePayload = {
      type: 'notification',
      payload: {
        id: finalNotificationId,
        user_id: userId,
        type,
        title,
        message,
        data,
        created_at: new Date().toISOString(),
        is_read: false
      }
    }

    // Publish to user's private channel
    await supabaseClient
      .channel(`user:${userId}`)
      .send({
        type: 'broadcast',
        event: 'notification',
        payload: realtimePayload
      })

    const results = {
      notificationId: finalNotificationId,
      realtime: true,
      email: false,
      push: false
    }

    // Send email notification if requested and user allows
    if (sendEmail && user.notification_preferences?.email !== false) {
      try {
        // Call send-email Edge Function
        const emailResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: user.email,
              template: getEmailTemplate(type),
              data: {
                userName: user.name,
                title,
                message,
                ...data
              }
            }),
          }
        )

        if (emailResponse.ok) {
          results.email = true
        } else {
          console.error('Email notification failed:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError)
      }
    }

    // Send push notification if requested and user allows
    if (sendPush && user.notification_preferences?.push !== false) {
      try {
        // For push notifications, you would integrate with:
        // - Firebase Cloud Messaging (FCM)
        // - Apple Push Notification Service (APNs)
        // - Web Push API
        
        // Example with a generic push service:
        const pushResponse = await sendPushNotification({
          userId,
          title,
          message,
          data,
          userDevices: await getUserDeviceTokens(userId, supabaseClient)
        })

        results.push = pushResponse.success
      } catch (pushError) {
        console.error('Push notification error:', pushError)
      }
    }

    // Update notification count for user
    await supabaseClient.rpc('increment_unread_notifications', {
      user_id: userId
    })

    // Log notification activity
    await supabaseClient
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_data: {
          last_notification: new Date().toISOString(),
          notification_type: type,
          notification_sent: results
        },
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: finalNotificationId,
        channels_sent: results,
        message: 'Notification sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-notification function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function getEmailTemplate(notificationType: string): string {
  const templateMap: Record<string, string> = {
    'JOB_APPLICATION': 'application-received',
    'JOB_UPDATE': 'application-status-update',
    'NEW_MESSAGE': 'new-message',
    'SYSTEM': 'welcome',
    'PROMOTION': 'job-matched'
  }
  
  return templateMap[notificationType] || 'welcome'
}

async function getUserDeviceTokens(userId: string, supabaseClient: any) {
  // Get user's device tokens for push notifications
  const { data: sessions } = await supabaseClient
    .from('user_sessions')
    .select('session_data')
    .eq('user_id', userId)
    .not('session_data->device_token', 'is', null)

  return sessions?.map((session: any) => session.session_data.device_token).filter(Boolean) || []
}

async function sendPushNotification(options: {
  userId: string
  title: string
  message: string
  data: Record<string, any>
  userDevices: string[]
}) {
  // Placeholder for push notification implementation
  // You would implement your preferred push service here
  
  console.log('Push notification would be sent:', {
    devices: options.userDevices.length,
    title: options.title,
    message: options.message
  })

  // Return mock success for now
  return { success: options.userDevices.length > 0 }
}
