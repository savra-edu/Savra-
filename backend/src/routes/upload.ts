import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { fileUpload } from '../middleware/upload';
import { uploadBufferToR2 } from '../lib/r2';
import { successResponse, errorResponse } from '../utils/response';

const router = Router();

// POST /api/upload/file - Upload a file to R2
router.post(
  '/file',
  authMiddleware,
  fileUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      if (!req.file) {
        return errorResponse(res, 'No file provided', 400, 'MISSING_FILE');
      }

      // Upload to R2
      let uploadResult;
      try {
        uploadResult = await uploadBufferToR2(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'savra-ai/files'
        );
      } catch (uploadError) {
        console.error('R2 upload error:', uploadError);
        return errorResponse(
          res,
          'Failed to upload file. Please check R2 configuration.',
          500,
          'UPLOAD_FAILED'
        );
      }

      // Store file record in database
      const file = await prisma.file.create({
        data: {
          uploadedBy: userId,
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          fileUrl: uploadResult.url,
          publicId: uploadResult.key, // Using key as publicId for R2
        },
      });

      return successResponse(res, {
        id: file.id,
        url: file.fileUrl,
        key: file.publicId,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
