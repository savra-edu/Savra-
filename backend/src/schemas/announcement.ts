import { z } from 'zod';

// Create announcement schema
export const createAnnouncementSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content must be at most 5000 characters'),
  attachmentUrl: z.string().url('Invalid URL').optional().nullable(),
});

// Update announcement schema
export const updateAnnouncementSchema = z.object({
  classId: z.string().uuid('Invalid class ID').optional(),
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  attachmentUrl: z.string().url('Invalid URL').optional().nullable(),
});

// Announcement query schema for filtering
export const announcementQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementQueryInput = z.infer<typeof announcementQuerySchema>;
