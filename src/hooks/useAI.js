import { useState, useCallback, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useConversation } from '../context/ConversationContext';
import { useAgent } from '../context/AgentContext';
import aiService from '../services/ai/AIService';
import { validateAndMigrateModel } from '../services/ai/modelValidation';
import ResponseParser from '../services/agents/ResponseParser';
import ImageGenerationProvider from '../services/providers/generation/ImageGenerationProvider';
import ChartGenerationProvider from '../services/providers/generation/ChartGenerationProvider';

/**
 * useAI - Hook for interacting with AI providers
 */
export function useAI() {
  const { settings, availableModels } = useSettings();
  const { messages, addMessage, updateLastMessage, setIsStreaming, setToolExecutionStatus } = useConversation();
  const { getTools, workflowEngine } = useAgent();
  const [error, setError] = useState(null);

  // Initialize response parser with handlers
  const responseParser = useMemo(() => {
    const parser = new ResponseParser();

    // Initialize generation providers
    const imageGenProvider = new ImageGenerationProvider({
      apiKey: settings.apiKeys?.openai,
    });

    const chartGenProvider = new ChartGenerationProvider();

    // Register handlers
    parser.registerHandler('image-generation', async (config) => {
      return await imageGenProvider.generate(config);
    });

    parser.registerHandler('chart-generation', async (config) => {
      return await chartGenProvider.generate(config);
    });

    return parser;
  }, [settings.apiKeys?.openai]);

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
   * @param {string} userMessage - The text message from the user
   * @param {string} providerName - AI provider name
   * @param {string} modelName - Model to use
   * @param {Array} attachments - Optional array of attachment objects with base64 data
   */
  const sendMessage = useCallback(async (userMessage, providerName, modelName, attachments = []) => {
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

      // Add user message with attachments
      const userMsg = addMessage({
        role: 'user',
        content: userMessage,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Get available tools and prepare system instructions
      const availableTools = getTools();
      const systemInstructions = availableTools.length > 0 ? {
        role: 'system',
        content: `You have access to the following content generation tools:

${availableTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

When a user asks you to create, generate, or make images/charts, you can use these tools by including this syntax in your response:

[[generate:tool-name param1="value1" param2="value2"]]

Examples:
- To generate an image: [[generate:image-generation prompt="a sunset over mountains"]]
- To generate a chart: [[generate:chart-generation type="bar" labels="['A','B','C']" values="[10,20,15]"]]

The system will automatically detect this syntax and generate the requested content.`,
      } : null;

      // Prepare message history for AI
      const messageHistory = [
        ...(systemInstructions ? [systemInstructions] : []),
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        })),
        {
          role: userMsg.role,
          content: userMsg.content,
          attachments: userMsg.attachments,
        }
      ];

      // Create empty assistant message for streaming
      const assistantMsg = addMessage({
        role: 'assistant',
        content: '',
      });

      // Track the full response text for artifact parsing
      let fullResponse = '';
      let toolUseRequests = [];

      // Stream the response with validated model
      await aiService.streamMessage(
        messageHistory,
        {
          model: validatedModel,
          tools: availableTools,
          onToolUse: (toolCalls) => {
            console.log('[useAI] Tool use requested:', toolCalls);
            toolUseRequests = toolCalls;
          },
        },
        (chunk) => {
          // Ensure chunk is always a string
          if (typeof chunk !== 'string') {
            console.error('[useAI] Non-string chunk received:', typeof chunk, chunk);
            chunk = typeof chunk === 'object' ? JSON.stringify(chunk) : String(chunk);
          }
          fullResponse += chunk;
          updateLastMessage(chunk);
        }
      );

      // After streaming completes, handle tool use and parse for artifacts
      try {
        const allAttachments = [];

        // Handle native tool use (Claude API tools)
        if (toolUseRequests.length > 0) {
          console.log('[useAI] Processing tool use requests:', toolUseRequests);

          for (const toolCall of toolUseRequests) {
            try {
              // Find the tool handler
              const tool = availableTools.find(t => t.name === toolCall.name);
              if (!tool) {
                console.warn(`[useAI] Unknown tool: ${toolCall.name}`);
                continue;
              }

              // Set tool execution status
              setToolExecutionStatus({
                tool: toolCall.name,
                status: 'running',
              });

              // Execute the tool
              console.log(`[useAI] Executing tool: ${toolCall.name}`, toolCall.input);

              // Get the tool executor from workflow engine
              const executor = workflowEngine.getTool(toolCall.name);

              if (executor && executor.execute) {
                const result = await executor.execute(toolCall.input);
                if (result) {
                  allAttachments.push(result);
                }
              } else {
                console.warn(`[useAI] Tool executor not found: ${toolCall.name}`);
              }
            } catch (toolError) {
              console.error(`[useAI] Error executing tool ${toolCall.name}:`, toolError);
            } finally {
              // Clear tool execution status
              setToolExecutionStatus(null);
            }
          }
        }

        // Also parse for text-based artifact syntax (backward compatibility)
        const artifacts = responseParser.parseArtifacts(fullResponse);

        if (artifacts.length > 0) {
          console.log('[useAI] Found artifact requests:', artifacts);

          for (const artifact of artifacts) {
            // Set tool execution status for each artifact
            setToolExecutionStatus({
              tool: artifact.type,
              status: 'running',
            });

            try {
              // Generate artifacts (processArtifacts handles one at a time)
              const generatedAttachments = await responseParser.processArtifacts(
                [artifact],
                assistantMsg
              );

              if (generatedAttachments.length > 0) {
                allAttachments.push(...generatedAttachments);
              }
            } finally {
              setToolExecutionStatus(null);
            }
          }
        }

        // Update the message with all generated attachments
        if (allAttachments.length > 0) {
          updateLastMessage('', allAttachments);
          console.log('[useAI] Generated attachments:', allAttachments);
        }
      } catch (artifactError) {
        console.error('[useAI] Error generating artifacts:', artifactError);
        // Don't fail the whole message if artifact generation fails
      } finally {
        // Ensure status is cleared
        setToolExecutionStatus(null);
      }

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
