import { AdminVariantRepository } from '../repositories/AdminVariantRepository.js';

export class AdminVariantService {
  constructor() {
    this.repository = new AdminVariantRepository();
  }

  /**
   * List variants with optional filters and pagination
   */
  async list(filters = {}) {
    try {
      const where = {};

      // Filter by product
      if (filters.productId) {
        where.productId = filters.productId;
      }

      // Filter by availability
      if (filters.availability && ['AVAILABLE', 'NOT_AVAILABLE'].includes(filters.availability)) {
        where.availability = filters.availability;
      }

      // Pagination
      const page = Math.max(1, parseInt(filters.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
      const skip = (page - 1) * limit;

      const { variants, total } = await this.repository.findAll(where, skip, limit);

      return {
        success: true,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        count: variants.length,
        data: variants
      };
    } catch (err) {
      const error = new Error(`Failed to fetch variants: ${err.message}`);
      error.status = 500;
      throw error;
    }
  }

  /**
   * Create a new variant
   * Required: productId, attributeValueIds (array of at least one attribute value)
   * Optional: availability, priceOverride
   */
  async create(data) {
    try {
      // Validate required fields
      if (!data.productId || !data.attributeValueIds || !Array.isArray(data.attributeValueIds) || data.attributeValueIds.length === 0) {
        const error = new Error('Missing required fields: productId, attributeValueIds (must be non-empty array)');
        error.status = 400;
        throw error;
      }

      // Check if product exists
      const product = await this.repository.productExists(data.productId);
      if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
      }

      // Validate all attribute values exist and collect their attributes
      const attributeMap = new Map(); // Track which attributes are being used
      const attributeValueIds = [];

      for (const valueId of data.attributeValueIds) {
        const attributeValue = await this.repository.attributeValueExists(valueId);
        
        if (!attributeValue) {
          const error = new Error(`Attribute value with ID ${valueId} not found`);
          error.status = 404;
          throw error;
        }

        const attributeId = attributeValue.attributeId;
        const attributeName = attributeValue.attribute.name;

        // Check for duplicate attributes (only one value per attribute allowed)
        if (attributeMap.has(attributeName)) {
          const error = new Error(`Multiple values provided for attribute "${attributeName}". Each variant can only have one value per attribute.`);
          error.status = 400;
          throw error;
        }

        attributeMap.set(attributeName, attributeValue);
        attributeValueIds.push(valueId);
      }

      // Validate price override if provided
      if (data.priceOverride !== undefined && data.priceOverride !== null) {
        const price = parseFloat(data.priceOverride);
        if (isNaN(price) || price <= 0) {
          const error = new Error('Price override must be a positive number');
          error.status = 400;
          throw error;
        }
      }

      // Create variant
      const variant = await this.repository.create({
        productId: data.productId,
        availability: data.availability || 'AVAILABLE',
        priceOverride: data.priceOverride || null,
        attributeValueIds
      });

      return {
        success: true,
        message: 'Variant created successfully',
        data: variant
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to create variant: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Toggle variant availability (AVAILABLE ↔ NOT_AVAILABLE)
   */
  async toggleAvailability(id) {
    try {
      const variant = await this.repository.findById(id);

      if (!variant) {
        const error = new Error('Variant not found');
        error.status = 404;
        throw error;
      }

      const updated = await this.repository.toggleAvailability(id);

      return {
        success: true,
        message: `Variant availability changed to ${updated.availability}`,
        data: updated
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to toggle availability: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Delete a variant
   */
  async remove(id) {
    try {
      // Check if variant exists
      const existing = await this.repository.findById(id);
      if (!existing) {
        const error = new Error('Variant not found');
        error.status = 404;
        throw error;
      }

      await this.repository.remove(id);

      return {
        success: true,
        message: 'Variant deleted successfully'
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to delete variant: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }
}
