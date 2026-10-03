import multer from 'multer';

// Memory storage keeps file buffers in memory for direct streaming to Cloudinary
const storage = multer.memoryStorage();

// Validate image file formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, AVIF, and SVG images are allowed.');
    error.status = 400;
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB per file limit
  }
});

export default upload;
