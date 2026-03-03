import { Response } from 'express';

// Success response
export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

// Error response
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  code: string = 'ERROR',
  details?: unknown
): Response => {
  const error: { code: string; message: string; details?: unknown } = {
    code,
    message,
  };

  if (details) {
    error.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error,
  });
};

// Common error responses
export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized'): Response => {
  return errorResponse(res, message, 401, 'UNAUTHORIZED');
};

export const forbiddenResponse = (res: Response, message: string = 'Forbidden'): Response => {
  return errorResponse(res, message, 403, 'FORBIDDEN');
};

export const notFoundResponse = (res: Response, message: string = 'Not found'): Response => {
  return errorResponse(res, message, 404, 'NOT_FOUND');
};

export const validationErrorResponse = (
  res: Response,
  details: Array<{ field: string; message: string }>
): Response => {
  return errorResponse(res, 'Invalid input data', 400, 'VALIDATION_ERROR', details);
};

export const internalErrorResponse = (
  res: Response,
  message: string = 'Internal server error'
): Response => {
  return errorResponse(res, message, 500, 'INTERNAL_ERROR');
};
