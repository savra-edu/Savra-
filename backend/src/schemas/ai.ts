import { z } from 'zod';

// AI Query schema for chat messages
export const aiQuerySchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
});

// AI Analyze schema for image/document analysis
export const aiAnalyzeSchema = z.object({
  fileUrl: z.string().url('Valid file URL required'),
  prompt: z.string().max(1000, 'Prompt too long').optional(),
  type: z.enum(['image', 'document']).optional().default('image'),
});

// Conversation query schema for pagination
export const conversationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Export types
export type AIQueryInput = z.infer<typeof aiQuerySchema>;
export type AIAnalyzeInput = z.infer<typeof aiAnalyzeSchema>;
export type ConversationQueryInput = z.infer<typeof conversationQuerySchema>;
