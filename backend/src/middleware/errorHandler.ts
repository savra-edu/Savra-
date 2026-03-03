import { Request, Response, NextFunction } from 'express';
import { internalErrorResponse } from '../utils/response';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle known AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: `A record with this ${field} already exists`,
        },
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });
      return;
    }
  }

  // Handle unknown errors
  internalErrorResponse(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  );
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
