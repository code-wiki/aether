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
    // Always get a fresh access token before sending
    await this.getAccessToken();

    try {
      const modelName = options.model || 'claude-sonnet-4-5@20250929';
      const location = this.validateAndGetLocation();
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/publishers/anthropic/models/${modelName}:rawPredict`;

      // Extract system messages and regular messages
      const systemMessages = messages.filter(m => m.role === 'system');
      const regularMessages = messages.filter(m => m.role !== 'system');

      // Check if messages contain attachments
      const hasAttachments = regularMessages.some(m => m.attachments && m.attachments.length > 0);
      const formattedMessages = hasAttachments
        ? this.formatMessagesWithAttachments(regularMessages)
        : this.formatMessages(regularMessages);

      // Prepare request body
      const requestBody = {
        anthropic_version: 'vertex-2023-10-16',
        messages: formattedMessages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      };

      // Add system prompt if present
      if (systemMessages.length > 0) {
        requestBody.system = systemMessages.map(m => m.content).join('\n\n');
      }

      // Add tools if present
      if (options.tools && options.tools.length > 0) {
        requestBody.tools = this.formatTools(options.tools);
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
    // Always get a fresh access token before streaming
    await this.getAccessToken();

    try {
      const modelName = options.model || 'claude-sonnet-4-5@20250929';
      const location = this.validateAndGetLocation();
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/publishers/anthropic/models/${modelName}:streamRawPredict`;

      // Extract system messages and regular messages
      const systemMessages = messages.filter(m => m.role === 'system');
      const regularMessages = messages.filter(m => m.role !== 'system');

      // Check if messages contain attachments
      const hasAttachments = regularMessages.some(m => m.attachments && m.attachments.length > 0);
      const formattedMessages = hasAttachments
        ? this.formatMessagesWithAttachments(regularMessages)
        : this.formatMessages(regularMessages);

      // Prepare request body
      const requestBody = {
        anthropic_version: 'vertex-2023-10-16',
        messages: formattedMessages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        stream: true,
      };

      // Add system prompt if present
      if (systemMessages.length > 0) {
        requestBody.system = systemMessages.map(m => m.content).join('\n\n');
      }

      // Add tools if present
      if (options.tools && options.tools.length > 0) {
        requestBody.tools = this.formatTools(options.tools);
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
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const toolCalls = [];

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

            // Handle text content
            if (data.type === 'content_block_delta') {
              // Check if it's text content (not tool input)
              if (data.delta?.text !== undefined) {
                const text = data.delta.text;
                if (typeof text === 'string') {
                  onChunk(text);
                } else if (text !== null && text !== '') {
                  // If text is not a string, convert it properly
                  console.warn('[ClaudeProvider] Non-string text content:', typeof text, text);
                  onChunk(JSON.stringify(text));
                }
              }
              // Skip tool input deltas (input_json_delta type) - don't send to onChunk
              else if (data.delta?.type === 'input_json_delta') {
                // Handle tool input streaming below
              }
              else if (data.delta && Object.keys(data.delta).length > 0) {
                // Log any other delta types we're not handling
                console.warn('[ClaudeProvider] Unhandled delta type:', data.delta);
              }
            }

            // Handle tool use
            if (data.type === 'content_block_start' && data.content_block?.type === 'tool_use') {
              toolCalls.push({
                id: data.content_block.id,
                name: data.content_block.name,
                input: {},
              });
            }

            // Handle tool input streaming
            if (data.type === 'content_block_delta' && data.delta?.type === 'input_json_delta') {
              if (toolCalls.length > 0) {
                const currentTool = toolCalls[toolCalls.length - 1];
                const partialJson = data.delta.partial_json || '';
                // Accumulate the JSON input
                if (!currentTool.inputJson) {
                  currentTool.inputJson = '';
                }
                currentTool.inputJson += partialJson;
              }
            }
          } catch (e) {
            // Skip malformed JSON
            continue;
          }
        }
      }

      // Parse tool inputs and return them via callback if present
      if (toolCalls.length > 0 && options.onToolUse) {
        for (const toolCall of toolCalls) {
          if (toolCall.inputJson) {
            try {
              toolCall.input = JSON.parse(toolCall.inputJson);
            } catch (e) {
              console.error('[ClaudeProvider] Failed to parse tool input:', e);
            }
          }
        }
        options.onToolUse(toolCalls);
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

  /**
   * Format messages with attachments for Claude's multimodal API
   * @param {Array} messages - Messages with attachments
   * @returns {Array} - Claude Messages API format
   */
  formatMessagesWithAttachments(messages) {
    return messages.map(msg => {
      // Claude uses content blocks for multimodal messages
      const contentBlocks = [];

      // Add text content first
      if (msg.content) {
        contentBlocks.push({
          type: 'text',
          text: msg.content,
        });
      }

      // Add attachments as additional content blocks
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          if (att.type.startsWith('image/')) {
            // Extract base64 data (remove data URL prefix)
            const base64Data = att.data.includes(',')
              ? att.data.split(',')[1]
              : att.data;

            // Determine media type (Claude supports specific formats)
            let mediaType = att.type;
            if (att.type === 'image/jpg') {
              mediaType = 'image/jpeg'; // Normalize jpg to jpeg
            }

            contentBlocks.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            });
          } else if (att.type.startsWith('text/') || att.type === 'application/json') {
            // For text files, decode and add as text content
            try {
              const base64Data = att.data.includes(',')
                ? att.data.split(',')[1]
                : att.data;
              const textContent = atob(base64Data);
              contentBlocks.push({
                type: 'text',
                text: `\n[File: ${att.name}]\n${textContent}\n[End of ${att.name}]\n`,
              });
            } catch (e) {
              console.warn('[ClaudeProvider] Failed to decode text file:', att.name);
            }
          }
          // Note: Claude doesn't support PDFs directly via API
        });
      }

      return {
        role: msg.role,
        content: contentBlocks,
      };
    });
  }

  /**
   * Check if Claude supports multimodal
   * @returns {boolean}
   */
  supportsMultimodal() {
    return true;
  }

  /**
   * Get supported attachment types for Claude
   * @returns {Array<string>}
   */
  getSupportedAttachmentTypes() {
    return [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
    ];
  }

  /**
   * Get maximum attachment size for Claude (5MB per image)
   * @returns {number}
   */
  getMaxAttachmentSize() {
    return 5 * 1024 * 1024; // 5MB
  }

  /**
   * Format tools for Claude API
   * Converts from our tool format to Claude's tool use schema
   * @param {Array} tools - Array of tool objects
   * @returns {Array} Claude-formatted tools
   */
  formatTools(tools) {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: this.formatToolParameters(tool.parameters),
        required: Object.keys(tool.parameters || {}).filter(
          key => tool.parameters[key].required
        ),
      },
    }));
  }

  /**
   * Format tool parameters to JSON schema
   * @param {Object} parameters - Tool parameters
   * @returns {Object} JSON schema properties
   */
  formatToolParameters(parameters) {
    const properties = {};

    for (const [key, param] of Object.entries(parameters || {})) {
      const property = {
        description: param.description || '',
      };

      if (param.type === 'string') {
        property.type = 'string';
        if (param.minLength) property.minLength = param.minLength;
        if (param.maxLength) property.maxLength = param.maxLength;
      } else if (param.type === 'enum') {
        property.type = 'string';
        property.enum = param.values;
      } else if (param.type === 'number') {
        property.type = 'number';
        if (param.minimum !== undefined) property.minimum = param.minimum;
        if (param.maximum !== undefined) property.maximum = param.maximum;
      } else if (param.type === 'boolean') {
        property.type = 'boolean';
      }

      properties[key] = property;
    }

    return properties;
  }
}

export default ClaudeProvider;
