import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload file from path
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'savra-ai'
): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// Upload from buffer (for multer)
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string = 'savra-ai'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      })
      .end(buffer);
  });
};

// Delete file
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
