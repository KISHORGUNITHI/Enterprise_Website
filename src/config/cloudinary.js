import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Parse CLOUDINARY_URL if present, or use individual env vars
if (process.env.CLOUDINARY_URL) {
  try {
    const url = new URL(process.env.CLOUDINARY_URL);
    const [apiKey, apiSecret] = url.username && url.password 
      ? [url.username, url.password] 
      : (url.pathname.startsWith('//') ? url.href.replace('cloudinary://', '').split('@')[0].split(':') : []);
    const cloudName = url.hostname || url.pathname.replace(/^\//, '');

    cloudinary.config({
      cloud_name: cloudName || process.env.CLOUDINARY_CLOUD_NAME,
      api_key: apiKey || process.env.CLOUDINARY_API_KEY,
      api_secret: apiSecret || process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  } catch (err) {
    // Fallback directly to SDK environment parsing
    cloudinary.config({ secure: true });
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Upload a file buffer directly to Cloudinary using a stream
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options (folder, tags, etc.)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export function uploadImageBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const folder = options.folder || 'enterprise_store/general';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        timeout: 60000,
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Upload a base64 string or remote image URL to Cloudinary
 * @param {string} source - Base64 Data URI or remote image URL
 * @param {Object} options - Upload options (folder, etc.)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export async function uploadImageSource(source, options = {}) {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid image source provided for upload.');
  }

  // If already hosted on Cloudinary and no re-upload requested, return as is
  if (source.includes('res.cloudinary.com') && !options.force) {
    return {
      secure_url: source,
      url: source,
      public_id: null
    };
  }

  const folder = options.folder || 'enterprise_store/general';
  return cloudinary.uploader.upload(source, {
    folder,
    resource_type: 'auto',
    timeout: 60000,
    ...options
  });
}

/**
 * Delete an image by its public_id
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
export default cloudinary;
