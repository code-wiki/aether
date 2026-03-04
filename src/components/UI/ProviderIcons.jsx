import React from 'react';

/**
 * Provider Icon URLs - Using local assets
 */
const ICON_URLS = {
  claude: '/logos/claude.png',
  gemini: '/logos/gemini.png',
  openai: '/logos/openai.png',
};

/**
 * Anthropic Claude Icon
 */
export function ClaudeIcon({ className = "w-5 h-5" }) {
  return (
    <img
      src={ICON_URLS.claude}
      alt="Claude AI"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

/**
 * Google Gemini Icon
 */
export function GeminiIcon({ className = "w-5 h-5" }) {
  return (
    <img
      src={ICON_URLS.gemini}
      alt="Google Gemini"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

/**
 * OpenAI Icon
 */
export function OpenAIIcon({ className = "w-5 h-5" }) {
  return (
    <img
      src={ICON_URLS.openai}
      alt="OpenAI"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

/**
 * Get icon component for provider
 */
export function getProviderIcon(provider, className) {
  switch (provider) {
    case 'claude':
      return <ClaudeIcon className={className} />;
    case 'gemini':
      return <GeminiIcon className={className} />;
    case 'openai':
      return <OpenAIIcon className={className} />;
    default:
      return null;
  }
}
