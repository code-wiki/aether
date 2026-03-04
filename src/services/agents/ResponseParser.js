/**
 * ResponseParser - Parse AI responses for artifact generation requests
 * Detects special syntax for generating images, charts, and other artifacts
 */

class ResponseParser {
  constructor() {
    this.artifactHandlers = new Map();
  }

  /**
   * Register an artifact handler
   * @param {string} type - Artifact type (e.g., 'image', 'chart')
   * @param {Function} handler - Handler function that generates the artifact
   */
  registerHandler(type, handler) {
    this.artifactHandlers.set(type, handler);
  }

  /**
   * Parse response content for artifact requests
   * Detects patterns like:
   * - [[generate:image prompt="..."]]
   * - ```artifact:chart ...```
   *
   * @param {string} content - AI response content
   * @returns {Array} Array of artifact requests
   */
  parseArtifacts(content) {
    const artifacts = [];

    // Pattern 1: Inline syntax [[generate:type key="value" ...]]
    const inlineRegex = /\[\[generate:(\w+)\s+([^\]]+)\]\]/g;
    let match;

    while ((match = inlineRegex.exec(content)) !== null) {
      const type = match[1];
      const attributesString = match[2];
      const config = this.parseAttributes(attributesString);

      artifacts.push({
        type,
        config,
        position: match.index,
        syntax: 'inline',
        raw: match[0],
      });
    }

    // Pattern 2: Code block syntax ```artifact:type\nkey: value\n```
    const blockRegex = /```artifact:(\w+)\n([\s\S]*?)```/g;

    while ((match = blockRegex.exec(content)) !== null) {
      const type = match[1];
      const configString = match[2];
      const config = this.parseYAML(configString);

      artifacts.push({
        type,
        config,
        position: match.index,
        syntax: 'block',
        raw: match[0],
      });
    }

    return artifacts;
  }

  /**
   * Parse inline attributes (key="value" key2="value2")
   * @param {string} str - Attributes string
   * @returns {Object} Parsed attributes
   */
  parseAttributes(str) {
    const attrs = {};
    const regex = /(\w+)="([^"]+)"/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      const key = match[1];
      let value = match[2];

      // Try to parse as JSON for arrays/objects
      if (value.startsWith('[') || value.startsWith('{')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }

      attrs[key] = value;
    }

    return attrs;
  }

  /**
   * Parse simple YAML-like syntax
   * @param {string} str - YAML string
   * @returns {Object} Parsed config
   */
  parseYAML(str) {
    const config = {};
    const lines = str.trim().split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays [1, 2, 3]
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string
        }
      }

      // Parse numbers
      if (!isNaN(value) && value !== '') {
        value = parseFloat(value);
      }

      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      config[key] = value;
    }

    return config;
  }

  /**
   * Process detected artifacts by calling their handlers
   * @param {Array} artifacts - Array of artifact requests
   * @param {Object} context - Context (message, settings, etc.)
   * @returns {Promise<Array>} Array of generated attachments
   */
  async processArtifacts(artifacts, context = {}) {
    const generated = [];

    for (const artifact of artifacts) {
      try {
        const handler = this.artifactHandlers.get(artifact.type);

        if (!handler) {
          console.warn(`[ResponseParser] No handler for artifact type: ${artifact.type}`);
          continue;
        }

        console.log(`[ResponseParser] Processing ${artifact.type} artifact...`);
        const result = await handler(artifact.config, context);

        if (result) {
          generated.push({
            ...result,
            artifactType: artifact.type,
            originalRequest: artifact,
          });
        }
      } catch (error) {
        console.error(`[ResponseParser] Failed to process ${artifact.type}:`, error);
        // Continue processing other artifacts even if one fails
      }
    }

    return generated;
  }

  /**
   * Remove artifact syntax from content
   * @param {string} content - Original content
   * @param {Array} artifacts - Detected artifacts
   * @returns {string} Cleaned content
   */
  removeArtifactSyntax(content, artifacts) {
    let cleaned = content;

    // Sort by position descending to avoid index shifting
    const sorted = artifacts.sort((a, b) => b.position - a.position);

    for (const artifact of sorted) {
      cleaned = cleaned.substring(0, artifact.position) +
                cleaned.substring(artifact.position + artifact.raw.length);
    }

    return cleaned.trim();
  }

  /**
   * Check if content contains artifact requests
   * @param {string} content - Content to check
   * @returns {boolean}
   */
  hasArtifacts(content) {
    return /\[\[generate:\w+/.test(content) || /```artifact:\w+/.test(content);
  }
}

export default ResponseParser;
