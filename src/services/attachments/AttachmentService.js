/**
 * AttachmentService - Main service for handling file attachments
 */

import { v4 as uuidv4 } from 'uuid';
import attachmentValidator from './AttachmentValidator.js';
import attachmentStorage from './AttachmentStorage.js';

class AttachmentService {
  /**
   * Process a file upload
   * @param {File} file - File to upload
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Message ID (optional)
   * @param {string} provider - AI provider for size limit validation
   * @returns {Promise<Object>} Processed attachment object
   */
  async processUpload(file, conversationId, messageId = null, provider = 'default') {
    try {
      // Validate the file
      const validation = await attachmentValidator.validateFile(file, provider);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Generate hash for deduplication
      const hash = await this.generateHash(base64Data);

      // Check for existing attachment with same hash
      const existing = await attachmentStorage.findByHash(hash);
      if (existing && existing.conversationId === conversationId) {
        console.log('[AttachmentService] Using existing attachment (deduplicated):', existing.id);
        // Return existing attachment with updated message ID
        return {
          ...existing,
          messageId: messageId || existing.messageId,
        };
      }

      // Create attachment object
      const attachment = {
        id: uuidv4(),
        name: attachmentValidator.sanitizeFileName(file.name),
        type: file.type,
        size: file.size,
        data: base64Data,
        source: 'upload',
        conversationId,
        messageId,
        metadata: {
          hash,
          originalName: file.name,
          extension: attachmentValidator.getFileExtension(file.name),
          uploadedAt: Date.now(),
        },
        createdAt: Date.now(),
      };

      // Generate thumbnail for images
      if (file.type.startsWith('image/')) {
        const thumbnailData = await this.generateThumbnail(file);
        if (thumbnailData) {
          attachment.metadata.thumbnail = thumbnailData.data;
          attachment.metadata.width = thumbnailData.width;
          attachment.metadata.height = thumbnailData.height;
        }
      }

      // Save to storage
      await attachmentStorage.save(attachment);

      console.log('[AttachmentService] Attachment processed:', attachment.id, attachment.name);
      return attachment;
    } catch (error) {
      console.error('[AttachmentService] Failed to process upload:', error);
      throw error;
    }
  }

  /**
   * Convert File to base64 data URL
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 data URL
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        console.error('[AttachmentService] FileReader error:', error);
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate SHA-256 hash of file data
   * @param {string} dataUrl - Base64 data URL
   * @returns {Promise<string>} Hex-encoded hash
   */
  async generateHash(dataUrl) {
    try {
      // Extract base64 data (remove data URL prefix)
      const base64 = dataUrl.split(',')[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Generate SHA-256 hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex;
    } catch (error) {
      console.error('[AttachmentService] Failed to generate hash:', error);
      // Return a simple hash fallback
      return dataUrl.substring(0, 64);
    }
  }

  /**
   * Generate thumbnail for image
   * @param {File} file - Image file
   * @param {number} maxWidth - Maximum thumbnail width
   * @param {number} maxHeight - Maximum thumbnail height
   * @returns {Promise<Object|null>} { data, width, height } or null
   */
  async generateThumbnail(file, maxWidth = 200, maxHeight = 200) {
    try {
      if (!file.type.startsWith('image/')) {
        return null;
      }

      return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
          // Calculate thumbnail dimensions
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Draw thumbnail
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64
          const thumbnailData = canvas.toDataURL('image/jpeg', 0.7);

          resolve({
            data: thumbnailData,
            width: img.width,
            height: img.height,
          });
        };

        img.onerror = () => {
          console.warn('[AttachmentService] Failed to generate thumbnail');
          resolve(null);
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('[AttachmentService] Thumbnail generation error:', error);
      return null;
    }
  }

  /**
   * Get an attachment by ID
   * @param {string} id - Attachment ID
   * @returns {Promise<Object|null>} Attachment object
   */
  async getAttachment(id) {
    try {
      return await attachmentStorage.get(id);
    } catch (error) {
      console.error('[AttachmentService] Failed to get attachment:', error);
      throw error;
    }
  }

  /**
   * Get attachments for a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Array>} Array of attachments
   */
  async getAttachmentsByMessage(messageId) {
    try {
      return await attachmentStorage.getByMessage(messageId);
    } catch (error) {
      console.error('[AttachmentService] Failed to get attachments by message:', error);
      throw error;
    }
  }

  /**
   * Get attachments for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Array of attachments
   */
  async getAttachmentsByConversation(conversationId) {
    try {
      return await attachmentStorage.getByConversation(conversationId);
    } catch (error) {
      console.error('[AttachmentService] Failed to get attachments by conversation:', error);
      throw error;
    }
  }

  /**
   * Delete an attachment
   * @param {string} id - Attachment ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteAttachment(id) {
    try {
      await attachmentStorage.delete(id);
      console.log('[AttachmentService] Attachment deleted:', id);
      return true;
    } catch (error) {
      console.error('[AttachmentService] Failed to delete attachment:', error);
      throw error;
    }
  }

  /**
   * Download an attachment as a file
   * @param {Object} attachment - Attachment object
   */
  downloadAttachment(attachment) {
    try {
      const link = document.createElement('a');
      link.href = attachment.data;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('[AttachmentService] Downloaded attachment:', attachment.name);
    } catch (error) {
      console.error('[AttachmentService] Failed to download attachment:', error);
      throw error;
    }
  }

  /**
   * Get attachment size in human-readable format
   * @param {Object} attachment - Attachment object
   * @returns {string} Formatted size
   */
  getFormattedSize(attachment) {
    return attachmentValidator.formatFileSize(attachment.size);
  }

  /**
   * Check if attachment is an image
   * @param {Object} attachment - Attachment object
   * @returns {boolean}
   */
  isImage(attachment) {
    return attachment.type.startsWith('image/');
  }

  /**
   * Check if attachment is a PDF
   * @param {Object} attachment - Attachment object
   * @returns {boolean}
   */
  isPDF(attachment) {
    return attachment.type === 'application/pdf';
  }

  /**
   * Check if attachment is text
   * @param {Object} attachment - Attachment object
   * @returns {boolean}
   */
  isText(attachment) {
    return attachment.type.startsWith('text/') || attachment.type === 'application/json';
  }

  /**
   * Get file icon for attachment type
   * @param {Object} attachment - Attachment object
   * @returns {string} Icon emoji or character
   */
  getFileIcon(attachment) {
    if (this.isImage(attachment)) return '🖼️';
    if (this.isPDF(attachment)) return '📄';
    if (this.isText(attachment)) return '📝';
    if (attachment.type.includes('csv')) return '📊';
    return '📎';
  }

  /**
   * Clean up orphaned attachments
   * @returns {Promise<number>} Number of attachments cleaned up
   */
  async cleanupOrphaned() {
    try {
      const count = await attachmentStorage.cleanupOrphaned();
      console.log(`[AttachmentService] Cleaned up ${count} orphaned attachments`);
      return count;
    } catch (error) {
      console.error('[AttachmentService] Failed to cleanup orphaned attachments:', error);
      throw error;
    }
  }

  /**
   * Get attachment storage statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    try {
      return await attachmentStorage.getStats();
    } catch (error) {
      console.error('[AttachmentService] Failed to get stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
const attachmentService = new AttachmentService();
export default attachmentService;
