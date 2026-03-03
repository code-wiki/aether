import GeminiProvider from './providers/GeminiProvider.js';
import ClaudeProvider from './providers/ClaudeProvider.js';
import OpenAIProvider from './providers/OpenAIProvider.js';

/**
 * AIService - Unified service for managing AI providers
 * Factory pattern to instantiate and manage different AI providers
 */
class AIService {
  constructor() {
    this.providers = {
      gemini: null,
      claude: null,
      openai: null,
    };
    this.activeProvider = null;
    this.activeProviderName = null;
  }

  /**
   * Initialize a specific provider
   * @param {string} providerName - 'gemini', 'claude', or 'openai'
   * @param {Object} config - Provider-specific configuration
   */
  async initializeProvider(providerName, config) {
    try {
      switch (providerName) {
        case 'gemini':
          if (!this.providers.gemini) {
            this.providers.gemini = new GeminiProvider(config);
          }
          await this.providers.gemini.initialize();
          this.activeProvider = this.providers.gemini;
          this.activeProviderName = 'gemini';
          break;

        case 'claude':
          if (!this.providers.claude) {
            this.providers.claude = new ClaudeProvider(config);
          }
          await this.providers.claude.initialize();
          this.activeProvider = this.providers.claude;
          this.activeProviderName = 'claude';
          break;

        case 'openai':
          if (!this.providers.openai) {
            this.providers.openai = new OpenAIProvider(config);
          }
          await this.providers.openai.initialize();
          this.activeProvider = this.providers.openai;
          this.activeProviderName = 'openai';
          break;

        default:
          throw new Error(`Unknown provider: ${providerName}`);
      }

      console.log(`AIService: ${providerName} initialized and set as active`);
      return true;
    } catch (error) {
      console.error(`AIService: Failed to initialize ${providerName}:`, error);
      throw error;
    }
  }

  /**
   * Switch to a different provider
   * @param {string} providerName
   */
  async switchProvider(providerName, config) {
    await this.initializeProvider(providerName, config);
  }

  /**
   * Send a message using the active provider
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   */
  async sendMessage(messages, options = {}) {
    if (!this.activeProvider) {
      throw new Error('No AI provider initialized. Call initializeProvider first.');
    }

    try {
      return await this.activeProvider.sendMessage(messages, options);
    } catch (error) {
      console.error('AIService: sendMessage error:', error);
      throw error;
    }
  }

  /**
   * Stream a message using the active provider
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   * @param {Function} onChunk - Callback for each chunk
   */
  async streamMessage(messages, options = {}, onChunk) {
    if (!this.activeProvider) {
      throw new Error('No AI provider initialized. Call initializeProvider first.');
    }

    try {
      await this.activeProvider.streamMessage(messages, options, onChunk);
    } catch (error) {
      console.error('AIService: streamMessage error:', error);
      throw error;
    }
  }

  /**
   * Validate credentials for a provider
   * @param {string} providerName
   */
  async validateProvider(providerName, config) {
    try {
      await this.initializeProvider(providerName, config);
      const provider = this.providers[providerName];
      return await provider.validateCredentials();
    } catch (error) {
      console.error(`AIService: Validation failed for ${providerName}:`, error);
      return false;
    }
  }

  /**
   * Get available models for the active provider
   */
  getAvailableModels() {
    if (!this.activeProvider) {
      return [];
    }
    return this.activeProvider.getAvailableModels();
  }

  /**
   * Get the name of the active provider
   */
  getActiveProviderName() {
    return this.activeProviderName;
  }

  /**
   * Check if a provider is initialized
   */
  isProviderInitialized(providerName) {
    return this.providers[providerName] !== null;
  }
}

// Create a singleton instance
const aiService = new AIService();

export default aiService;
