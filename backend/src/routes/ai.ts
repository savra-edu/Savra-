import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { aiQuerySchema, aiAnalyzeSchema, conversationQuerySchema } from '../schemas/ai';
import { generateAIResponse, analyzeImage, generateConversationTitle } from '../lib/gemini';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

const router = Router();

// Rate limiting counter (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '20');
const RATE_WINDOW = 60 * 1000; // 1 minute

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
};

// POST /api/ai/query - Send message and get AI response
router.post(
  '/query',
  authMiddleware,
  authorize('student', 'teacher'),
  validate(aiQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as 'student' | 'teacher';
      const { message, conversationId, fileUrl } = req.body;

      // Rate limiting
      if (!checkRateLimit(userId)) {
        return errorResponse(res, 'Too many requests. Please wait a moment.', 429, 'RATE_LIMITED');
      }

      let conversation;
      let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      // Get or create conversation
      if (conversationId) {
        conversation = await prisma.aIConversation.findFirst({
          where: { id: conversationId, userId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 20, // Last 20 messages for context
            },
          },
        });

        if (!conversation) {
          return notFoundResponse(res, 'Conversation not found');
        }

        conversationHistory = conversation.messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));
      } else {
        // Create new conversation
        conversation = await prisma.aIConversation.create({
          data: {
            userId,
            title: generateConversationTitle(message),
          },
        });
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(
        message,
        userRole,
        conversationHistory,
        fileUrl ? `User has attached a file: ${fileUrl}` : undefined
      );

      // Save messages to database
      await prisma.$transaction([
        prisma.aIMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'user',
            content: message,
            fileUrl,
          },
        }),
        prisma.aIMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'assistant',
            content: aiResponse,
          },
        }),
        prisma.aIConversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        }),
      ]);

      return successResponse(res, {
        response: aiResponse,
        conversationId: conversation.id,
      });
    } catch (error) {
      console.error('AI Query Error:', error);
      if (error instanceof Error && (error.message.includes('Gemini') || error.message.includes('AI'))) {
        return errorResponse(res, 'AI service temporarily unavailable', 503, 'AI_SERVICE_ERROR');
      }
      next(error);
    }
  }
);

// POST /api/ai/analyze - Analyze image or document
router.post(
  '/analyze',
  authMiddleware,
  authorize('student', 'teacher'),
  validate(aiAnalyzeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as 'student' | 'teacher';
      const { fileUrl, prompt, type } = req.body;

      // Rate limiting
      if (!checkRateLimit(userId)) {
        return errorResponse(res, 'Too many requests. Please wait a moment.', 429, 'RATE_LIMITED');
      }

      let analysis: string;

      if (type === 'image') {
        analysis = await analyzeImage(fileUrl, prompt || '', userRole);
      } else {
        // For documents, provide context-aware response
        analysis = await generateAIResponse(
          prompt || 'Please summarize and explain the key points from this document.',
          userRole,
          [],
          `The user has uploaded a document: ${fileUrl}. Please help them understand it.`
        );
      }

      return successResponse(res, {
        analysis,
        fileUrl,
        type,
      });
    } catch (error) {
      console.error('AI Analyze Error:', error);
      next(error);
    }
  }
);

// GET /api/ai/conversations - List user's conversations
router.get(
  '/conversations',
  authMiddleware,
  authorize('student', 'teacher'),
  validateQuery(conversationQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const page = (req.query.page as unknown as number) || 1;
      const limit = (req.query.limit as unknown as number) || 20;
      const skip = (page - 1) * limit;

      const [conversations, total] = await Promise.all([
        prisma.aIConversation.findMany({
          where: { userId },
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { messages: true } },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.aIConversation.count({ where: { userId } }),
      ]);

      return successResponse(res, {
        conversations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/ai/conversations/:id - Get conversation with messages
router.get(
  '/conversations/:id',
  authMiddleware,
  authorize('student', 'teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const conversationId = req.params.id as string;

      const conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        return notFoundResponse(res, 'Conversation not found');
      }

      return successResponse(res, conversation);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/ai/conversations/:id - Delete conversation
router.delete(
  '/conversations/:id',
  authMiddleware,
  authorize('student', 'teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const conversationId = req.params.id as string;

      const conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        return notFoundResponse(res, 'Conversation not found');
      }

      await prisma.aIConversation.delete({
        where: { id: conversationId },
      });

      return successResponse(res, { message: 'Conversation deleted' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
