import BaseProvider from './BaseProvider.js';
import { isAuthError, handleAuthError } from '../../gcp/authErrorHandler.js';

/**
 * GeminiProvider - Google Gemini via Vertex AI REST API
 * Uses REST API instead of SDK to avoid Node.js dependencies in browser
 */
class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = 'gemini';
    this.accessToken = null;
  }

  async initialize() {
    try {
      if (!this.config.projectId) {
        throw new Error('GCP Project ID is required for Gemini.');
      }

      // Get access token from main process (Node.js context via IPC)
      if (!window.electron?.gcp) {
        throw new Error('GCP authentication not available. Please restart the app.');
      }

      const tokenResult = await window.electron.gcp.getAccessToken([
        'https://www.googleapis.com/auth/cloud-platform'
      ]);

      if (!tokenResult.success) {
        throw new Error(`Failed to get GCP access token: ${tokenResult.error}`);
      }

      this.accessToken = tokenResult.token;
      console.log('GeminiProvider initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize GeminiProvider:', error);
      throw error;
    }
  }

  async getAccessToken() {
    // Get fresh token from main process
    const tokenResult = await window.electron.gcp.getAccessToken([
      'https://www.googleapis.com/auth/cloud-platform'
    ]);

    if (!tokenResult.success) {
      throw new Error(`Failed to get GCP access token: ${tokenResult.error}`);
    }

    this.accessToken = tokenResult.token;
    return this.accessToken;
  }

  async sendMessage(messages, options = {}) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      const modelName = options.model || 'gemini-1.5-flash';
      const location = this.config.location || 'us-central1';
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;

      // Extract system messages and regular messages
      const systemMessages = messages.filter(m => m.role === 'system');
      const regularMessages = messages.filter(m => m.role !== 'system');

      // Check if messages contain attachments
      const hasAttachments = regularMessages.some(m => m.attachments && m.attachments.length > 0);
      const formattedMessages = hasAttachments
        ? this.formatMessagesWithAttachments(regularMessages)
        : this.formatMessagesForAPI(regularMessages);

      // Prepare request body
      const requestBody = {
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 8192,
        },
      };

      // Add system instruction if present
      if (systemMessages.length > 0) {
        requestBody.systemInstruction = {
          parts: [{
            text: systemMessages.map(m => m.content).join('\n\n')
          }]
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Gemini API error: ${response.status} - ${errorText}`);
        error.status = response.status;

        // Check if this is an auth error
        if (isAuthError(error)) {
          handleAuthError(error);
        }

        throw error;
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('GeminiProvider sendMessage error:', error);

      // Check if this is an auth error
      if (isAuthError(error)) {
        handleAuthError(error);
      }

      throw error;
    }
  }

  async streamMessage(messages, options = {}, onChunk) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      const modelName = options.model || 'gemini-1.5-flash';
      const location = this.config.location || 'us-central1';
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/publishers/google/models/${modelName}:streamGenerateContent`;

      // Extract system messages and regular messages
      const systemMessages = messages.filter(m => m.role === 'system');
      const regularMessages = messages.filter(m => m.role !== 'system');

      // Check if messages contain attachments
      const hasAttachments = regularMessages.some(m => m.attachments && m.attachments.length > 0);
      const formattedMessages = hasAttachments
        ? this.formatMessagesWithAttachments(regularMessages)
        : this.formatMessagesForAPI(regularMessages);

      // Prepare request body
      const requestBody = {
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 8192,
        },
      };

      // Add system instruction if present
      if (systemMessages.length > 0) {
        requestBody.systemInstruction = {
          parts: [{
            text: systemMessages.map(m => m.content).join('\n\n')
          }]
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Gemini API error: ${response.status} - ${errorText}`);
        error.status = response.status;

        // Check if this is an auth error
        if (isAuthError(error)) {
          handleAuthError(error);
        }

        throw error;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:') || line.trim().startsWith('{'));

        for (const line of lines) {
          try {
            const jsonStr = line.replace(/^data:\s*/, '').trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            const data = JSON.parse(jsonStr);

            if (data.candidates && data.candidates[0]?.content?.parts) {
              const text = data.candidates[0].content.parts[0]?.text || '';
              if (text && typeof text === 'string') {
                onChunk(text);
              } else if (text && typeof text !== 'string') {
                // If text is not a string, convert it properly
                console.warn('[GeminiProvider] Non-string content received:', text);
                onChunk(JSON.stringify(text, null, 2));
              }
            }
          } catch (e) {
            // Skip malformed JSON
            continue;
          }
        }
      }
    } catch (error) {
      console.error('GeminiProvider streamMessage error:', error);

      // Check if this is an auth error
      if (isAuthError(error)) {
        handleAuthError(error);
      }

      throw error;
    }
  }

  async validateCredentials() {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('GeminiProvider credential validation failed:', error);
      return false;
    }
  }

  formatMessagesForAPI(messages) {
    // Convert to Gemini API format
    return messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  }

  formatMessages(messages) {
    return this.formatMessagesForAPI(messages);
  }

  /**
   * Format messages with attachments for multimodal Gemini API
   * @param {Array} messages - Messages with attachments
   * @returns {Array} - Gemini multimodal format
   */
  formatMessagesWithAttachments(messages) {
    return messages.map(msg => {
      const parts = [{ text: msg.content }];

      // Add attachments if present
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          if (att.type.startsWith('image/')) {
            // Extract base64 data (remove data URL prefix like "data:image/png;base64,")
            const base64Data = att.data.includes(',')
              ? att.data.split(',')[1]
              : att.data;

            parts.push({
              inlineData: {
                mimeType: att.type,
                data: base64Data,
              },
            });
          } else if (att.type === 'application/pdf') {
            // Gemini can process PDFs
            const base64Data = att.data.includes(',')
              ? att.data.split(',')[1]
              : att.data;

            parts.push({
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data,
              },
            });
          } else if (att.type.startsWith('text/') || att.type === 'application/json') {
            // For text files, decode and include as text
            try {
              const base64Data = att.data.includes(',')
                ? att.data.split(',')[1]
                : att.data;
              const textContent = atob(base64Data);
              parts.push({
                text: `\n[File: ${att.name}]\n${textContent}\n[End of ${att.name}]\n`,
              });
            } catch (e) {
              console.warn('[GeminiProvider] Failed to decode text file:', att.name);
            }
          }
        });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });
  }

  /**
   * Check if Gemini supports multimodal
   * @returns {boolean}
   */
  supportsMultimodal() {
    return true;
  }

  /**
   * Get supported attachment types for Gemini
   * @returns {Array<string>}
   */
  getSupportedAttachmentTypes() {
    return [
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
  }

  /**
   * Get maximum attachment size for Gemini (20MB)
   * @returns {number}
   */
  getMaxAttachmentSize() {
    return 20 * 1024 * 1024; // 20MB
  }
}

export default GeminiProvider;
