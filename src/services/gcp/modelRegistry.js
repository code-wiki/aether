/**
 * Model Registry - Comprehensive list of all Vertex AI models
 * Updated: 2026-03-03
 */

export const KNOWN_CLAUDE_MODELS = [
  // Claude 4.5 (Latest)
  { id: 'claude-opus-4-5@20251101', name: 'Claude Opus 4.5', description: 'Most capable for complex reasoning', version: '4.5' },
  { id: 'claude-sonnet-4-5@20250929', name: 'Claude Sonnet 4.5', description: 'Powerful general-purpose', version: '4.5' },
  { id: 'claude-haiku-4-5@20251001', name: 'Claude Haiku 4.5', description: 'Fast and efficient', version: '4.5' },

  // Claude 3.5
  { id: 'claude-3-5-sonnet-v2@20241022', name: 'Claude 3.5 Sonnet v2', description: 'Enhanced reasoning', version: '3.5' },
  { id: 'claude-3-5-sonnet@20240620', name: 'Claude 3.5 Sonnet', description: 'Balanced performance', version: '3.5' },

  // Claude 3
  { id: 'claude-3-opus@20240229', name: 'Claude 3 Opus', description: 'Powerful reasoning', version: '3' },
  { id: 'claude-3-sonnet@20240229', name: 'Claude 3 Sonnet', description: 'Balanced', version: '3' },
  { id: 'claude-3-haiku@20240307', name: 'Claude 3 Haiku', description: 'Fast', version: '3' },
];

export const KNOWN_GEMINI_MODELS = [
  // Gemini 2.0
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', description: 'Next-gen fast model', version: '2.0' },

  // Gemini 1.5
  { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro (Latest)', description: 'Most capable', version: '1.5' },
  { id: 'gemini-1.5-pro-001', name: 'Gemini 1.5 Pro', description: 'Powerful reasoning', version: '1.5' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable', version: '1.5' },
  { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash (Latest)', description: 'Fast and efficient', version: '1.5' },
  { id: 'gemini-1.5-flash-001', name: 'Gemini 1.5 Flash', description: 'Fast and efficient', version: '1.5' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient', version: '1.5' },

  // Gemini 1.0
  { id: 'gemini-1.0-pro-002', name: 'Gemini 1.0 Pro (Latest)', description: 'Stable version', version: '1.0' },
  { id: 'gemini-1.0-pro-001', name: 'Gemini 1.0 Pro', description: 'Stable version', version: '1.0' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Stable version', version: '1.0' },
];

export const FALLBACK_OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Advanced reasoning' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
];

export const CLAUDE_SUPPORTED_REGIONS = ['us-east5', 'europe-west1', 'asia-southeast1'];

export const FALLBACK_LOCATIONS = [
  { id: 'us-east5', name: 'US East (Columbus)', flag: '🇺🇸' },
  { id: 'us-central1', name: 'US Central (Iowa)', flag: '🇺🇸' },
  { id: 'us-west1', name: 'US West (Oregon)', flag: '🇺🇸' },
  { id: 'us-west4', name: 'US West (Las Vegas)', flag: '🇺🇸' },
  { id: 'europe-west1', name: 'Europe West (Belgium)', flag: '🇪🇺' },
  { id: 'europe-west4', name: 'Europe West (Netherlands)', flag: '🇪🇺' },
  { id: 'asia-southeast1', name: 'Asia Southeast (Singapore)', flag: '🇸🇬' },
  { id: 'asia-northeast1', name: 'Asia Northeast (Tokyo)', flag: '🇯🇵' },
];
