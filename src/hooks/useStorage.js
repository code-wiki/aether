import { useState, useEffect, useCallback } from 'react';
import conversationDB from '../services/storage/conversationDB';

/**
 * useStorage - Hook for managing conversation persistence
 */
export function useStorage() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize database on mount
    conversationDB.init().then(() => {
      setIsInitialized(true);
    }).catch(error => {
      console.error('Failed to initialize storage:', error);
    });
  }, []);

  const saveConversation = useCallback(async (conversation) => {
    if (!isInitialized) return false;
    return await conversationDB.saveConversation(conversation);
  }, [isInitialized]);

  const loadConversations = useCallback(async () => {
    if (!isInitialized) return [];
    return await conversationDB.getAllConversations();
  }, [isInitialized]);

  const deleteConversation = useCallback(async (id) => {
    if (!isInitialized) return false;
    return await conversationDB.deleteConversation(id);
  }, [isInitialized]);

  const searchConversations = useCallback(async (query) => {
    if (!isInitialized) return [];
    return await conversationDB.searchConversations(query);
  }, [isInitialized]);

  const getStats = useCallback(async () => {
    if (!isInitialized) return null;
    return await conversationDB.getStats();
  }, [isInitialized]);

  return {
    isInitialized,
    saveConversation,
    loadConversations,
    deleteConversation,
    searchConversations,
    getStats,
  };
}
