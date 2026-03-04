/**
 * ImageGenerationProvider - Generate images using DALL-E 3
 */
import { v4 as uuidv4 } from 'uuid';

class ImageGenerationProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = null;
  }

  /**
   * Initialize OpenAI client for image generation
   */
  async initialize() {
    if (!this.apiKey) {
      throw new Error(
        'OpenAI API key is required for image generation. Please add your API key in Settings → API Keys.'
      );
    }

    try {
      // Dynamic import for OpenAI SDK
      const OpenAI = (await import('openai')).default;
      this.client = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true,
      });
      return true;
    } catch (error) {
      console.error('[ImageGenerationProvider] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Main generate method (interface for ResponseParser)
   * @param {Object} config - Configuration with prompt and options
   * @returns {Promise<Object>} Generated image attachment
   */
  async generate(config) {
    const { prompt, size, quality, style } = config;
    return await this.generateImage(prompt, { size, quality, style });
  }

  /**
   * Generate an image using DALL-E 3
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image attachment
   */
  async generateImage(prompt, options = {}) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const {
        size = '1024x1024',
        quality = 'standard',
        style = 'vivid',
        model = 'dall-e-3',
      } = options;

      console.log(`[ImageGenerationProvider] Generating image: "${prompt}"`);

      const response = await this.client.images.generate({
        model,
        prompt,
        size,
        quality,
        style,
        n: 1,
      });

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      // Convert URL to base64
      const base64Data = await this.urlToBase64(imageUrl);

      // Create attachment object
      const attachment = {
        id: uuidv4(),
        name: `generated-${Date.now()}.png`,
        type: 'image/png',
        size: base64Data.length,
        data: base64Data,
        source: 'generated',
        metadata: {
          model,
          prompt,
          revisedPrompt,
          size,
          quality,
          style,
          generatedAt: Date.now(),
          tool: 'image-generation',
        },
      };

      console.log(`[ImageGenerationProvider] Image generated successfully: ${attachment.name}`);
      return attachment;
    } catch (error) {
      console.error('[ImageGenerationProvider] Generation failed:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Create image variations (DALL-E 2 only)
   * @param {string} imageData - Base64 image data
   * @param {Object} options - Variation options
   * @returns {Promise<Object>} Generated variation attachment
   */
  async createVariation(imageData, options = {}) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const { size = '1024x1024', n = 1 } = options;

      // Convert base64 to File/Blob
      const blob = await this.base64ToBlob(imageData);
      const file = new File([blob], 'image.png', { type: 'image/png' });

      const response = await this.client.images.createVariation({
        image: file,
        n,
        size,
      });

      const imageUrl = response.data[0].url;
      const base64Data = await this.urlToBase64(imageUrl);

      const attachment = {
        id: uuidv4(),
        name: `variation-${Date.now()}.png`,
        type: 'image/png',
        size: base64Data.length,
        data: base64Data,
        source: 'generated',
        metadata: {
          model: 'dall-e-2',
          type: 'variation',
          size,
          generatedAt: Date.now(),
          tool: 'image-variation',
        },
      };

      return attachment;
    } catch (error) {
      console.error('[ImageGenerationProvider] Variation failed:', error);
      throw new Error(`Failed to create variation: ${error.message}`);
    }
  }

  /**
   * Convert URL to base64 data URL
   */
  async urlToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[ImageGenerationProvider] URL to base64 conversion failed:', error);
      throw error;
    }
  }

  /**
   * Convert base64 to Blob
   */
  async base64ToBlob(base64Data) {
    const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }

  /**
   * Get supported sizes for DALL-E 3
   */
  getSupportedSizes() {
    return ['1024x1024', '1792x1024', '1024x1792'];
  }

  /**
   * Get supported qualities
   */
  getSupportedQualities() {
    return ['standard', 'hd'];
  }

  /**
   * Get supported styles
   */
  getSupportedStyles() {
    return ['vivid', 'natural'];
  }
}

export default ImageGenerationProvider;
