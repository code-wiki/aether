/**
 * Model Validation and Migration Service
 * Ensures saved model IDs are valid and available
 */

/**
 * Validate if a model ID is available in the current model list
 * @param {string} modelId - The model ID to validate
 * @param {Array} availableModels - Array of available model objects
 * @returns {boolean} - True if model is available
 */
export function isModelAvailable(modelId, availableModels) {
  if (!modelId || !availableModels || availableModels.length === 0) {
    return false;
  }

  return availableModels.some(model => model.id === modelId);
}

/**
 * Get the best available model for a provider
 * Tries to find the saved model, falls back to first available
 * @param {string} savedModelId - The saved/preferred model ID
 * @param {Array} availableModels - Array of available model objects
 * @param {string} provider - Provider name (for logging)
 * @returns {string} - Valid model ID
 */
export function getValidModelId(savedModelId, availableModels, provider) {
  // If no models available, return the saved one (will use fallback)
  if (!availableModels || availableModels.length === 0) {
    console.warn(`[ModelValidation] No models available for ${provider}, using saved: ${savedModelId}`);
    return savedModelId;
  }

  // Check if saved model is still available
  if (isModelAvailable(savedModelId, availableModels)) {
    return savedModelId;
  }

  // Model not available - migrate to first available
  const firstAvailable = availableModels[0];
  console.log(`[ModelValidation] Model '${savedModelId}' not available for ${provider}. Migrating to: ${firstAvailable.id}`);

  return firstAvailable.id;
}

/**
 * Migrate old Claude model IDs to new versions
 * @param {string} modelId - Old model ID
 * @returns {string} - Migrated model ID
 */
export function migrateClaudeModelId(modelId) {
  const migrations = {
    // Migrate Claude 3.x models to Claude 4.5 Sonnet (available in this project)
    'claude-3-5-sonnet@20240620': 'claude-sonnet-4-5@20250929',
    'claude-3-5-sonnet-v2@20241022': 'claude-sonnet-4-5@20250929',
    'claude-3-opus@20240229': 'claude-opus-4-5@20251101',
    'claude-3-sonnet@20240229': 'claude-sonnet-4-5@20250929',
    'claude-3-haiku@20240307': 'claude-haiku-4-5@20251001',

    // Legacy models → Claude 4.5 Sonnet
    'claude-2.1': 'claude-sonnet-4-5@20250929',
    'claude-2': 'claude-sonnet-4-5@20250929',
  };

  return migrations[modelId] || modelId;
}

/**
 * Validate and migrate a model ID for a specific provider
 * @param {string} modelId - The model ID to validate
 * @param {string} provider - Provider name ('claude', 'gemini', 'openai')
 * @param {Array} availableModels - Array of available models
 * @returns {string} - Valid, migrated model ID
 */
export function validateAndMigrateModel(modelId, provider, availableModels) {
  // Migrate Claude models first
  let validatedId = modelId;
  if (provider === 'claude') {
    validatedId = migrateClaudeModelId(modelId);
    if (validatedId !== modelId) {
      console.log(`[ModelValidation] Migrated Claude model: ${modelId} → ${validatedId}`);
    }
  }

  // Validate against available models
  return getValidModelId(validatedId, availableModels, provider);
}

export default {
  isModelAvailable,
  getValidModelId,
  migrateClaudeModelId,
  validateAndMigrateModel,
};
