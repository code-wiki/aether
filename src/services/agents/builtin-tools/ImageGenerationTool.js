/**
 * ImageGenerationTool - Generate images using DALL-E
 */
import Tool from './Tool.js';
import ImageGenerationProvider from '../../providers/generation/ImageGenerationProvider.js';

class ImageGenerationTool extends Tool {
  constructor(apiKey) {
    super(
      'image-generation',
      'Generate images using DALL-E 3',
      {
        prompt: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 4000,
        },
        size: {
          type: 'enum',
          values: ['1024x1024', '1792x1024', '1024x1792'],
          required: false,
        },
        quality: {
          type: 'enum',
          values: ['standard', 'hd'],
          required: false,
        },
        style: {
          type: 'enum',
          values: ['vivid', 'natural'],
          required: false,
        },
      }
    );

    this.provider = new ImageGenerationProvider(apiKey);
  }

  /**
   * Execute image generation
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generated image attachment
   */
  async execute(params) {
    // Validate parameters
    this.validate(params);

    // Generate image
    const attachment = await this.provider.generateImage(params.prompt, {
      size: params.size || '1024x1024',
      quality: params.quality || 'standard',
      style: params.style || 'vivid',
    });

    return attachment;
  }

  /**
   * Initialize the tool
   */
  async initialize() {
    await this.provider.initialize();
  }
}

export default ImageGenerationTool;
