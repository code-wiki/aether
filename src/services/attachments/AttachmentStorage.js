/**
 * AttachmentStorage - IndexedDB storage operations for attachments
 */

import conversationDB from '../storage/conversationDB.js';

class AttachmentStorage {
  constructor() {
    this.db = conversationDB;
  }

  /**
   * Save an attachment to IndexedDB
   * @param {Object} attachment - Attachment object
   * @returns {Promise<boolean>} Success status
   */
  async save(attachment) {
    try {
      await this.db.saveAttachment(attachment);
      return true;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to save attachment:', error);
      throw error;
    }
  }

  /**
   * Get an attachment by ID
   * @param {string} id - Attachment ID
   * @returns {Promise<Object|null>} Attachment object or null
   */
  async get(id) {
    try {
      const attachment = await this.db.getAttachment(id);
      return attachment || null;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to get attachment:', error);
      throw error;
    }
  }

  /**
   * Get all attachments for a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Array>} Array of attachments
   */
  async getByMessage(messageId) {
    try {
      return await this.db.getAttachmentsByMessage(messageId);
    } catch (error) {
      console.error('[AttachmentStorage] Failed to get attachments by message:', error);
      throw error;
    }
  }

  /**
   * Get all attachments for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Array of attachments
   */
  async getByConversation(conversationId) {
    try {
      return await this.db.getAttachmentsByConversation(conversationId);
    } catch (error) {
      console.error('[AttachmentStorage] Failed to get attachments by conversation:', error);
      throw error;
    }
  }

  /**
   * Delete an attachment
   * @param {string} id - Attachment ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      await this.db.deleteAttachment(id);
      return true;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to delete attachment:', error);
      throw error;
    }
  }

  /**
   * Delete all attachments for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<number>} Number of attachments deleted
   */
  async deleteByConversation(conversationId) {
    try {
      const attachments = await this.getByConversation(conversationId);
      let deletedCount = 0;

      for (const attachment of attachments) {
        await this.delete(attachment.id);
        deletedCount++;
      }

      return deletedCount;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to delete attachments by conversation:', error);
      throw error;
    }
  }

  /**
   * Delete all attachments for a message
   * @param {string} messageId - Message ID
   * @returns {Promise<number>} Number of attachments deleted
   */
  async deleteByMessage(messageId) {
    try {
      const attachments = await this.getByMessage(messageId);
      let deletedCount = 0;

      for (const attachment of attachments) {
        await this.delete(attachment.id);
        deletedCount++;
      }

      return deletedCount;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to delete attachments by message:', error);
      throw error;
    }
  }

  /**
   * Clean up orphaned attachments
   * @returns {Promise<number>} Number of attachments cleaned up
   */
  async cleanupOrphaned() {
    try {
      return await this.db.cleanupOrphanedAttachments();
    } catch (error) {
      console.error('[AttachmentStorage] Failed to cleanup orphaned attachments:', error);
      throw error;
    }
  }

  /**
   * Get total storage size for attachments
   * @param {string} conversationId - Optional conversation ID to filter
   * @returns {Promise<number>} Total size in bytes
   */
  async getTotalSize(conversationId = null) {
    try {
      const attachments = conversationId
        ? await this.getByConversation(conversationId)
        : await this.db.db.getAll('attachments');

      return attachments.reduce((total, att) => total + (att.size || 0), 0);
    } catch (error) {
      console.error('[AttachmentStorage] Failed to get total size:', error);
      throw error;
    }
  }

  /**
   * Get attachment statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    try {
      const attachments = await this.db.db.getAll('attachments');

      const stats = {
        total: attachments.length,
        totalSize: attachments.reduce((sum, att) => sum + (att.size || 0), 0),
        byType: {},
        bySource: {},
      };

      attachments.forEach(att => {
        // Count by type
        const type = att.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count by source
        const source = att.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Export attachments for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Array of attachment data (without large binary data)
   */
  async exportConversationAttachments(conversationId) {
    try {
      const attachments = await this.getByConversation(conversationId);

      return attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        source: att.source,
        metadata: att.metadata,
        messageId: att.messageId,
        conversationId: att.conversationId,
        createdAt: att.createdAt,
        // Note: Exclude 'data' field to reduce export size
      }));
    } catch (error) {
      console.error('[AttachmentStorage] Failed to export attachments:', error);
      throw error;
    }
  }

  /**
   * Check if an attachment exists with the same hash (for deduplication)
   * @param {string} hash - SHA-256 hash of the file data
   * @returns {Promise<Object|null>} Existing attachment or null
   */
  async findByHash(hash) {
    try {
      const allAttachments = await this.db.db.getAll('attachments');
      return allAttachments.find(att => att.metadata?.hash === hash) || null;
    } catch (error) {
      console.error('[AttachmentStorage] Failed to find by hash:', error);
      throw error;
    }
  }
}

// Export singleton instance
const attachmentStorage = new AttachmentStorage();
export default attachmentStorage;
