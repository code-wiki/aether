/**
 * BaseProvider - Abstract base class for all AI providers
 * Defines the interface that all providers must implement
 */
class BaseProvider {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * Initialize the provider with credentials
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Send a message and get a complete response
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<string>} - The complete response
   */
  async sendMessage(messages, options = {}) {
    throw new Error('sendMessage() must be implemented by subclass');
  }

  /**
   * Stream a message response chunk by chunk
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<void>}
   */
  async streamMessage(messages, options = {}, onChunk) {
    throw new Error('streamMessage() must be implemented by subclass');
  }

  /**
   * Validate credentials/configuration
   * @returns {Promise<boolean>}
   */
  async validateCredentials() {
    throw new Error('validateCredentials() must be implemented by subclass');
  }

  /**
   * Format messages to provider-specific format
   * @param {Array} messages - Standard message format
   * @returns {Array} - Provider-specific format
   */
  formatMessages(messages) {
    return messages;
  }

  /**
   * Estimate tokens for a given text (rough estimate)
   * @param {string} text
   * @returns {number}
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get available models for this provider
   * @returns {Array<Object>}
   */
  getAvailableModels() {
    return [];
  }
}

export default BaseProvider;
