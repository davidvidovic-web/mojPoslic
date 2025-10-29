import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, message, userEmail, userName, website } = body

    // Honeypot check - if filled, it's likely a bot
    if (website) {
      console.log('Honeypot triggered in support API - potential bot submission')
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      )
    }

    // Create email service instance
    const emailService = new EmailService()

    // Create email content
    const subject = `mojPoslić Podrška: ${type}`
    const html = `
      <h2>Nova poruka podrške</h2>
      <p><strong>Tip zahtjeva:</strong> ${type}</p>
      <p><strong>Email korisnika:</strong> ${userEmail || 'Neregistrovan korisnik'}</p>
      <p><strong>Ime korisnika:</strong> ${userName || 'Nepoznato'}</p>
      
      <h3>Poruka:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Poslano putem mojPoslić platforme
      </p>
    `

    const text = `
Tip zahtjeva: ${type}
Email korisnika: ${userEmail || 'Neregistrovan korisnik'}
Ime korisnika: ${userName || 'Nepoznato'}

Poruka:
${message}

---
Poslano putem mojPoslić platforme
    `.trim()

    // Send email to support
    const result = await emailService.sendEmail({
      to: 'info@mojposlic.com',
      subject,
      html,
      text,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Poruka je uspješno poslana'
      })
    } else {
      console.error('Failed to send support email:', result.error)
      return NextResponse.json(
        { error: 'Greška pri slanju poruke' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Support API error:', error)
    return NextResponse.json(
      { error: 'Interna greška servera' },
      { status: 500 }
    )
  }
}