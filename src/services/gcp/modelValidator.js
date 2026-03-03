/**
 * Model Validator - Tests which models are available in the GCP project
 * Uses lightweight validation requests to detect accessible models
 */

import { KNOWN_CLAUDE_MODELS, KNOWN_GEMINI_MODELS } from './modelRegistry';

// In-memory cache for validated models (session-based)
const validationCache = {
  claude: null,
  gemini: null,
  lastValidated: {
    claude: null,
    gemini: null,
  },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Test if a Claude model is accessible
 */
async function testClaudeModel(projectId, location, modelId) {
  try {
    const tokenResult = await window.electron.gcp.getAccessToken([
      'https://www.googleapis.com/auth/cloud-platform'
    ]);

    if (!tokenResult.success) {
      return false;
    }

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${modelId}:rawPredict`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anthropic_version: 'vertex-2023-10-16',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    // 200 = works, 404 = not available, 403 = no permission
    return response.ok;
  } catch (error) {
    console.warn(`[ModelValidator] Claude ${modelId} test failed:`, error.message);
    return false;
  }
}

/**
 * Test if a Gemini model is accessible
 */
async function testGeminiModel(projectId, location, modelId) {
  try {
    const tokenResult = await window.electron.gcp.getAccessToken([
      'https://www.googleapis.com/auth/cloud-platform'
    ]);

    if (!tokenResult.success) {
      return false;
    }

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    });

    return response.ok;
  } catch (error) {
    console.warn(`[ModelValidator] Gemini ${modelId} test failed:`, error.message);
    return false;
  }
}

/**
 * Validate all Claude models in parallel
 */
export async function validateClaudeModels(projectId, location) {
  // Check cache first
  const now = Date.now();
  if (
    validationCache.claude &&
    validationCache.lastValidated.claude &&
    now - validationCache.lastValidated.claude < CACHE_DURATION
  ) {
    console.log('[ModelValidator] Using cached Claude models');
    return validationCache.claude;
  }

  console.log('[ModelValidator] Testing Claude models...');

  // Only test Claude models if in supported region
  const supportedRegions = ['us-east5', 'europe-west1', 'asia-southeast1'];
  if (!supportedRegions.includes(location)) {
    console.log(`[ModelValidator] Location ${location} doesn't support Claude`);
    validationCache.claude = [];
    validationCache.lastValidated.claude = now;
    return [];
  }

  // Test all known Claude models in parallel
  const results = await Promise.all(
    KNOWN_CLAUDE_MODELS.map(async (model) => {
      const isAvailable = await testClaudeModel(projectId, location, model.id);
      return { ...model, available: isAvailable };
    })
  );

  // Filter to only available models
  const availableModels = results.filter(m => m.available);

  console.log(`[ModelValidator] Found ${availableModels.length}/${KNOWN_CLAUDE_MODELS.length} available Claude models`);

  // Cache results
  validationCache.claude = availableModels;
  validationCache.lastValidated.claude = now;

  return availableModels;
}

/**
 * Validate all Gemini models in parallel
 */
export async function validateGeminiModels(projectId, location) {
  // Check cache first
  const now = Date.now();
  if (
    validationCache.gemini &&
    validationCache.lastValidated.gemini &&
    now - validationCache.lastValidated.gemini < CACHE_DURATION
  ) {
    console.log('[ModelValidator] Using cached Gemini models');
    return validationCache.gemini;
  }

  console.log('[ModelValidator] Testing Gemini models...');

  // Test all known Gemini models in parallel
  const results = await Promise.all(
    KNOWN_GEMINI_MODELS.map(async (model) => {
      const isAvailable = await testGeminiModel(projectId, location, model.id);
      return { ...model, available: isAvailable };
    })
  );

  // Filter to only available models
  const availableModels = results.filter(m => m.available);

  console.log(`[ModelValidator] Found ${availableModels.length}/${KNOWN_GEMINI_MODELS.length} available Gemini models`);

  // Cache results
  validationCache.gemini = availableModels;
  validationCache.lastValidated.gemini = now;

  return availableModels;
}

/**
 * Clear validation cache (useful when location changes)
 */
export function clearValidationCache() {
  validationCache.claude = null;
  validationCache.gemini = null;
  validationCache.lastValidated.claude = null;
  validationCache.lastValidated.gemini = null;
  console.log('[ModelValidator] Cache cleared');
}

export default {
  validateClaudeModels,
  validateGeminiModels,
  clearValidationCache,
};
