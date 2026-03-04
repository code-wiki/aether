import React, { createContext, useContext, useState, useCallback } from 'react';
import attachmentService from '../services/attachments/AttachmentService.js';

const AttachmentContext = createContext();

export function useAttachment() {
  const context = useContext(AttachmentContext);
  if (!context) {
    throw new Error('useAttachment must be used within AttachmentProvider');
  }
  return context;
}

export function AttachmentProvider({ children }) {
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  /**
   * Upload a file attachment
   * @param {File} file - File to upload
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Message ID (optional)
   * @param {string} provider - AI provider for validation
   * @returns {Promise<Object>} Uploaded attachment
   */
  const uploadAttachment = useCallback(async (file, conversationId, messageId = null, provider = 'default') => {
    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const attachment = await attachmentService.processUpload(
        file,
        conversationId,
        messageId,
        provider
      );

      setAttachments(prev => [...prev, attachment]);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 1000);

      return attachment;
    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
      throw error;
    }
  }, []);

  /**
   * Upload multiple files
   * @param {FileList|File[]} files - Files to upload
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Message ID (optional)
   * @param {string} provider - AI provider for validation
   * @returns {Promise<Object[]>} Array of uploaded attachments
   */
  const uploadMultiple = useCallback(async (files, conversationId, messageId = null, provider = 'default') => {
    const fileArray = Array.from(files);
    const results = [];

    for (const file of fileArray) {
      try {
        const attachment = await uploadAttachment(file, conversationId, messageId, provider);
        results.push(attachment);
      } catch (error) {
        console.error(`[AttachmentContext] Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  }, [uploadAttachment]);

  /**
   * Get an attachment by ID
   * @param {string} id - Attachment ID
   * @returns {Promise<Object|null>} Attachment or null
   */
  const getAttachment = useCallback(async (id) => {
    try {
      return await attachmentService.getAttachment(id);
    } catch (error) {
      console.error('[AttachmentContext] Failed to get attachment:', error);
      return null;
    }
  }, []);

  /**
   * Get attachments for a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object[]>} Array of attachments
   */
  const getAttachmentsByMessage = useCallback(async (messageId) => {
    try {
      return await attachmentService.getAttachmentsByMessage(messageId);
    } catch (error) {
      console.error('[AttachmentContext] Failed to get attachments by message:', error);
      return [];
    }
  }, []);

  /**
   * Get attachments for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object[]>} Array of attachments
   */
  const getAttachmentsByConversation = useCallback(async (conversationId) => {
    try {
      return await attachmentService.getAttachmentsByConversation(conversationId);
    } catch (error) {
      console.error('[AttachmentContext] Failed to get attachments by conversation:', error);
      return [];
    }
  }, []);

  /**
   * Delete an attachment
   * @param {string} id - Attachment ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteAttachment = useCallback(async (id) => {
    try {
      await attachmentService.deleteAttachment(id);
      setAttachments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error('[AttachmentContext] Failed to delete attachment:', error);
      return false;
    }
  }, []);

  /**
   * Download an attachment
   * @param {Object} attachment - Attachment object
   */
  const downloadAttachment = useCallback((attachment) => {
    try {
      attachmentService.downloadAttachment(attachment);
    } catch (error) {
      console.error('[AttachmentContext] Failed to download attachment:', error);
      throw error;
    }
  }, []);

  /**
   * Clean up orphaned attachments
   * @returns {Promise<number>} Number of attachments cleaned up
   */
  const cleanupOrphaned = useCallback(async () => {
    try {
      return await attachmentService.cleanupOrphaned();
    } catch (error) {
      console.error('[AttachmentContext] Failed to cleanup orphaned attachments:', error);
      return 0;
    }
  }, []);

  /**
   * Get attachment statistics
   * @returns {Promise<Object>} Statistics object
   */
  const getStats = useCallback(async () => {
    try {
      return await attachmentService.getStats();
    } catch (error) {
      console.error('[AttachmentContext] Failed to get stats:', error);
      return { total: 0, totalSize: 0, byType: {}, bySource: {} };
    }
  }, []);

  /**
   * Clear all attachments from state (not from storage)
   */
  const clearState = useCallback(() => {
    setAttachments([]);
    setUploadProgress({});
  }, []);

  const value = {
    // State
    attachments,
    uploadProgress,

    // Actions
    uploadAttachment,
    uploadMultiple,
    getAttachment,
    getAttachmentsByMessage,
    getAttachmentsByConversation,
    deleteAttachment,
    downloadAttachment,
    cleanupOrphaned,
    getStats,
    clearState,

    // Helper methods from service
    isImage: attachmentService.isImage.bind(attachmentService),
    isPDF: attachmentService.isPDF.bind(attachmentService),
    isText: attachmentService.isText.bind(attachmentService),
    getFileIcon: attachmentService.getFileIcon.bind(attachmentService),
    getFormattedSize: attachmentService.getFormattedSize.bind(attachmentService),
  };

  return (
    <AttachmentContext.Provider value={value}>
      {children}
    </AttachmentContext.Provider>
  );
}

export default AttachmentContext;
