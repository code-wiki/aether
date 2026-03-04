/**
 * AttachmentValidator - Validates file uploads for security and compliance
 */

// File signature (magic numbers) for common file types
const FILE_SIGNATURES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
  ],
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46],
  ],
};

// Provider-specific size limits (in bytes)
const PROVIDER_SIZE_LIMITS = {
  gemini: 20 * 1024 * 1024,      // 20MB
  claude: 5 * 1024 * 1024,       // 5MB
  openai: 20 * 1024 * 1024,      // 20MB
  default: 10 * 1024 * 1024,     // 10MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
];

class AttachmentValidator {
  /**
   * Validate a file for upload
   * @param {File} file - File object to validate
   * @param {string} provider - AI provider name (optional)
   * @returns {Object} { valid: boolean, error?: string }
   */
  async validateFile(file, provider = 'default') {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Validate MIME type
    const mimeTypeValidation = this.validateMimeType(file.type);
    if (!mimeTypeValidation.valid) {
      return mimeTypeValidation;
    }

    // Validate file size
    const sizeValidation = this.validateFileSize(file.size, provider);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }

    // Validate file name
    const nameValidation = this.validateFileName(file.name);
    if (!nameValidation.valid) {
      return nameValidation;
    }

    // Check file signature for images and PDFs
    if (this.shouldCheckSignature(file.type)) {
      const signatureValidation = await this.checkFileSignature(file);
      if (!signatureValidation.valid) {
        return signatureValidation;
      }
    }

    return { valid: true };
  }

  /**
   * Validate MIME type
   * @param {string} mimeType - MIME type to validate
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateMimeType(mimeType) {
    if (!mimeType) {
      return { valid: false, error: 'No MIME type provided' };
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `File type "${mimeType}" is not allowed. Supported types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate file size against provider limits
   * @param {number} size - File size in bytes
   * @param {string} provider - AI provider name
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateFileSize(size, provider = 'default') {
    const limit = PROVIDER_SIZE_LIMITS[provider] || PROVIDER_SIZE_LIMITS.default;

    if (size > limit) {
      const limitMB = (limit / (1024 * 1024)).toFixed(0);
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size (${sizeMB}MB) exceeds ${provider} limit of ${limitMB}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate file name for security
   * @param {string} fileName - File name to validate
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateFileName(fileName) {
    if (!fileName || fileName.trim() === '') {
      return { valid: false, error: 'File name is empty' };
    }

    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return {
        valid: false,
        error: 'File name contains invalid characters (path traversal attempt detected)',
      };
    }

    // Check for excessive length
    if (fileName.length > 255) {
      return { valid: false, error: 'File name is too long (max 255 characters)' };
    }

    return { valid: true };
  }

  /**
   * Check if file signature should be validated
   * @param {string} mimeType - MIME type
   * @returns {boolean}
   */
  shouldCheckSignature(mimeType) {
    return FILE_SIGNATURES.hasOwnProperty(mimeType);
  }

  /**
   * Validate file signature (magic numbers)
   * @param {File} file - File to check
   * @returns {Promise<Object>} { valid: boolean, error?: string }
   */
  async checkFileSignature(file) {
    try {
      const expectedSignatures = FILE_SIGNATURES[file.type];
      if (!expectedSignatures) {
        // No signature check needed for this file type
        return { valid: true };
      }

      // Read the first 16 bytes of the file
      const arrayBuffer = await file.slice(0, 16).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Check if any expected signature matches
      const isValid = expectedSignatures.some(signature => {
        return signature.every((byte, index) => {
          if (byte === null) return true; // null = wildcard
          return bytes[index] === byte;
        });
      });

      if (!isValid) {
        return {
          valid: false,
          error: `File signature does not match expected type "${file.type}". File may be corrupted or mislabeled.`,
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Failed to check file signature:', error);
      return {
        valid: false,
        error: 'Failed to read file for signature validation',
      };
    }
  }

  /**
   * Sanitize file name for safe storage
   * @param {string} fileName - Original file name
   * @returns {string} Sanitized file name
   */
  sanitizeFileName(fileName) {
    // Remove path separators and special characters
    return fileName
      .replace(/[/\\]/g, '') // Remove slashes
      .replace(/\.\./g, '')  // Remove parent directory references
      .replace(/[<>:"|?*]/g, '') // Remove Windows invalid characters
      .trim();
  }

  /**
   * Get file extension from name
   * @param {string} fileName - File name
   * @returns {string} File extension (lowercase, without dot)
   */
  getFileExtension(fileName) {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  /**
   * Get recommended provider size limit
   * @param {string} provider - AI provider name
   * @returns {number} Size limit in bytes
   */
  getProviderSizeLimit(provider) {
    return PROVIDER_SIZE_LIMITS[provider] || PROVIDER_SIZE_LIMITS.default;
  }

  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted string (e.g., "5.2 MB")
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Export singleton instance
const attachmentValidator = new AttachmentValidator();
export default attachmentValidator;
