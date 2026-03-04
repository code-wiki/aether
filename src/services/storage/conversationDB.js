import { openDB } from 'idb';

/**
 * ConversationDB - IndexedDB wrapper for storing conversations locally
 */
class ConversationDB {
  constructor() {
    this.db = null;
    this.dbName = 'AetherDB';
    this.version = 2;
  }

  /**
   * Initialize the database
   */
  async init() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Create conversations store (v1)
          if (!db.objectStoreNames.contains('conversations')) {
            const conversationStore = db.createObjectStore('conversations', {
              keyPath: 'id',
            });
            conversationStore.createIndex('by-date', 'updatedAt');
            conversationStore.createIndex('by-created', 'createdAt');
            conversationStore.createIndex('by-provider', 'provider');
          }

          // Create settings store (v1)
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', {
              keyPath: 'key',
            });
          }

          // Upgrade to v2: Add attachments and workflow_executions stores
          if (oldVersion < 2) {
            // Create attachments store
            if (!db.objectStoreNames.contains('attachments')) {
              const attachmentStore = db.createObjectStore('attachments', {
                keyPath: 'id',
              });
              attachmentStore.createIndex('by-message', 'messageId', { unique: false });
              attachmentStore.createIndex('by-conversation', 'conversationId', { unique: false });
              attachmentStore.createIndex('by-source', 'source', { unique: false });
              attachmentStore.createIndex('by-date', 'createdAt', { unique: false });
            }

            // Create workflow executions store
            if (!db.objectStoreNames.contains('workflow_executions')) {
              const workflowStore = db.createObjectStore('workflow_executions', {
                keyPath: 'id',
              });
              workflowStore.createIndex('by-workflow', 'workflowId', { unique: false });
              workflowStore.createIndex('by-conversation', 'conversationId', { unique: false });
              workflowStore.createIndex('by-status', 'status', { unique: false });
              workflowStore.createIndex('by-date', 'startedAt', { unique: false });
            }

            console.log('Database upgraded to v2: Added attachments and workflow_executions stores');
          }
        },
      });

      console.log('ConversationDB initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize ConversationDB:', error);
      throw error;
    }
  }

  /**
   * Save a conversation to the database
   */
  async saveConversation(conversation) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction('conversations', 'readwrite');
      await tx.objectStore('conversations').put({
        ...conversation,
        updatedAt: Date.now(),
      });
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw error;
    }
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(id) {
    if (!this.db) await this.init();

    try {
      return await this.db.get('conversations', id);
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  /**
   * Get all conversations, sorted by most recent
   */
  async getAllConversations() {
    if (!this.db) await this.init();

    try {
      const conversations = await this.db.getAllFromIndex(
        'conversations',
        'by-date'
      );
      // Sort by most recent first
      return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to get all conversations:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id) {
    if (!this.db) await this.init();

    try {
      await this.db.delete('conversations', id);
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Search conversations by query
   * Searches in title and message content
   */
  async searchConversations(query) {
    if (!this.db) await this.init();
    if (!query || query.trim() === '') {
      return await this.getAllConversations();
    }

    try {
      const allConversations = await this.getAllConversations();
      const searchQuery = query.toLowerCase().trim();

      return allConversations.filter(conv => {
        // Search in title
        if (conv.title.toLowerCase().includes(searchQuery)) {
          return true;
        }

        // Search in message content
        if (conv.messages && conv.messages.length > 0) {
          return conv.messages.some(msg =>
            msg.content.toLowerCase().includes(searchQuery)
          );
        }

        return false;
      });
    } catch (error) {
      console.error('Failed to search conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversations by provider
   */
  async getConversationsByProvider(provider) {
    if (!this.db) await this.init();

    try {
      return await this.db.getAllFromIndex(
        'conversations',
        'by-provider',
        provider
      );
    } catch (error) {
      console.error('Failed to get conversations by provider:', error);
      throw error;
    }
  }

  /**
   * Update conversation messages
   */
  async updateConversationMessages(id, messages) {
    if (!this.db) await this.init();

    try {
      const conversation = await this.getConversation(id);
      if (!conversation) {
        throw new Error(`Conversation ${id} not found`);
      }

      conversation.messages = messages;
      conversation.updatedAt = Date.now();

      await this.saveConversation(conversation);
      return true;
    } catch (error) {
      console.error('Failed to update conversation messages:', error);
      throw error;
    }
  }

  /**
   * Clear all conversations (use with caution)
   */
  async clearAllConversations() {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction('conversations', 'readwrite');
      await tx.objectStore('conversations').clear();
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to clear all conversations:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.db) await this.init();

    try {
      const conversations = await this.getAllConversations();
      const totalMessages = conversations.reduce(
        (sum, conv) => sum + (conv.messages?.length || 0),
        0
      );

      const providerCounts = conversations.reduce((acc, conv) => {
        acc[conv.provider] = (acc[conv.provider] || 0) + 1;
        return acc;
      }, {});

      return {
        totalConversations: conversations.length,
        totalMessages,
        providerCounts,
        oldestConversation: conversations[conversations.length - 1]?.createdAt,
        newestConversation: conversations[0]?.createdAt,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  // ===== Attachment Management (v2) =====

  /**
   * Save an attachment to the database
   */
  async saveAttachment(attachment) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction('attachments', 'readwrite');
      await tx.objectStore('attachments').put({
        ...attachment,
        createdAt: attachment.createdAt || Date.now(),
      });
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save attachment:', error);
      throw error;
    }
  }

  /**
   * Get an attachment by ID
   */
  async getAttachment(id) {
    if (!this.db) await this.init();

    try {
      return await this.db.get('attachments', id);
    } catch (error) {
      console.error('Failed to get attachment:', error);
      throw error;
    }
  }

  /**
   * Get attachments by message ID
   */
  async getAttachmentsByMessage(messageId) {
    if (!this.db) await this.init();

    try {
      return await this.db.getAllFromIndex('attachments', 'by-message', messageId);
    } catch (error) {
      console.error('Failed to get attachments by message:', error);
      throw error;
    }
  }

  /**
   * Get attachments by conversation ID
   */
  async getAttachmentsByConversation(conversationId) {
    if (!this.db) await this.init();

    try {
      return await this.db.getAllFromIndex('attachments', 'by-conversation', conversationId);
    } catch (error) {
      console.error('Failed to get attachments by conversation:', error);
      throw error;
    }
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(id) {
    if (!this.db) await this.init();

    try {
      await this.db.delete('attachments', id);
      return true;
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      throw error;
    }
  }

  /**
   * Delete orphaned attachments (attachments not linked to any message)
   */
  async cleanupOrphanedAttachments() {
    if (!this.db) await this.init();

    try {
      const conversations = await this.getAllConversations();
      const allMessageIds = new Set();

      // Collect all valid message IDs
      conversations.forEach(conv => {
        conv.messages?.forEach(msg => {
          allMessageIds.add(msg.id);
        });
      });

      // Get all attachments
      const allAttachments = await this.db.getAll('attachments');

      // Delete attachments with invalid message IDs
      const tx = this.db.transaction('attachments', 'readwrite');
      const store = tx.objectStore('attachments');

      let deletedCount = 0;
      for (const attachment of allAttachments) {
        if (attachment.messageId && !allMessageIds.has(attachment.messageId)) {
          await store.delete(attachment.id);
          deletedCount++;
        }
      }

      await tx.done;
      console.log(`Cleaned up ${deletedCount} orphaned attachments`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup orphaned attachments:', error);
      throw error;
    }
  }

  // ===== Workflow Execution Management (v2) =====

  /**
   * Save a workflow execution to the database
   */
  async saveWorkflowExecution(execution) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction('workflow_executions', 'readwrite');
      await tx.objectStore('workflow_executions').put(execution);
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save workflow execution:', error);
      throw error;
    }
  }

  /**
   * Get a workflow execution by ID
   */
  async getWorkflowExecution(id) {
    if (!this.db) await this.init();

    try {
      return await this.db.get('workflow_executions', id);
    } catch (error) {
      console.error('Failed to get workflow execution:', error);
      throw error;
    }
  }

  /**
   * Get workflow executions by workflow ID
   */
  async getWorkflowExecutionsByWorkflow(workflowId) {
    if (!this.db) await this.init();

    try {
      return await this.db.getAllFromIndex('workflow_executions', 'by-workflow', workflowId);
    } catch (error) {
      console.error('Failed to get workflow executions by workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow executions by conversation ID
   */
  async getWorkflowExecutionsByConversation(conversationId) {
    if (!this.db) await this.init();

    try {
      return await this.db.getAllFromIndex('workflow_executions', 'by-conversation', conversationId);
    } catch (error) {
      console.error('Failed to get workflow executions by conversation:', error);
      throw error;
    }
  }

  /**
   * Get workflow executions by status
   */
  async getWorkflowExecutionsByStatus(status) {
    if (!this.db) await this.init();

    try {
      return await this.db.getAllFromIndex('workflow_executions', 'by-status', status);
    } catch (error) {
      console.error('Failed to get workflow executions by status:', error);
      throw error;
    }
  }

  /**
   * Delete a workflow execution
   */
  async deleteWorkflowExecution(id) {
    if (!this.db) await this.init();

    try {
      await this.db.delete('workflow_executions', id);
      return true;
    } catch (error) {
      console.error('Failed to delete workflow execution:', error);
      throw error;
    }
  }
}

// Create singleton instance
const conversationDB = new ConversationDB();

export default conversationDB;
