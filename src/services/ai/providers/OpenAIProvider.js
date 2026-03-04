import BaseProvider from './BaseProvider.js';

/**
 * OpenAIProvider - OpenAI GPT models via direct API
 * Uses openai npm package
 */
class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = 'openai';
    this.client = null;
  }

  async initialize() {
    try {
      // Dynamic import for OpenAI SDK
      const OpenAI = (await import('openai')).default;

      if (!this.config.apiKey) {
        throw new Error('OpenAI API key is required');
      }

      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        dangerouslyAllowBrowser: true, // Since we're in Electron
      });

      console.log('OpenAIProvider initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAIProvider:', error);
      throw error;
    }
  }

  async sendMessage(messages, options = {}) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const modelName = options.model || 'gpt-4o-mini';

      // Check if messages contain attachments
      const hasAttachments = messages.some(m => m.attachments && m.attachments.length > 0);
      const formattedMessages = hasAttachments
        ? this.formatMessagesWithAttachments(messages)
        : this.formatMessages(messages);

      const response = await this.client.chat.completions.create({
        model: modelName,
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAIProvider sendMessage error:', error);
      throw error;
    }
  }

  async streamMessage(messages, options = {}, onChunk) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const modelName = options.model || 'gpt-4o-mini';

      // Check if messages contain attachments
      const hasAttachments = messages.some(m => m.attachments && m.attachments.length > 0);
      const formattedMessages = hasAttachments
        ? this.formatMessagesWithAttachments(messages)
        : this.formatMessages(messages);

      const stream = await this.client.chat.completions.create({
        model: modelName,
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content && typeof content === 'string') {
          onChunk(content);
        } else if (content && typeof content !== 'string') {
          // If content is not a string, convert it properly
          console.warn('[OpenAIProvider] Non-string content received:', content);
          onChunk(JSON.stringify(content, null, 2));
        }
      }
    } catch (error) {
      console.error('OpenAIProvider streamMessage error:', error);
      throw error;
    }
  }

  async validateCredentials() {
    try {
      await this.initialize();
      // Try a simple request to validate
      await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      console.error('OpenAIProvider credential validation failed:', error);
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
   * Format messages with attachments for OpenAI's vision API
   * @param {Array} messages - Messages with attachments
   * @returns {Array} - OpenAI chat completion format with content array
   */
  formatMessagesWithAttachments(messages) {
    return messages.map(msg => {
      // OpenAI uses content array for multimodal messages
      const contentParts = [];

      // Add text content first
      if (msg.content) {
        contentParts.push({
          type: 'text',
          text: msg.content,
        });
      }

      // Add attachments as image_url or text content
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          if (att.type.startsWith('image/')) {
            // OpenAI accepts data URLs directly
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: att.data, // Full data URL with prefix
                detail: 'auto', // Can be 'low', 'high', or 'auto'
              },
            });
          } else if (att.type.startsWith('text/') || att.type === 'application/json') {
            // For text files, decode and add as text content
            try {
              const base64Data = att.data.includes(',')
                ? att.data.split(',')[1]
                : att.data;
              const textContent = atob(base64Data);
              contentParts.push({
                type: 'text',
                text: `\n[File: ${att.name}]\n${textContent}\n[End of ${att.name}]\n`,
              });
            } catch (e) {
              console.warn('[OpenAIProvider] Failed to decode text file:', att.name);
            }
          }
          // Note: OpenAI doesn't support PDFs directly
        });
      }

      return {
        role: msg.role,
        content: contentParts,
      };
    });
  }

  /**
   * Check if OpenAI supports multimodal
   * @returns {boolean}
   */
  supportsMultimodal() {
    return true;
  }

  /**
   * Get supported attachment types for OpenAI
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
   * Get maximum attachment size for OpenAI (20MB per image)
   * @returns {number}
   */
  getMaxAttachmentSize() {
    return 20 * 1024 * 1024; // 20MB
  }

  getAvailableModels() {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal model' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous generation flagship' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and economical' },
    ];
  }
}

export default OpenAIProvider;
