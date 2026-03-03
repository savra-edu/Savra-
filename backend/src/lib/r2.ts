import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for R2 compatibility
});

const BUCKET_NAME = process.env.R2_BUCKET || 'brillinity-management-system';

// Generate public URL for R2 object
const getPublicUrl = (key: string): string => {
  // R2 public URL format (assuming public bucket or custom domain)
  // You may need to configure a custom domain for public access
  const endpoint = process.env.R2_ENDPOINT || '';
  const accountId = endpoint.match(/([a-f0-9]+)\.r2\.cloudflarestorage\.com/)?.[1] || '';
  return `https://pub-${accountId}.r2.dev/${key}`;
};

// Upload buffer to R2
export const uploadBufferToR2 = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<{ url: string; key: string }> => {
  // Generate unique filename
  const extension = originalName.split('.').pop() || '';
  const uniqueFilename = `${uuidv4()}.${extension}`;
  const key = `${folder}/${uniqueFilename}`;

  // Upload to R2
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Generate public URL
  // Note: For R2, you may need to set up a custom domain or use presigned URLs
  // Using the R2.dev subdomain format for public access
  const url = getPublicUrl(key);

  return { url, key };
};

// Delete file from R2
export const deleteFromR2 = async (key: string): Promise<void> => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
};

export default r2Client;
