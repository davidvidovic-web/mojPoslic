import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

class EmailService {
  private resend: Resend | null;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || "mojPoslić <noreply@davidvidovic.com>";
    
    if (!apiKey) {
      console.warn('RESEND_API_KEY not found. Email functionality will be disabled.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail({ to, subject, text, html, from }: EmailOptions) {
    try {
      if (!this.resend) {
        console.warn('Email service not available - RESEND_API_KEY not configured');
        return {
          success: false,
          error: "Email service not configured"
        };
      }

      if (!html && !text) {
        throw new Error("Either html or text must be provided");
      }

      // Use the correct format for Resend
      const emailData = {
        from: from || this.fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      if (html) {
        emailData.html = html;
      }
      if (text) {
        emailData.text = text;
      }

      const data = await this.resend.emails.send(emailData);
      
      return { 
        success: true, 
        data,
        messageId: data.data?.id 
      };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendVerificationEmail(email: string, code: string, name?: string, locale: 'bs' | 'en' = 'bs') {
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
      
      if (isDevelopment) {
        // Return verification code in development mode
        return {
          success: true,
          data: { id: 'dev-mode' },
          messageId: 'dev-mode',
          developmentMode: true,
          verificationCode: code,
          message: `Development mode: Verification code is ${code}`
        };
      }

      if (!this.resend) {
        console.warn('Email service not available - RESEND_API_KEY not configured');
        return {
          success: false,
          error: "Email service not configured"
        };
      }

      // Localized content
      const content = this.getVerificationEmailContent(code, locale, name);

      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject: content.subject,
        html: content.html,
        text: content.text,
        // Add tags for better tracking
        tags: [
          { name: 'type', value: 'verification' },
          { name: 'locale', value: locale }
        ]
      });

      return { 
        success: true, 
        data,
        messageId: data.data?.id 
      };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  private getVerificationEmailContent(code: string, locale: 'bs' | 'en' = 'bs', name?: string) {
    const isBosnian = locale === 'bs';
    
    const greeting = name 
      ? (isBosnian ? `Zdravo ${name}!` : `Hello ${name}!`)
      : (isBosnian ? 'Zdravo!' : 'Hello!');

    const subject = isBosnian 
      ? 'Potvrdite vašu email adresu - mojPoslić'
      : 'Verify your email address - mojPoslić';

    const content = {
      welcome: isBosnian ? 'Dobrodošli na mojPoslić!' : 'Welcome to mojPoslić!',
      thankYou: isBosnian 
        ? 'Hvala vam što ste kreirali nalog. Molimo potvrdite vašu email adresu koristeći kod ispod:'
        : 'Thank you for creating an account. Please verify your email address using the code below:',
      enterCode: isBosnian 
        ? 'Unesite ovaj kod na stranici za verifikaciju'
        : 'Enter this code on the verification page',
      expiry: isBosnian
        ? 'Ovaj kod će isteći za 15 minuta.'
        : 'This code will expire in 15 minutes.',
      ignore: isBosnian
        ? 'Ako niste kreirali ovaj nalog, možete sigurno ignorisati ovaj email.'
        : "If you didn't create this account, you can safely ignore this email."
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0; font-size: 28px;">mojPoslić</h1>
        </div>
        
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">${content.welcome}</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          ${greeting}
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          ${content.thankYou}
        </p>
        
        <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
          <h1 style="color: #16a34a; font-size: 42px; letter-spacing: 6px; margin: 0; font-family: 'Courier New', monospace; font-weight: bold;">
            ${code}
          </h1>
          <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
            ${content.enterCode}
          </p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
            <strong>⏰ ${content.expiry}</strong>
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;" />
        
        <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
          ${content.ignore}
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} mojPoslić. ${isBosnian ? 'Sva prava zadržana.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    `;

    const text = `
${content.welcome}

${greeting}

${content.thankYou}

${isBosnian ? 'Vaš kod za verifikaciju:' : 'Your verification code:'} ${code}

${content.expiry}

${content.ignore}

© ${new Date().getFullYear()} mojPoslić. ${isBosnian ? 'Sva prava zadržana.' : 'All rights reserved.'}
    `.trim();

    return {
      subject,
      html,
      text
    };
  }

  // Add method for sending password reset emails
  async sendPasswordResetEmail(email: string, resetToken: string, name?: string, locale: 'bs' | 'en' = 'bs') {
    try {
      if (!this.resend) {
        console.warn('Email service not available - RESEND_API_KEY not configured');
        return {
          success: false,
          error: "Email service not configured"
        };
      }

      const isBosnian = locale === 'bs';
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/${locale}/auth/reset-password?token=${resetToken}`;

      const greeting = name 
        ? (isBosnian ? `Zdravo ${name}!` : `Hello ${name}!`)
        : (isBosnian ? 'Zdravo!' : 'Hello!');

      const subject = isBosnian 
        ? 'Reset vaše lozinke - mojPoslić'
        : 'Reset your password - mojPoslić';

      const content = {
        title: isBosnian ? 'Reset lozinke' : 'Password Reset',
        message: isBosnian 
          ? 'Zatražili ste reset vaše lozinke. Kliknite na dugme ispod da kreirate novu lozinku:'
          : 'You requested a password reset. Click the button below to create a new password:',
        button: isBosnian ? 'Resetuj lozinku' : 'Reset Password',
        expiry: isBosnian
          ? 'Ovaj link će isteći za 1 sat.'
          : 'This link will expire in 1 hour.',
        ignore: isBosnian
          ? 'Ako niste zatražili ovaj reset, možete sigurno ignorisati ovaj email.'
          : "If you didn't request this reset, you can safely ignore this email."
      };

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007cba; margin: 0; font-size: 28px;">mojPoslić</h1>
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">${content.title}</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            ${greeting}
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            ${content.message}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ${content.button}
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
              <strong>⏰ ${content.expiry}</strong>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;" />
          
          <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
            ${content.ignore}
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} mojPoslić. ${isBosnian ? 'Sva prava zadržana.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      `;

      const text = `
${content.title}

${greeting}

${content.message}

${isBosnian ? 'Link za reset:' : 'Reset link:'} ${resetUrl}

${content.expiry}

${content.ignore}

© ${new Date().getFullYear()} mojPoslić. ${isBosnian ? 'Sva prava zadržana.' : 'All rights reserved.'}
      `.trim();

      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject,
        html,
        text,
        tags: [
          { name: 'type', value: 'password-reset' },
          { name: 'locale', value: locale }
        ]
      });

      return { 
        success: true, 
        data,
        messageId: data.data?.id 
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  // Add method for general notifications
  async sendNotificationEmail(
    email: string, 
    subject: string, 
    message: string, 
    name?: string, 
    locale: 'bs' | 'en' = 'bs'
  ) {
    try {
      if (!this.resend) {
        console.warn('Email service not available - RESEND_API_KEY not configured');
        return {
          success: false,
          error: "Email service not configured"
        };
      }

      const isBosnian = locale === 'bs';
      const greeting = name 
        ? (isBosnian ? `Zdravo ${name}!` : `Hello ${name}!`)
        : (isBosnian ? 'Zdravo!' : 'Hello!');

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007cba; margin: 0; font-size: 28px;">mojPoslić</h1>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            ${greeting}
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #007cba; padding: 20px; margin: 20px 0;">
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0;">
              ${message}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} mojPoslić. ${isBosnian ? 'Sva prava zadržana.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      `;

      const text = `
${greeting}

${message}

© ${new Date().getFullYear()} mojPoslić. ${isBosnian ? 'Sva prava zadržana.' : 'All rights reserved.'}
      `.trim();

      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject,
        html,
        text,
        tags: [
          { name: 'type', value: 'notification' },
          { name: 'locale', value: locale }
        ]
      });

      return { 
        success: true, 
        data,
        messageId: data.data?.id 
      };
    } catch (error) {
      console.error("Error sending notification email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }
}

export const emailService = new EmailService();
