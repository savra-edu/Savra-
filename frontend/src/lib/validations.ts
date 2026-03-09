import { z } from 'zod'

/**
 * Contact form validation schema
 * Fields aligned with Mailchimp audience merge fields:
 *   EMAIL, FNAME, PHONE, COMPANY (School Name), LNAME (Message)
 */
export const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number is too long'),
  schoolName: z.string().max(200, 'School name is too long').optional().or(z.literal('')),
  message: z.string().max(2000, 'Message is too long').optional().or(z.literal('')),
})

/**
 * Type for validated contact form data
 */
export type ContactFormData = z.infer<typeof contactFormSchema>

/**
 * Validate contact form data
 * @param data - Raw form data to validate
 * @returns Validated and sanitized form data
 * @throws ZodError if validation fails
 */
export function validateContactForm(data: unknown): ContactFormData {
  return contactFormSchema.parse(data)
}
