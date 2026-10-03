import { uploadImageBuffer, uploadImageSource } from '../../../config/cloudinary.js';

/**
 * Resolve Cloudinary target folder based on upload type & product category
 */
function resolveUploadFolder(type = 'general', category = '', customFolder = '') {
  if (customFolder) return customFolder;
  if (type === 'banner') {
    return 'enterprise_store/banners';
  }
  if (type === 'product') {
    if (!category) return 'enterprise_store/products';
    const cat = category.toLowerCase().trim();
    if (cat.includes('ac') || cat.includes('air condition')) return 'enterprise_store/products/acs';
    if (cat.includes('mobile') || cat.includes('phone')) return 'enterprise_store/products/mobiles';
    if (cat.includes('tv') || cat.includes('television')) return 'enterprise_store/products/tvs';
    if (cat.includes('refrigerat') || cat.includes('fridge')) return 'enterprise_store/products/refrigerators';
    if (cat.includes('theatre') || cat.includes('theater')) return 'enterprise_store/products/home-theatres';
    if (cat.includes('kitchen') || cat.includes('appliance')) return 'enterprise_store/products/kitchen';

    const cleanSlug = cat.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return cleanSlug ? `enterprise_store/products/${cleanSlug}` : 'enterprise_store/products';
  }
  return 'enterprise_store/general';
}

export class AdminUploadController {
  /**
   * Upload single image (via multipart file or base64 / URL string)
   */
  uploadSingle = async (req, res) => {
    try {
      const type = req.query.type || req.body.type || 'general';
      const category = req.query.category || req.body.category || '';
      const customFolder = req.query.folder || req.body.folder || '';
      const folder = resolveUploadFolder(type, category, customFolder);

      // 1. Check if multipart file is attached
      if (req.file && req.file.buffer) {
        const result = await uploadImageBuffer(req.file.buffer, { folder });
        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          folder
        });
      }

      // 2. Check if base64 data URI or remote image URL is provided in JSON body
      const imageSource = req.body.image || req.body.url || req.body.imageUrl;
      if (imageSource && typeof imageSource === 'string') {
        const result = await uploadImageSource(imageSource, { folder });
        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          folder
        });
      }

      return res.status(400).json({
        success: false,
        message: 'No file or image data provided for upload'
      });
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: `Image upload failed: ${err.message}`
      });
    }
  };

  /**
   * Upload multiple images concurrently (via multipart files)
   */
  uploadMultiple = async (req, res) => {
    try {
      const type = req.query.type || req.body.type || 'product';
      const category = req.query.category || req.body.category || '';
      const customFolder = req.query.folder || req.body.folder || '';
      const folder = resolveUploadFolder(type, category, customFolder);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided for batch upload'
        });
      }

      const uploadPromises = req.files.map(file => 
        uploadImageBuffer(file.buffer, { folder })
      );

      const results = await Promise.all(uploadPromises);

      const images = results.map(r => ({
        url: r.secure_url,
        public_id: r.public_id,
        format: r.format,
        width: r.width,
        height: r.height
      }));

      return res.status(200).json({
        success: true,
        message: `${images.length} images uploaded successfully to Cloudinary in ${folder}`,
        images,
        urls: images.map(img => img.url),
        folder
      });
    } catch (err) {
      console.error('Batch Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: `Batch image upload failed: ${err.message}`
      });
    }
  };
}

export default new AdminUploadController();
