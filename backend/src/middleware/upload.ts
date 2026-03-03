import multer from 'multer';
import { Request } from 'express';

// File filter for images
const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'));
  }
};

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// Avatar upload configuration
export const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFilter,
});

// General file upload configuration (for documents, etc.)
export const fileUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Export default for single avatar upload
export default avatarUpload;
