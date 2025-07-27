import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  template: 'application-received' | 'application-status-update' | 'new-message' | 'job-matched' | 'welcome'
  data: {
    [key: string]: string | number | boolean
  }
}

const emailTemplates = {
  'application-received': {
    subject: 'New Job Application Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Job Application</h2>
        <p>Hello {{jobOwnerName}},</p>
        <p>You have received a new application for your job posting:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">{{jobTitle}}</h3>
          <p><strong>Applicant:</strong> {{applicantName}}</p>
          <p><strong>Applied on:</strong> {{applicationDate}}</p>
        </div>
        <p>
          <a href="{{applicationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Application
          </a>
        </p>
        <p>Best regards,<br>MojPoslic Team</p>
      </div>
    `
  },
  'application-status-update': {
    subject: 'Application Status Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Status Update</h2>
        <p>Hello {{applicantName}},</p>
        <p>Your application status has been updated:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">{{jobTitle}}</h3>
          <p><strong>Status:</strong> <span style="color: {{statusColor}};">{{newStatus}}</span></p>
          {{#if message}}
          <p><strong>Message:</strong> {{message}}</p>
          {{/if}}
        </div>
        {{#if isShortlisted}}
        <p>Congratulations! You've been shortlisted. The employer may reach out to you soon.</p>
        {{/if}}
        <p>
          <a href="{{applicationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Application
          </a>
        </p>
        <p>Best regards,<br>MojPoslic Team</p>
      </div>
    `
  },
  'new-message': {
    subject: 'New Message - {{conversationTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Message</h2>
        <p>Hello {{recipientName}},</p>
        <p>You have received a new message:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> {{senderName}}</p>
          <p><strong>Conversation:</strong> {{conversationTitle}}</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
            {{messagePreview}}
          </div>
        </div>
        <p>
          <a href="{{conversationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Conversation
          </a>
        </p>
        <p>Best regards,<br>MojPoslic Team</p>
      </div>
    `
  },
  'job-matched': {
    subject: 'New Job Matches Found!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Job Matches!</h2>
        <p>Hello {{userName}},</p>
        <p>We found {{matchCount}} new job matches for you:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          {{#each jobs}}
          <div style="border-bottom: 1px solid #ddd; padding: 15px 0;">
            <h4 style="margin: 0 0 8px 0;">{{title}}</h4>
            <p style="margin: 0; color: #666;">{{company}} • {{location}}</p>
            <p style="margin: 8px 0 0 0; color: #007bff;">{{matchScore}}% match</p>
          </div>
          {{/each}}
        </div>
        <p>
          <a href="{{jobsUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View All Matches
          </a>
        </p>
        <p>Best regards,<br>MojPoslic Team</p>
      </div>
    `
  },
  'welcome': {
    subject: 'Welcome to MojPoslic!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to MojPoslic!</h2>
        <p>Hello {{userName}},</p>
        <p>Welcome to MojPoslic - your connection to meaningful work opportunities.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Getting Started</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Complete your profile to get better job matches</li>
            <li>Browse available jobs in your area</li>
            <li>Use your connections to apply for jobs</li>
            <li>Connect with employers through our messaging system</li>
          </ul>
        </div>
        <p>You start with <strong>{{startingConnections}} connections</strong> to apply for jobs.</p>
        <p>
          <a href="{{profileUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Your Profile
          </a>
        </p>
        <p>Best regards,<br>MojPoslic Team</p>
      </div>
    `
  }
}

function interpolateTemplate(template: string, data: Record<string, any>): string {
  let result = template
  
  // Simple template interpolation (replace {{key}} with values)
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
  
  // Handle conditional blocks {{#if condition}}...{{/if}}
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return data[condition] ? content : ''
  })
  
  // Handle each loops {{#each array}}...{{/each}}
  result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, itemTemplate) => {
    const array = data[arrayKey]
    if (!Array.isArray(array)) return ''
    
    return array.map(item => interpolateTemplate(itemTemplate, { ...data, ...item })).join('')
  })
  
  return result
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

    const { to, subject, template, data }: EmailRequest = await req.json()

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: 'Email address and template are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get template
    const emailTemplate = emailTemplates[template]
    if (!emailTemplate) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Interpolate template
    const finalSubject = subject || interpolateTemplate(emailTemplate.subject, data)
    const finalHtml = interpolateTemplate(emailTemplate.html, data)

    // For development, we'll use a simple email service
    // In production, integrate with your preferred email provider (SendGrid, Resend, etc.)
    
    // Using Resend as example (replace with your service)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      // Log email for development
      console.log('EMAIL WOULD BE SENT:')
      console.log('To:', to)
      console.log('Subject:', finalSubject)
      console.log('HTML:', finalHtml)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (no API key configured)',
          preview: { to, subject: finalSubject }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MojPoslic <noreply@mojposlic.com>',
        to: [to],
        subject: finalSubject,
        html: finalHtml
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      throw new Error(`Email service error: ${errorData}`)
    }

    const emailResult = await emailResponse.json()

    // Log email activity
    await supabaseClient
      .from('user_sessions')
      .upsert({
        user_id: data.userId || 'system',
        session_data: {
          last_email_sent: new Date().toISOString(),
          email_template: template,
          email_to: to
        },
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        email_id: emailResult.id,
        template_used: template
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
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
