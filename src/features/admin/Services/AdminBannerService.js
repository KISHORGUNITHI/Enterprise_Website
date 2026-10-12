import { AdminBannerRepository } from '../repositories/AdminBannerRepository.js';
import { uploadImageSource } from '../../../config/cloudinary.js';

export class AdminBannerService {
  constructor() {
    this.repository = new AdminBannerRepository();
  }

  /**
   * Helper: Ensure image is uploaded to Cloudinary if given as DataURI
   */
  async _resolveImageUrl(rawImage) {
    if (!rawImage || typeof rawImage !== 'string') return null;
    const trimmed = rawImage.trim();
    if (!trimmed) return null;

    // If it's a base64 data URI, upload to Cloudinary
    if (trimmed.startsWith('data:image/')) {
      try {
        const uploadRes = await uploadImageSource(trimmed, { folder: 'enterprise_store/banners' });
        return uploadRes.secure_url || uploadRes.url;
      } catch (err) {
        console.error('Failed to upload banner image to Cloudinary:', err);
        throw new Error(`Cloudinary upload failed: ${err.message}`);
      }
    }

    return trimmed;
  }

  /**
   * List banners with optional filters
   * Query params: status (ACTIVE/INACTIVE), search (title/slug)
   */
  async list(filters = {}) {
    try {
      const where = {};

      // Filter by status
      if (filters.status) {
        where.status = filters.status;
      }

      // Search by title or slug
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { slug: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Sort by displayOrder first, then by createdAt
      const orderBy = [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ];

      const banners = await this.repository.findAll(where, orderBy);

      return {
        success: true,
        count: banners.length,
        data: banners
      };
    } catch (err) {
      const error = new Error(`Failed to fetch banners: ${err.message}`);
      error.status = 500;
      throw error;
    }
  }

  /**
   * Create a new banner
   * Required: slug (and either image or text content)
   * Optional text fields: title, eyebrow, subtitle, ctaText, badge
   * Optional presentation fields: status, bgGradient, accentColor, displayOrder, imageUrl/image
   */
  async create(data) {
    try {
      // Validate genuinely required destination slug
      if (!data.slug || !String(data.slug).trim()) {
        const error = new Error('Missing required field: slug');
        error.status = 400;
        throw error;
      }

      const slugVal = String(data.slug).trim();

      // Check if slug already exists
      const existing = await this.repository.findBySlug(slugVal);
      if (existing) {
        const error = new Error('Banner slug already exists');
        error.status = 409;
        throw error;
      }

      const rawImg = data.imageUrl || data.image || null;
      const hasImage = Boolean(rawImg && String(rawImg).trim());
      const hasText = Boolean(
        (data.title && String(data.title).trim()) ||
        (data.eyebrow && String(data.eyebrow).trim()) ||
        (data.subtitle && String(data.subtitle).trim()) ||
        (data.ctaText && String(data.ctaText).trim()) ||
        (data.badge && String(data.badge).trim())
      );

      // A banner must provide either text content or an image
      if (!hasText && !hasImage) {
        const error = new Error('Banner must provide either text content or an image');
        error.status = 400;
        throw error;
      }

      const resolvedImageUrl = await this._resolveImageUrl(rawImg);

      // Create with defaults (text fields are optional, storing empty strings or null)
      const banner = await this.repository.create({
        title: data.title ? String(data.title).trim() : '',
        eyebrow: data.eyebrow ? String(data.eyebrow).trim() : '',
        subtitle: data.subtitle ? String(data.subtitle).trim() : '',
        ctaText: data.ctaText ? String(data.ctaText).trim() : '',
        slug: slugVal,
        badge: data.badge ? String(data.badge).trim() : null,
        imageUrl: resolvedImageUrl,
        status: data.status || 'ACTIVE',
        bgGradient: data.bgGradient || 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 100%)',
        accentColor: data.accentColor || '#f58500',
        displayOrder: data.displayOrder ? parseInt(data.displayOrder, 10) : 0
      });

      return {
        success: true,
        message: 'Banner created successfully',
        data: banner
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to create banner: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Update a banner
   */
  async update(id, data) {
    try {
      // Check if banner exists
      const existing = await this.repository.findById(id);
      if (!existing) {
        const error = new Error('Banner not found');
        error.status = 404;
        throw error;
      }

      // If slug is being updated, check for duplicates
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await this.repository.findBySlug(data.slug);
        if (slugExists && slugExists.id !== id) {
          const error = new Error('Banner slug already exists');
          error.status = 409;
          throw error;
        }
      }

      const updateData = { ...data };
      delete updateData.image;

      if (data.imageUrl !== undefined || data.image !== undefined) {
        const rawImg = data.imageUrl !== undefined ? data.imageUrl : data.image;
        updateData.imageUrl = await this._resolveImageUrl(rawImg);
      }

      if (updateData.displayOrder !== undefined) {
        updateData.displayOrder = parseInt(updateData.displayOrder, 10) || 0;
      }

      // Handle optional text fields consistently
      if (data.title !== undefined) updateData.title = data.title ? String(data.title).trim() : '';
      if (data.eyebrow !== undefined) updateData.eyebrow = data.eyebrow ? String(data.eyebrow).trim() : '';
      if (data.subtitle !== undefined) updateData.subtitle = data.subtitle ? String(data.subtitle).trim() : '';
      if (data.ctaText !== undefined) updateData.ctaText = data.ctaText ? String(data.ctaText).trim() : '';
      if (data.badge !== undefined) updateData.badge = data.badge ? String(data.badge).trim() : null;
      if (data.slug !== undefined) updateData.slug = String(data.slug).trim();

      const banner = await this.repository.update(id, updateData);

      return {
        success: true,
        message: 'Banner updated successfully',
        data: banner
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to update banner: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Toggle banner status (ACTIVE ↔ INACTIVE)
   */
  async toggle(id) {
    try {
      const banner = await this.repository.toggleStatus(id);

      if (!banner) {
        const error = new Error('Banner not found');
        error.status = 404;
        throw error;
      }

      return {
        success: true,
        message: `Banner status changed to ${banner.status}`,
        data: banner
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to toggle banner: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Delete a banner
   */
  async remove(id) {
    try {
      // Check if banner exists
      const existing = await this.repository.findById(id);
      if (!existing) {
        const error = new Error('Banner not found');
        error.status = 404;
        throw error;
      }

      await this.repository.remove(id);

      return {
        success: true,
        message: 'Banner deleted successfully'
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to delete banner: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }
}
