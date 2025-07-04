import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private resend: Resend | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not found. Email functionality will be disabled.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail({ to, subject, text, html }: EmailOptions) {
    try {
      if (!this.resend) {
        console.warn('Email service not available - RESEND_API_KEY not configured');
        return {
          success: false,
          error: "Email service not configured"
        };
      }

      if (html) {
        const data = await this.resend.emails.send({
          from: "mojPoslić <mail@davidvidovic.com>",
          to: [to],
          subject,
          html,
        });
        return { success: true, data };
      } else if (text) {
        const data = await this.resend.emails.send({
          from: "mojPoslić <mail@davidvidovic.com>",
          to: [to],
          subject,
          text,
        });
        return { success: true, data };
      } else {
        throw new Error("Either html or text must be provided");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      if (!this.resend) {
        console.warn('Email service not available - RESEND_API_KEY not configured');
        return {
          success: false,
          error: "Email service not configured"
        };
      }

      const data = await this.resend.emails.send({
        from: "mojPoslić <mail@davidvidovic.com>",
        to: [email],
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Welcome to mojPoslić!</h2>
            <p>Thank you for creating an account. Please verify your email address using the code below:</p>
            
            <div style="background-color: #f8f9fa; border: 2px dashed #007cba; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <h1 style="color: #007cba; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
                Enter this code on the verification page
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              <strong>This code will expire in 15 minutes.</strong>
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        `,
        text: `Welcome to mojPoslić! Your verification code is: ${code}. This code will expire in 15 minutes. If you didn't create this account, you can safely ignore this email.`,
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error };
    }
  }
}

export const emailService = new EmailService();
