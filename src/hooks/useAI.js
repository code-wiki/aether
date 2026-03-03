import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useConversation } from '../context/ConversationContext';
import aiService from '../services/ai/AIService';
import { validateAndMigrateModel } from '../services/ai/modelValidation';

/**
 * useAI - Hook for interacting with AI providers
 */
export function useAI() {
  const { settings, availableModels } = useSettings();
  const { messages, addMessage, updateLastMessage, setIsStreaming } = useConversation();
  const [error, setError] = useState(null);

  /**
   * Get provider configuration based on current settings
   */
  const getProviderConfig = useCallback((providerName) => {
    switch (providerName) {
      case 'gemini':
      case 'claude':
        return {
          projectId: settings.gcp.projectId,
          location: settings.gcp.location,
        };
      case 'openai':
        return {
          apiKey: settings.apiKeys.openai,
        };
      default:
        return {};
    }
  }, [settings]);

  /**
   * Initialize a provider
   */
  const initializeProvider = useCallback(async (providerName) => {
    try {
      const config = getProviderConfig(providerName);
      await aiService.initializeProvider(providerName, config);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [getProviderConfig]);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(async (userMessage, providerName, modelName) => {
    setError(null);
    setIsStreaming(true);

    try {
      // Validate and migrate model ID to ensure it's available
      const availableProviderModels = availableModels[providerName] || [];
      const validatedModel = validateAndMigrateModel(
        modelName,
        providerName,
        availableProviderModels
      );

      // Log if model was changed
      if (validatedModel !== modelName) {
        console.log(`[useAI] Model migrated: ${modelName} → ${validatedModel}`);
      }

      // Initialize provider if needed
      const config = getProviderConfig(providerName);
      await aiService.initializeProvider(providerName, config);

      // Add user message
      const userMsg = addMessage({
        role: 'user',
        content: userMessage,
      });

      // Prepare message history for AI
      const messageHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Create empty assistant message for streaming
      const assistantMsg = addMessage({
        role: 'assistant',
        content: '',
      });

      // Stream the response with validated model
      await aiService.streamMessage(
        messageHistory,
        { model: validatedModel },
        (chunk) => {
          updateLastMessage(chunk);
        }
      );

      setIsStreaming(false);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      setIsStreaming(false);
      return false;
    }
  }, [settings, messages, addMessage, updateLastMessage, setIsStreaming, getProviderConfig, availableModels]);

  /**
   * Get available models for a provider
   * Uses dynamic models from SettingsContext (fetched from Vertex AI API)
   */
  const getModels = useCallback((providerName) => {
    // Use dynamic models from SettingsContext
    const models = availableModels[providerName] || [];

    // Filter Claude models if region doesn't support them
    if (providerName === 'claude') {
      const supportedRegions = ['us-east5', 'europe-west1', 'asia-southeast1'];
      if (!supportedRegions.includes(settings.gcp.location)) {
        return []; // No Claude models in this region
      }
    }

    return models;
  }, [availableModels, settings.gcp.location]);

  return {
    sendMessage,
    initializeProvider,
    getModels,
    error,
  };
}
