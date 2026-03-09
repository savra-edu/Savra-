import type { ContactFormData } from './validations'

/**
 * Send admin notification email when a contact form is submitted
 * 
 * Note: This is a placeholder implementation. To enable email notifications:
 * 1. Set up an email service (e.g., SendGrid, Resend, Nodemailer with SMTP)
 * 2. Configure environment variables for API keys/credentials
 * 3. Implement the actual email sending logic here
 * 
 * @param data - Validated contact form data
 * @returns Promise that resolves when email is sent
 */
export async function sendAdminNotification(data: ContactFormData): Promise<void> {
  console.log('Admin notification email (would be sent):', {
    to: process.env.ADMIN_EMAIL || 'admin@example.com',
    subject: `New Contact Form Submission from ${data.firstName}`,
    from: data.email,
    body: `
New contact form submission:

Name: ${data.firstName}
Email: ${data.email}
Phone: ${data.phone}
School: ${data.schoolName || 'Not provided'}

Message:
${data.message || 'No message provided'}
    `.trim(),
  })

  // Example with Resend:
  // await resend.emails.send({
  //   from: 'contact@yourdomain.com',
  //   to: process.env.ADMIN_EMAIL,
  //   subject: `New Contact Form: ${data.firstName}`,
  //   html: `...`
  // })

  await Promise.resolve()
}
