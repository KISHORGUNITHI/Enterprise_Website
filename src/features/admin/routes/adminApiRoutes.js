import express from 'express';
import adminGuard from '../../../middleware/adminguard.js';
import AdminStatsController from '../controllers/AdminStatsController.js';
import AdminBannerController from '../controllers/AdminBannerController.js';
import AdminProductController from '../controllers/AdminProductController.js';
import AdminAttributeController from '../controllers/AdminAttributeController.js';
import AdminVariantController from '../controllers/AdminVariantController.js';
import AdminUserController from '../controllers/AdminUserController.js';
import AdminOrderController from '../controllers/AdminOrderController.js';
import AdminProfileController from '../controllers/AdminProfileController.js';
import AdminUploadController from '../controllers/AdminUploadController.js';
import upload from '../../../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply admin guard middleware to all routes
router.use(adminGuard);

// Image Uploads (Cloudinary)
router.post('/upload', upload.single('image'), AdminUploadController.uploadSingle);
router.post('/upload/multiple', upload.array('images', 10), AdminUploadController.uploadMultiple);

// Stats
router.get('/stats', AdminStatsController.getStats);

// Banners
router.get('/banners', AdminBannerController.list);
router.post('/banners', AdminBannerController.create);
router.put('/banners/:id', AdminBannerController.update);
router.patch('/banners/:id/toggle', AdminBannerController.toggle);
router.delete('/banners/:id', AdminBannerController.remove);

// Products
router.get('/products', AdminProductController.list);
router.post('/products', AdminProductController.create);
router.put('/products/:id', AdminProductController.update);
router.patch('/products/:id/visibility', AdminProductController.toggleVisibility);
router.delete('/products/:id', AdminProductController.remove);

// Attributes
router.get('/attributes', AdminAttributeController.list);
router.post('/attributes', AdminAttributeController.create);
router.get('/attributes/:id/values', AdminAttributeController.listValues);
router.post('/attributes/:id/values', AdminAttributeController.createValue);

// Variants
router.get('/variants', AdminVariantController.list);
router.post('/variants', AdminVariantController.create);
router.patch('/variants/:id/availability', AdminVariantController.toggleAvailability);
router.delete('/variants/:id', AdminVariantController.remove);

// Users
router.get('/users', AdminUserController.list);
router.get('/users/:id', AdminUserController.getDetail);

// Orders
router.get('/orders', AdminOrderController.list);
router.get('/orders/:id', AdminOrderController.getDetail);
router.patch('/orders/:id/status', AdminOrderController.updateStatus);

// Profile
router.get('/profile', AdminProfileController.getProfile);
router.put('/profile', AdminProfileController.updateProfile);
router.put('/profile/password', AdminProfileController.updatePassword);

export default router;


