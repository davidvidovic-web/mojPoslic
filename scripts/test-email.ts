import { emailService } from '../src/lib/email'

async function testEmail() {
  console.log('Testing Resend email service...')
  
  try {
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from mojPoslić',
      html: '<p>This is a test email from the mojPoslić email service using Resend.</p>',
      text: 'This is a test email from the mojPoslić email service using Resend.'
    })
    
    if (result.success) {
      console.log('✅ Email sent successfully:', result.data)
    } else {
      console.error('❌ Email failed to send:', result.error)
    }
  } catch (error) {
    console.error('❌ Error testing email:', error)
  }
}

testEmail()
