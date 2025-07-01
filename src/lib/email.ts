import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

interface MagicLinkOptions {
  email: string
  name: string
  url: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: process.env.EMAIL_PORT === '465', // true for port 465, false otherwise
    })
  }

  async sendEmail({ to, subject, text, html }: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Poslić'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      })
      return { success: true, messageId: info.messageId }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendMagicLink({ email, name, url }: MagicLinkOptions) {
    const subject = 'Complete your Poslić account setup'
    const text = `Hi ${name},\n\nWelcome to Poslić! Please click the link below to verify your email and set up your account:\n\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, ignore this email.\n\nBest regards,\nThe Poslić Team`
    const html = `<p>Hi ${name},</p><p>Welcome to Poslić! Please click the link below to verify your email and set up your account:</p><p><a href="${url}">${url}</a></p><p>This link will expire in 24 hours.</p><p>If you didn't create an account, ignore this email.</p><p>Best regards,<br/>The Poslić Team</p>`
    return this.sendEmail({ to: email, subject, text, html })
  }
}

export const emailService = new EmailService()
