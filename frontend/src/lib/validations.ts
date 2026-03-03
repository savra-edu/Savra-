import { z } from 'zod'

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number is too long').optional().or(z.literal('')),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
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
