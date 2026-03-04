/**
 * ChartGenerationProvider - Generate charts using QuickChart API
 * QuickChart is a free, open-source chart image API
 */
import { v4 as uuidv4 } from 'uuid';

class ChartGenerationProvider {
  constructor() {
    this.baseUrl = 'https://quickchart.io/chart';
  }

  /**
   * Generate a chart image
   * @param {Object} chartConfig - Chart.js configuration
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated chart attachment
   */
  async generateChart(chartConfig, options = {}) {
    try {
      const {
        width = 600,
        height = 400,
        backgroundColor = 'white',
        devicePixelRatio = 2.0,
      } = options;

      const url = new URL(this.baseUrl);
      url.searchParams.set('c', JSON.stringify(chartConfig));
      url.searchParams.set('width', width);
      url.searchParams.set('height', height);
      url.searchParams.set('backgroundColor', backgroundColor);
      url.searchParams.set('devicePixelRatio', devicePixelRatio);

      console.log('[ChartGenerationProvider] Generating chart...');

      // Fetch the chart image
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`QuickChart API error: ${response.status}`);
      }

      // Convert to base64
      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);

      // Create attachment object
      const attachment = {
        id: uuidv4(),
        name: `chart-${Date.now()}.png`,
        type: 'image/png',
        size: base64Data.length,
        data: base64Data,
        source: 'generated',
        metadata: {
          tool: 'chart-generation',
          chartType: chartConfig.type,
          width,
          height,
          generatedAt: Date.now(),
        },
      };

      console.log('[ChartGenerationProvider] Chart generated successfully');
      return attachment;
    } catch (error) {
      console.error('[ChartGenerationProvider] Generation failed:', error);
      throw new Error(`Failed to generate chart: ${error.message}`);
    }
  }

  /**
   * Generate a bar chart
   * @param {Object} data - Chart data
   * @returns {Promise<Object>} Generated chart attachment
   */
  async generateBarChart(data) {
    const config = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: data.label || 'Data',
          data: data.values,
          backgroundColor: data.backgroundColor || 'rgba(54, 162, 235, 0.8)',
          borderColor: data.borderColor || 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        plugins: {
          title: {
            display: !!data.title,
            text: data.title || '',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    return this.generateChart(config, data.options);
  }

  /**
   * Generate a line chart
   * @param {Object} data - Chart data
   * @returns {Promise<Object>} Generated chart attachment
   */
  async generateLineChart(data) {
    const config = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: data.label || 'Data',
          data: data.values,
          fill: data.fill !== false,
          borderColor: data.borderColor || 'rgb(75, 192, 192)',
          backgroundColor: data.backgroundColor || 'rgba(75, 192, 192, 0.2)',
          tension: data.tension || 0.1,
        }],
      },
      options: {
        plugins: {
          title: {
            display: !!data.title,
            text: data.title || '',
          },
        },
        scales: {
          y: {
            beginAtZero: data.beginAtZero !== false,
          },
        },
      },
    };

    return this.generateChart(config, data.options);
  }

  /**
   * Generate a pie chart
   * @param {Object} data - Chart data
   * @returns {Promise<Object>} Generated chart attachment
   */
  async generatePieChart(data) {
    const config = {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: data.backgroundColor || [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
        }],
      },
      options: {
        plugins: {
          title: {
            display: !!data.title,
            text: data.title || '',
          },
        },
      },
    };

    return this.generateChart(config, data.options);
  }

  /**
   * Convert Blob to base64 data URL
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get supported chart types
   */
  getSupportedChartTypes() {
    return ['bar', 'line', 'pie', 'doughnut', 'radar', 'scatter', 'bubble'];
  }
}

export default ChartGenerationProvider;
