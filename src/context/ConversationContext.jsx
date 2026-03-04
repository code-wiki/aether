import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import conversationDB from '../services/storage/conversationDB';
import { migrateClaudeModelId } from '../services/ai/modelValidation';

const ConversationContext = createContext();

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toolExecutionStatus, setToolExecutionStatus] = useState(null); // { tool: 'image-generation', status: 'running' }

  // Load conversations from IndexedDB on mount
  useEffect(() => {
    const loadStoredConversations = async () => {
      try {
        await conversationDB.init();
        const stored = await conversationDB.getAllConversations();

        // Migrate old Claude model IDs to new versions
        const migratedConversations = stored.map(conv => {
          if (conv.provider === 'claude' && conv.model) {
            const migratedModel = migrateClaudeModelId(conv.model);
            if (migratedModel !== conv.model) {
              console.log(`[Conversation] Migrating model for "${conv.title}": ${conv.model} → ${migratedModel}`);
              return { ...conv, model: migratedModel };
            }
          }
          return conv;
        });

        setConversations(migratedConversations);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setIsLoading(false);
      }
    };

    loadStoredConversations();
  }, []);

  // Save conversation to IndexedDB whenever it changes
  const saveConversationToDB = async (conversation) => {
    try {
      await conversationDB.saveConversation(conversation);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const createConversation = async () => {
    const newConversation = {
      id: uuidv4(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: 'claude',
      model: 'claude-sonnet-4-5@20250929',
      messages: [],
      pinned: false,
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages([]);

    // Save to IndexedDB
    await saveConversationToDB(newConversation);

    return newConversation;
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setActiveConversationId(conversationId);
      setMessages(conversation.messages || []);
    }
  };

  const addMessage = (message) => {
    const newMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      ...message,
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const updated = {
          ...conv,
          messages: [...(conv.messages || []), newMessage],
          updatedAt: Date.now(),
          title: conv.messages.length === 0 && message.role === 'user'
            ? message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
            : conv.title,
        };

        // Save to IndexedDB
        saveConversationToDB(updated);

        return updated;
      }
      return conv;
    }));

    return newMessage;
  };

  const updateLastMessage = (content, attachments = null) => {
    // Ensure content is always a string
    let sanitizedContent = '';

    if (typeof content === 'string') {
      sanitizedContent = content;
    } else if (content === null || content === undefined) {
      sanitizedContent = '';
    } else if (typeof content === 'object') {
      try {
        sanitizedContent = JSON.stringify(content, null, 2);
      } catch (err) {
        console.error('[ConversationContext] Failed to stringify object:', err);
        sanitizedContent = '[Object]';
      }
    } else {
      sanitizedContent = String(content);
    }

    // Extra safety: if somehow it's still not a string, force it
    if (typeof sanitizedContent !== 'string') {
      console.error('[ConversationContext] Content is still not a string after sanitization:', typeof sanitizedContent, sanitizedContent);
      sanitizedContent = '';
    }

    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastMessage = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + sanitizedContent,
          ...(attachments && { attachments: [...(lastMessage.attachments || []), ...attachments] }),
        };
      }
      return updated;
    });

    // Also update in conversations array
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId && conv.messages.length > 0) {
        const updatedMessages = [...conv.messages];
        const lastIndex = updatedMessages.length - 1;
        const lastMessage = updatedMessages[lastIndex];
        updatedMessages[lastIndex] = {
          ...lastMessage,
          content: lastMessage.content + sanitizedContent,
          ...(attachments && { attachments: [...(lastMessage.attachments || []), ...attachments] }),
        };
        const updated = {
          ...conv,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };

        // Debounced save to IndexedDB (will be saved when streaming completes)
        return updated;
      }
      return conv;
    }));
  };

  // Save after streaming completes
  useEffect(() => {
    if (!isStreaming && activeConversationId) {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      if (activeConv) {
        saveConversationToDB(activeConv);
      }
    }
  }, [isStreaming, activeConversationId, conversations]);

  const deleteConversation = async (conversationId) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }

    // Delete from IndexedDB
    try {
      await conversationDB.deleteConversation(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation from DB:', error);
    }
  };

  const searchConversations = async (query) => {
    try {
      const results = await conversationDB.searchConversations(query);
      return results;
    } catch (error) {
      console.error('Failed to search conversations:', error);
      return [];
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        setConversations,
        activeConversation,
        activeConversationId,
        messages,
        isStreaming,
        isLoading,
        toolExecutionStatus,
        setIsStreaming,
        setToolExecutionStatus,
        createConversation,
        loadConversation,
        addMessage,
        updateLastMessage,
        deleteConversation,
        searchConversations,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
}
