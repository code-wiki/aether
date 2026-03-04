/**
 * ChartGenerationTool - Generate charts and graphs
 */
import Tool from './Tool.js';
import ChartGenerationProvider from '../../providers/generation/ChartGenerationProvider.js';

class ChartGenerationTool extends Tool {
  constructor() {
    super(
      'chart-generation',
      'Generate charts and graphs',
      {
        type: {
          type: 'enum',
          values: ['bar', 'line', 'pie', 'doughnut'],
          required: true,
        },
        labels: {
          type: 'array',
          required: true,
        },
        values: {
          type: 'array',
          required: true,
        },
        title: {
          type: 'string',
          required: false,
        },
        label: {
          type: 'string',
          required: false,
        },
        width: {
          type: 'number',
          min: 200,
          max: 2000,
          required: false,
        },
        height: {
          type: 'number',
          min: 200,
          max: 2000,
          required: false,
        },
      }
    );

    this.provider = new ChartGenerationProvider();
  }

  /**
   * Execute chart generation
   * @param {Object} params - Chart parameters
   * @returns {Promise<Object>} Generated chart attachment
   */
  async execute(params) {
    // Validate parameters
    this.validate(params);

    // Validate arrays have same length
    if (params.labels.length !== params.values.length) {
      throw new Error('Labels and values arrays must have the same length');
    }

    // Generate chart based on type
    const data = {
      labels: params.labels,
      values: params.values,
      title: params.title,
      label: params.label,
      options: {
        width: params.width,
        height: params.height,
      },
    };

    let attachment;
    switch (params.type) {
      case 'bar':
        attachment = await this.provider.generateBarChart(data);
        break;
      case 'line':
        attachment = await this.provider.generateLineChart(data);
        break;
      case 'pie':
      case 'doughnut':
        attachment = await this.provider.generatePieChart(data);
        break;
      default:
        throw new Error(`Unsupported chart type: ${params.type}`);
    }

    return attachment;
  }
}

export default ChartGenerationTool;
