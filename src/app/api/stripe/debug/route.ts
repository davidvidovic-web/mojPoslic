import { NextResponse } from 'next/server'

export async function GET() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const vercelUrl = process.env.VERCEL_URL
  
  return NextResponse.json({
    message: 'Stripe Webhook Configuration Debug',
    webhookSecretConfigured: !!webhookSecret,
    webhookSecretPrefix: webhookSecret ? webhookSecret.substring(0, 8) + '...' : 'NOT_SET',
    stripeSecretKeyConfigured: !!stripeSecretKey,
    stripeSecretKeyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 8) + '...' : 'NOT_SET',
    siteUrl,
    vercelUrl: vercelUrl ? `https://${vercelUrl}` : 'NOT_SET',
    expectedWebhookUrl: `${siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'NOT_SET')}/api/stripe/webhook`,
    testWebhookUrl: `${siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'NOT_SET')}/api/stripe/webhook-test`,
  })
}