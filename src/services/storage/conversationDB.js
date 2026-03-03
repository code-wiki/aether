import { openDB } from 'idb';

/**
 * ConversationDB - IndexedDB wrapper for storing conversations locally
 */
class ConversationDB {
  constructor() {
    this.db = null;
    this.dbName = 'AetherDB';
    this.version = 1;
  }

  /**
   * Initialize the database
   */
  async init() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Create conversations store
          if (!db.objectStoreNames.contains('conversations')) {
            const conversationStore = db.createObjectStore('conversations', {
              keyPath: 'id',
            });
            conversationStore.createIndex('by-date', 'updatedAt');
            conversationStore.createIndex('by-created', 'createdAt');
            conversationStore.createIndex('by-provider', 'provider');
          }

          // Create settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', {
              keyPath: 'key',
            });
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
}

// Create singleton instance
const conversationDB = new ConversationDB();

export default conversationDB;
