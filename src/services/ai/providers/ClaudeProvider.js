import BaseProvider from './BaseProvider.js';

/**
 * ClaudeProvider - Anthropic Claude via Vertex AI
 * Uses Google Auth Library for GCP authentication and REST API for Claude
 */
class ClaudeProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = 'claude';
    this.auth = null;
    this.accessToken = null;
  }

  async initialize() {
    try {
      if (!this.config.projectId) {
        throw new Error('GCP Project ID is required for Claude via Vertex AI.\n\nPlease set up Google Cloud credentials:\n1. Run: gcloud auth application-default login\n2. Run: gcloud auth application-default set-quota-project YOUR_PROJECT_ID\n3. Open Settings (⌘,) → Google Cloud tab to verify\n\nOr open Settings to see detailed setup instructions.');
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
      console.log('ClaudeProvider initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize ClaudeProvider:', error);
      throw error;
    }
  }

  async getAccessToken() {
    // Get fresh token from main process (handles caching and refresh automatically)
    const tokenResult = await window.electron.gcp.getAccessToken([
      'https://www.googleapis.com/auth/cloud-platform'
    ]);

    if (!tokenResult.success) {
      throw new Error(`Failed to get GCP access token: ${tokenResult.error}`);
    }

    this.accessToken = tokenResult.token;
    return this.accessToken;
  }

  validateAndGetLocation() {
    // Claude models on Vertex AI are only available in specific regions
    const supportedRegions = ['us-east5', 'europe-west1', 'asia-southeast1'];
    const configuredLocation = this.config.location || 'us-east5';

    if (!supportedRegions.includes(configuredLocation)) {
      console.warn(`Location "${configuredLocation}" may not support Claude models. Supported regions: ${supportedRegions.join(', ')}. Falling back to us-east5.`);
      return 'us-east5';
    }

    return configuredLocation;
  }

  async sendMessage(messages, options = {}) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      const modelName = options.model || 'claude-sonnet-4-5@20250929';
      const location = this.validateAndGetLocation();
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/publishers/anthropic/models/${modelName}:rawPredict`;

      const formattedMessages = this.formatMessages(messages);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anthropic_version: 'vertex-2023-10-16',
          messages: formattedMessages,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('ClaudeProvider sendMessage error:', error);
      throw error;
    }
  }

  async streamMessage(messages, options = {}, onChunk) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      const modelName = options.model || 'claude-sonnet-4-5@20250929';
      const location = this.validateAndGetLocation();
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/publishers/anthropic/models/${modelName}:streamRawPredict`;

      const formattedMessages = this.formatMessages(messages);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anthropic_version: 'vertex-2023-10-16',
          messages: formattedMessages,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
          try {
            const jsonStr = line.replace(/^data:\s*/, '');
            if (!jsonStr) continue;

            const data = JSON.parse(jsonStr);

            if (data.type === 'content_block_delta') {
              const text = data.delta?.text || '';
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
      console.error('ClaudeProvider streamMessage error:', error);
      throw error;
    }
  }

  async validateCredentials() {
    try {
      await this.initialize();
      // Try a simple request to validate
      await this.sendMessage([{ role: 'user', content: 'Hello' }], { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('ClaudeProvider credential validation failed:', error);
      return false;
    }
  }

  formatMessages(messages) {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }
}

export default ClaudeProvider;
