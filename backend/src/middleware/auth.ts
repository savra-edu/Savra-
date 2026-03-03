import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { unauthorizedResponse, forbiddenResponse } from '../utils/response';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'teacher' | 'student' | 'admin';
        name: string;
      };
    }
  }
}

// JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
}

// Authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorizedResponse(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      unauthorizedResponse(res, 'User not found');
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      unauthorizedResponse(res, 'Token expired');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      unauthorizedResponse(res, 'Invalid token');
      return;
    }
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...roles: Array<'teacher' | 'student' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorizedResponse(res, 'Not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      forbiddenResponse(res, 'You do not have permission to access this resource');
      return;
    }

    next();
  };
};

// Generate access token
export const generateAccessToken = (payload: JwtPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (payload: JwtPayload): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn } as jwt.SignOptions);
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
};
