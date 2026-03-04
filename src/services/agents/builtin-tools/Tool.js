/**
 * Tool - Base class for all workflow tools
 * Tools are reusable operations that can be called from workflows or agents
 */
class Tool {
  /**
   * @param {string} name - Tool identifier
   * @param {string} description - Human-readable description
   * @param {Object} parameters - Parameter schema with validation rules
   */
  constructor(name, description, parameters = {}) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  /**
   * Execute the tool with given parameters
   * Must be implemented by subclasses
   * @param {Object} params - Tool parameters
   * @returns {Promise<any>} Tool result
   */
  async execute(params) {
    throw new Error(`execute() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Validate parameters against schema
   * @param {Object} params - Parameters to validate
   * @throws {Error} If validation fails
   */
  validate(params) {
    // Check required parameters
    for (const [key, schema] of Object.entries(this.parameters)) {
      if (schema.required && !(key in params)) {
        throw new Error(`Missing required parameter: ${key}`);
      }

      const value = params[key];

      // Skip validation if parameter is optional and not provided
      if (!schema.required && value === undefined) {
        continue;
      }

      // Type validation
      if (schema.type) {
        switch (schema.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new Error(`Parameter ${key} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Parameter ${key} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Parameter ${key} must be a boolean`);
            }
            break;
          case 'enum':
            if (!schema.values.includes(value)) {
              throw new Error(`Parameter ${key} must be one of: ${schema.values.join(', ')}`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              throw new Error(`Parameter ${key} must be an array`);
            }
            break;
          case 'object':
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
              throw new Error(`Parameter ${key} must be an object`);
            }
            break;
        }
      }

      // Min/Max validation for numbers
      if (schema.type === 'number') {
        if (schema.min !== undefined && value < schema.min) {
          throw new Error(`Parameter ${key} must be >= ${schema.min}`);
        }
        if (schema.max !== undefined && value > schema.max) {
          throw new Error(`Parameter ${key} must be <= ${schema.max}`);
        }
      }

      // Length validation for strings
      if (schema.type === 'string') {
        if (schema.minLength && value.length < schema.minLength) {
          throw new Error(`Parameter ${key} must be at least ${schema.minLength} characters`);
        }
        if (schema.maxLength && value.length > schema.maxLength) {
          throw new Error(`Parameter ${key} must be at most ${schema.maxLength} characters`);
        }
      }
    }
  }

  /**
   * Get tool metadata for registration
   * @returns {Object} Tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }

  /**
   * Convert URL to base64 data URL
   * @param {string} url - URL to fetch and convert
   * @returns {Promise<string>} Base64 data URL
   */
  async urlToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[Tool] Failed to convert URL to base64:', error);
      throw new Error(`Failed to fetch and convert URL: ${error.message}`);
    }
  }

  /**
   * Generate a unique ID
   * @returns {string} UUID
   */
  generateId() {
    return crypto.randomUUID();
  }
}

export default Tool;
