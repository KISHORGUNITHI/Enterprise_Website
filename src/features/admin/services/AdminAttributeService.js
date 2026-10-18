import { AdminAttributeRepository } from '../repositories/AdminAttributeRepository.js';

export class AdminAttributeService {
  constructor() {
    this.repository = new AdminAttributeRepository();
  }

  /**
   * List all variant attributes with their values
   */
  async list() {
    try {
      const attributes = await this.repository.findAll();

      return {
        success: true,
        count: attributes.length,
        data: attributes
      };
    } catch (err) {
      const error = new Error(`Failed to fetch attributes: ${err.message}`);
      error.status = 500;
      throw error;
    }
  }

  /**
   * Create a new attribute
   * Required: name (unique), displayName
   */
  async create(data) {
    try {
      // Validate required fields
      if (!data.name || !data.displayName) {
        const error = new Error('Missing required fields: name, displayName');
        error.status = 400;
        throw error;
      }

      // Sanitize attribute name
      const rawName = String(data.name).trim();
      const sanitizedName = rawName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)/g, '') || rawName;

      // Check if attribute name already exists
      const existing = await this.repository.findByName(sanitizedName);
      if (existing) {
        const error = new Error(`Attribute name "${sanitizedName}" already exists`);
        error.status = 409;
        throw error;
      }

      const createPayload = {
        name: sanitizedName,
        displayName: String(data.displayName).trim()
      };

      // Process initial values if provided
      let valuesToCreate = [];
      if (typeof data.values === 'string' && data.values.trim()) {
        valuesToCreate = data.values.split(',').map(v => v.trim()).filter(Boolean);
      } else if (Array.isArray(data.values)) {
        valuesToCreate = data.values;
      }

      if (valuesToCreate.length > 0) {
        const uniqueValues = [];
        const seenValues = new Set();

        for (const item of valuesToCreate) {
          const displayVal = typeof item === 'object' ? String(item.displayValue || item.value).trim() : String(item).trim();
          let slugVal = typeof item === 'object' && item.value ? String(item.value).trim() : displayVal.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)/g, '');
          if (!slugVal) slugVal = `val-${Date.now()}`;

          if (displayVal && !seenValues.has(slugVal)) {
            seenValues.add(slugVal);
            uniqueValues.push({
              value: slugVal,
              displayValue: displayVal
            });
          }
        }

        if (uniqueValues.length > 0) {
          createPayload.values = {
            create: uniqueValues
          };
        }
      }

      const attribute = await this.repository.create(createPayload);

      return {
        success: true,
        message: 'Attribute created successfully',
        data: attribute
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to create attribute: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * List all values for an attribute
   */
  async listValues(attributeId) {
    try {
      // Check if attribute exists
      const attribute = await this.repository.findById(attributeId);
      if (!attribute) {
        const error = new Error('Attribute not found');
        error.status = 404;
        throw error;
      }

      const values = await this.repository.findValues(attributeId);

      return {
        success: true,
        attribute: {
          id: attribute.id,
          name: attribute.name,
          displayName: attribute.displayName
        },
        count: values.length,
        data: values
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to fetch attribute values: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Create a new attribute value
   * Required: value (unique per attribute), displayValue
   */
  async createValue(attributeId, data) {
    try {
      const displayValue = String(data.displayValue || data.value || '').trim();
      let value = String(data.value || '').trim();
      if (!value && displayValue) {
        value = displayValue.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)/g, '');
      }

      // Validate required fields
      if (!value || !displayValue) {
        const error = new Error('Missing required field: displayValue');
        error.status = 400;
        throw error;
      }

      // Check if attribute exists
      const attribute = await this.repository.findById(attributeId);
      if (!attribute) {
        const error = new Error('Attribute not found');
        error.status = 404;
        throw error;
      }

      // Check if value already exists for this attribute
      const valueExists = await this.repository.valueExists(attributeId, value);
      if (valueExists) {
        const error = new Error(`Value "${value}" already exists for this attribute`);
        error.status = 409;
        throw error;
      }

      const valObj = await this.repository.createValue({
        attributeId,
        value,
        displayValue
      });

      return {
        success: true,
        message: 'Attribute value created successfully',
        data: valObj
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to create attribute value: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }
}
