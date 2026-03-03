// Custom Error Classes
// Structured error handling for better debugging and user feedback

/**
 * Custom error classes provide:
 * - Clear error categorization
 * - Structured error metadata
 * - Integration with error tracking services
 * - Better error messages for users
 *
 * Usage:
 * throw new AIProviderError('gemini', 'Invalid API key', originalError);
 */

/**
 * Base application error
 * All custom errors extend this class
 */
export class AppError extends Error {
  constructor(message, code, metadata = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Convert error to JSON for logging/tracking
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Get user-friendly error message
   * Override in subclasses for specific messages
   */
  getUserMessage() {
    return this.message;
  }
}

/**
 * AI Provider Errors
 * Errors related to AI service providers (Gemini, Claude, OpenAI)
 */
export class AIProviderError extends AppError {
  constructor(provider, message, originalError = null, metadata = {}) {
    super(
      `[${provider}] ${message}`,
      'AI_PROVIDER_ERROR',
      {
        provider,
        originalError: originalError?.message,
        ...metadata,
      }
    );
    this.provider = provider;
    this.originalError = originalError;
  }

  getUserMessage() {
    const providerNames = {
      gemini: 'Google Gemini',
      claude: 'Anthropic Claude',
      openai: 'OpenAI',
    };

    const friendlyProvider = providerNames[this.provider] || this.provider;

    // Common error patterns
    if (this.message.includes('API key')) {
      return `Invalid API key for ${friendlyProvider}. Please check your settings.`;
    }
    if (this.message.includes('quota') || this.message.includes('rate limit')) {
      return `Rate limit exceeded for ${friendlyProvider}. Please try again later.`;
    }
    if (this.message.includes('network') || this.message.includes('timeout')) {
      return `Network error connecting to ${friendlyProvider}. Please check your connection.`;
    }

    return `Error communicating with ${friendlyProvider}. Please try again.`;
  }
}

/**
 * Authentication Errors
 * Errors related to GCP auth, API keys, credentials
 */
export class AuthenticationError extends AppError {
  constructor(service, message, metadata = {}) {
    super(
      `Authentication failed for ${service}: ${message}`,
      'AUTH_ERROR',
      { service, ...metadata }
    );
    this.service = service;
  }

  getUserMessage() {
    if (this.service === 'gcp') {
      return 'GCP authentication failed. Please run "gcloud auth application-default login" and try again.';
    }
    return `Authentication failed for ${this.service}. Please check your credentials.`;
  }
}

/**
 * Storage Errors
 * Errors related to IndexedDB, Electron Store, data persistence
 */
export class StorageError extends AppError {
  constructor(operation, message, originalError = null, metadata = {}) {
    super(
      `Storage ${operation} failed: ${message}`,
      'STORAGE_ERROR',
      {
        operation,
        originalError: originalError?.message,
        ...metadata,
      }
    );
    this.operation = operation;
    this.originalError = originalError;
  }

  getUserMessage() {
    const operationMessages = {
      save: 'Failed to save data. Please try again.',
      load: 'Failed to load data. Your data may be corrupted.',
      delete: 'Failed to delete data. Please try again.',
      export: 'Failed to export conversation. Please try again.',
      import: 'Failed to import data. The file may be corrupted.',
    };

    return operationMessages[this.operation] || 'A storage error occurred.';
  }
}

/**
 * Validation Errors
 * Errors related to input validation, schema validation
 */
export class ValidationError extends AppError {
  constructor(field, message, value = null) {
    super(
      `Validation failed for ${field}: ${message}`,
      'VALIDATION_ERROR',
      { field, value }
    );
    this.field = field;
    this.value = value;
  }

  getUserMessage() {
    return `Invalid ${this.field}: ${this.message}`;
  }
}

/**
 * Network Errors
 * Errors related to API calls, network requests
 */
export class NetworkError extends AppError {
  constructor(url, message, status = null, originalError = null) {
    super(
      `Network request to ${url} failed: ${message}`,
      'NETWORK_ERROR',
      {
        url,
        status,
        originalError: originalError?.message,
      }
    );
    this.url = url;
    this.status = status;
    this.originalError = originalError;
  }

  getUserMessage() {
    if (this.status === 404) {
      return 'Resource not found. Please check the URL.';
    }
    if (this.status === 401 || this.status === 403) {
      return 'Authentication required. Please check your credentials.';
    }
    if (this.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (this.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return 'Network request failed. Please check your connection.';
  }
}

/**
 * Configuration Errors
 * Errors related to app configuration, settings
 */
export class ConfigurationError extends AppError {
  constructor(setting, message, metadata = {}) {
    super(
      `Configuration error for ${setting}: ${message}`,
      'CONFIG_ERROR',
      { setting, ...metadata }
    );
    this.setting = setting;
  }

  getUserMessage() {
    return `Configuration error: ${this.message}. Please check your settings.`;
  }
}

/**
 * Feature Not Supported Error
 * Errors when a feature is not available or implemented
 */
export class FeatureNotSupportedError extends AppError {
  constructor(feature, provider = null) {
    super(
      `Feature "${feature}" is not supported${provider ? ` by ${provider}` : ''}`,
      'FEATURE_NOT_SUPPORTED',
      { feature, provider }
    );
    this.feature = feature;
    this.provider = provider;
  }

  getUserMessage() {
    if (this.provider) {
      return `${this.feature} is not supported by ${this.provider}. Try a different provider.`;
    }
    return `${this.feature} is not yet supported. Check back in a future update.`;
  }
}

/**
 * Error utility functions
 */

/**
 * Check if an error is a specific type
 */
export const isErrorType = (error, ErrorClass) => {
  return error instanceof ErrorClass;
};

/**
 * Extract user-friendly message from any error
 */
export const getUserErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.getUserMessage();
  }

  // Handle standard errors
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.';
  }

  // Handle non-Error objects
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred.';
};

/**
 * Log error to console/tracking service
 */
export const logError = (error, context = {}) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    ...(error instanceof AppError ? error.toJSON() : { message: error?.message, stack: error?.stack }),
  };

  console.error('[Error]', errorData);

  // In production, send to error tracking
  if (import.meta.env.PROD && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }

  return errorData;
};

/**
 * Wrap async function with error handling
 * Automatically catches and logs errors
 */
export const withErrorHandling = (fn, errorHandler = null) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name, args });

      if (errorHandler) {
        return errorHandler(error);
      }

      throw error;
    }
  };
};

// Export all error classes
export default {
  AppError,
  AIProviderError,
  AuthenticationError,
  StorageError,
  ValidationError,
  NetworkError,
  ConfigurationError,
  FeatureNotSupportedError,
  isErrorType,
  getUserErrorMessage,
  logError,
  withErrorHandling,
};
