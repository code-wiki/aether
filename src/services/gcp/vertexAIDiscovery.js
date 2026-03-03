/**
 * Vertex AI Discovery Service
 * Dynamically fetches available GCP regions and AI models (Gemini/Claude) from Vertex AI APIs
 *
 * Features:
 * - Fetch GCP regions from Vertex AI API
 * - Fetch Gemini and Claude models per region
 * - 15-minute TTL cache (in-memory + Electron Store persistence)
 * - Fallback to hardcoded constants on API failure
 * - Automatic token refresh via IPC bridge
 */

// ============================================================================
// FALLBACK CONSTANTS
// ============================================================================

export const FALLBACK_LOCATIONS = [
  { id: 'us-east5', name: 'US East (Columbus)', flag: '🇺🇸' },
  { id: 'us-central1', name: 'US Central (Iowa)', flag: '🇺🇸' },
  { id: 'us-west1', name: 'US West (Oregon)', flag: '🇺🇸' },
  { id: 'europe-west1', name: 'Europe West (Belgium)', flag: '🇪🇺' },
  { id: 'asia-southeast1', name: 'Asia Southeast (Singapore)', flag: '🇸🇬' },
];

export const FALLBACK_GEMINI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', description: 'Smaller, faster variant' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable' },
];

export const FALLBACK_CLAUDE_MODELS = [
  { id: 'claude-3-5-sonnet@20240620', name: 'Claude 3.5 Sonnet', description: 'Most capable' },
  { id: 'claude-3-opus@20240229', name: 'Claude 3 Opus', description: 'Powerful reasoning' },
  { id: 'claude-3-sonnet@20240229', name: 'Claude 3 Sonnet', description: 'Balanced' },
  { id: 'claude-3-haiku@20240307', name: 'Claude 3 Haiku', description: 'Fast and efficient' },
];

export const FALLBACK_OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
  { id: 'o1-preview', name: 'o1 Preview', description: 'Advanced reasoning' },
  { id: 'o1-mini', name: 'o1 Mini', description: 'Faster reasoning' },
];

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

class CacheManager {
  constructor() {
    this.cache = {
      locations: { data: null, timestamp: null },
      models: {}, // Key: `${projectId}:${location}:${publisher}`
    };
  }

  /**
   * Set cache entry with current timestamp
   */
  set(key, data) {
    if (key === 'locations') {
      this.cache.locations = { data, timestamp: Date.now() };
    } else {
      this.cache.models[key] = { data, timestamp: Date.now() };
    }

    // Persist to Electron Store for offline resilience
    this._persistToStore();
  }

  /**
   * Get cached entry if valid (within TTL)
   */
  get(key) {
    const entry = key === 'locations' ? this.cache.locations : this.cache.models[key];

    if (!entry || !entry.data) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      console.log(`[Discovery] Cache expired for ${key} (age: ${Math.round(age / 1000)}s)`);
      return null;
    }

    console.log(`[Discovery] Cache hit for ${key} (valid for ${Math.round((CACHE_TTL_MS - age) / 60000)}m)`);
    return entry.data;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache = {
      locations: { data: null, timestamp: null },
      models: {},
    };
    this._persistToStore();
  }

  /**
   * Persist cache to Electron Store
   */
  async _persistToStore() {
    if (window.electron?.settings) {
      try {
        await window.electron.settings.update({
          _vertexAICache: this.cache,
        });
      } catch (err) {
        console.warn('[Discovery] Failed to persist cache:', err);
      }
    }
  }

  /**
   * Load cache from Electron Store (on startup)
   */
  async loadFromStore() {
    if (window.electron?.settings) {
      try {
        const settings = await window.electron.settings.get();
        if (settings._vertexAICache) {
          this.cache = settings._vertexAICache;
          console.log('[Discovery] Loaded cache from Electron Store');
        }
      } catch (err) {
        console.warn('[Discovery] Failed to load cache from store:', err);
      }
    }
  }
}

// Singleton cache instance
const cache = new CacheManager();

// ============================================================================
// API CLIENT (via IPC to bypass CORS)
// ============================================================================

/**
 * Make authenticated API request to Vertex AI via Electron IPC
 * This bypasses CORS by making the request from Node.js main process
 */
async function fetchVertexAI(ipcMethod, ...args) {
  if (!window.electron?.vertexAI) {
    throw new Error('Electron Vertex AI API not available');
  }

  try {
    const result = await window.electron.vertexAI[ipcMethod](...args);

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data;
  } catch (err) {
    console.error(`[Discovery] ${ipcMethod} error:`, err);
    throw err;
  }
}

// ============================================================================
// DISCOVERY FUNCTIONS
// ============================================================================

/**
 * Fetch available GCP locations for Vertex AI
 * @param {string} projectId - GCP project ID
 * @returns {Promise<Array>} - Array of location objects
 */
export async function fetchLocations(projectId) {
  if (!projectId) {
    console.warn('[Discovery] No project ID provided');
    return FALLBACK_LOCATIONS;
  }

  // Check cache first
  const cached = cache.get('locations');
  if (cached) {
    return cached;
  }

  try {
    console.log(`[Discovery] Fetching locations for project: ${projectId}`);

    const data = await fetchVertexAI('fetchLocations', projectId);

    // Parse response - filter to only regions that support Vertex AI
    const locations = (data.locations || [])
      .filter(loc => {
        // Only include regions (not zones)
        return loc.name && loc.locationId && !loc.locationId.includes('-');
      })
      .map(loc => ({
        id: loc.locationId,
        name: loc.displayName || loc.locationId,
        flag: getRegionFlag(loc.locationId),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    if (locations.length === 0) {
      console.warn('[Discovery] No locations found in API response');
      return FALLBACK_LOCATIONS;
    }

    // Cache and return
    cache.set('locations', locations);
    console.log(`[Discovery] Fetched ${locations.length} locations`);
    return locations;

  } catch (err) {
    console.error('[Discovery] Failed to fetch locations:', err);
    return FALLBACK_LOCATIONS;
  }
}

/**
 * Fetch available Gemini models for a specific location
 * @param {string} projectId - GCP project ID
 * @param {string} location - GCP location (e.g., 'us-central1')
 * @returns {Promise<Array>} - Array of model objects
 */
export async function fetchGeminiModels(projectId, location) {
  if (!projectId || !location) {
    console.warn('[Discovery] Missing projectId or location for Gemini models');
    return FALLBACK_GEMINI_MODELS;
  }

  // Check cache first
  const cacheKey = `${projectId}:${location}:google`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    console.log(`[Discovery] Fetching Gemini models for ${location}`);

    const data = await fetchVertexAI('fetchGeminiModels', projectId, location);

    // Parse response - filter to only Gemini models
    const models = (data.models || [])
      .filter(model => {
        const modelId = model.name?.split('/').pop() || '';
        return modelId.startsWith('gemini-');
      })
      .map(model => {
        const modelId = model.name?.split('/').pop() || '';
        return {
          id: modelId,
          name: formatModelName(modelId),
          description: model.displayName || getModelDescription(modelId),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    if (models.length === 0) {
      console.warn('[Discovery] No Gemini models found in API response');
      return FALLBACK_GEMINI_MODELS;
    }

    // Cache and return
    cache.set(cacheKey, models);
    console.log(`[Discovery] Fetched ${models.length} Gemini models`);
    return models;

  } catch (err) {
    console.error('[Discovery] Failed to fetch Gemini models:', err);
    return FALLBACK_GEMINI_MODELS;
  }
}

/**
 * Fetch available Claude models for a specific location
 * @param {string} projectId - GCP project ID
 * @param {string} location - GCP location (e.g., 'us-east5')
 * @returns {Promise<Array>} - Array of model objects
 */
export async function fetchClaudeModels(projectId, location) {
  if (!projectId || !location) {
    console.warn('[Discovery] Missing projectId or location for Claude models');
    return FALLBACK_CLAUDE_MODELS;
  }

  // Claude is only available in specific regions
  const claudeRegions = ['us-east5', 'europe-west1', 'asia-southeast1'];
  if (!claudeRegions.includes(location)) {
    console.log(`[Discovery] Claude not available in ${location}`);
    return [];
  }

  // Check cache first
  const cacheKey = `${projectId}:${location}:anthropic`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    console.log(`[Discovery] Fetching Claude models for ${location}`);

    const data = await fetchVertexAI('fetchClaudeModels', projectId, location);

    // Parse response - filter to only Claude models
    const models = (data.models || [])
      .filter(model => {
        const modelId = model.name?.split('/').pop() || '';
        return modelId.startsWith('claude-');
      })
      .map(model => {
        const modelId = model.name?.split('/').pop() || '';
        return {
          id: modelId,
          name: formatModelName(modelId),
          description: model.displayName || getModelDescription(modelId),
        };
      })
      .sort((a, b) => {
        // Sort by version (newer first)
        return b.id.localeCompare(a.id);
      });

    if (models.length === 0) {
      console.warn('[Discovery] No Claude models found in API response');
      return FALLBACK_CLAUDE_MODELS;
    }

    // Cache and return
    cache.set(cacheKey, models);
    console.log(`[Discovery] Fetched ${models.length} Claude models`);
    return models;

  } catch (err) {
    console.error('[Discovery] Failed to fetch Claude models:', err);
    return FALLBACK_CLAUDE_MODELS;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get flag emoji for a region
 */
function getRegionFlag(locationId) {
  if (locationId.startsWith('us-')) return '🇺🇸';
  if (locationId.startsWith('europe-')) return '🇪🇺';
  if (locationId.startsWith('asia-southeast')) return '🇸🇬';
  if (locationId.startsWith('asia-northeast')) return '🇯🇵';
  if (locationId.startsWith('asia-south')) return '🇮🇳';
  if (locationId.startsWith('australia-')) return '🇦🇺';
  if (locationId.startsWith('northamerica-')) return '🇨🇦';
  if (locationId.startsWith('southamerica-')) return '🇧🇷';
  return '🌍';
}

/**
 * Format model ID into readable name
 */
function formatModelName(modelId) {
  // gemini-1.5-flash -> Gemini 1.5 Flash
  // claude-3-5-sonnet-v2@20241022 -> Claude 3.5 Sonnet v2

  const withoutVersion = modelId.split('@')[0];

  return withoutVersion
    .split('-')
    .map(part => {
      // Preserve version numbers
      if (/^\d/.test(part)) return part;
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

/**
 * Get description for known models
 */
function getModelDescription(modelId) {
  const descriptions = {
    'gemini-1.5-flash': 'Fast and efficient',
    'gemini-1.5-flash-8b': 'Smaller, faster variant',
    'gemini-1.5-pro': 'Most capable',
    'claude-3-5-sonnet-v2@20241022': 'Latest and most capable',
    'claude-3-5-sonnet@20240620': 'Balanced performance',
    'claude-3-haiku@20240307': 'Fast and efficient',
    'claude-3-opus@20240229': 'Most intelligent',
  };

  return descriptions[modelId] || '';
}

/**
 * Clear all cached data
 */
export function clearCache() {
  cache.clear();
  console.log('[Discovery] Cache cleared');
}

/**
 * Initialize cache from Electron Store (call on app startup)
 */
export async function initializeCache() {
  await cache.loadFromStore();
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  fetchLocations,
  fetchGeminiModels,
  fetchClaudeModels,
  clearCache,
  initializeCache,
  FALLBACK_LOCATIONS,
  FALLBACK_GEMINI_MODELS,
  FALLBACK_CLAUDE_MODELS,
  FALLBACK_OPENAI_MODELS,
};
