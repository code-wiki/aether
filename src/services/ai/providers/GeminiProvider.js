import BaseProvider from './BaseProvider.js';

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

      const formattedMessages = this.formatMessagesForAPI(messages);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 8192,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('GeminiProvider sendMessage error:', error);
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

      const formattedMessages = this.formatMessagesForAPI(messages);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 8192,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
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
              if (text) {
                onChunk(text);
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
}

export default GeminiProvider;
