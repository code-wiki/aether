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
      const formattedMessages = this.formatMessages(messages);

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
      const formattedMessages = this.formatMessages(messages);

      const stream = await this.client.chat.completions.create({
        model: modelName,
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
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
