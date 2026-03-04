/**
 * ToolsStorage - Manages MCP servers and tool configurations in localStorage
 */

const TOOLS_STORAGE_KEY = 'aether_tools';
const MCP_SERVERS_STORAGE_KEY = 'aether_mcp_servers';

class ToolsStorage {
  /**
   * Get all tools (built-in + MCP servers)
   */
  getAllTools() {
    const builtInTools = this.getBuiltInTools();
    const mcpServers = this.getMCPServers();

    return [...builtInTools, ...mcpServers];
  }

  /**
   * Get built-in tools
   */
  getBuiltInTools() {
    return [
      {
        id: 'image-generation',
        name: 'Image Generation',
        description: 'Generate images using DALL-E 3',
        type: 'Built-in',
        provider: 'OpenAI',
        status: 'active',
        icon: '🎨',
        color: 'purple',
        pinned: false,
        createdAt: Date.now(),
        category: 'Generation',
      },
      {
        id: 'chart-generation',
        name: 'Chart Generation',
        description: 'Create charts and visualizations',
        type: 'Built-in',
        provider: 'QuickChart',
        status: 'active',
        icon: '📊',
        color: 'cyan',
        pinned: false,
        createdAt: Date.now(),
        category: 'Visualization',
      },
      {
        id: 'web-search-builtin',
        name: 'Web Search (Basic)',
        description: 'Simple web search functionality',
        type: 'Built-in',
        provider: 'Built-in',
        status: 'active',
        icon: '🔍',
        color: 'blue',
        pinned: false,
        createdAt: Date.now(),
        category: 'Research',
      },
    ];
  }

  /**
   * Get all MCP servers
   */
  getMCPServers() {
    try {
      const stored = localStorage.getItem(MCP_SERVERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
      return [];
    }
  }

  /**
   * Get a single tool by ID
   */
  getTool(id) {
    const tools = this.getAllTools();
    return tools.find(tool => tool.id === id);
  }

  /**
   * Save an MCP server
   */
  saveMCPServer(server) {
    const servers = this.getMCPServers();

    const serverData = {
      ...server,
      id: server.id || `mcp-${Date.now()}`,
      type: 'MCP Server',
      status: server.status || 'installed',
      installedAt: server.installedAt || Date.now(),
      updatedAt: Date.now(),
    };

    // Check if already exists
    const existingIndex = servers.findIndex(s => s.id === serverData.id);

    if (existingIndex >= 0) {
      servers[existingIndex] = serverData;
    } else {
      servers.push(serverData);
    }

    localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(servers));
    window.dispatchEvent(new Event('storage'));

    return serverData;
  }

  /**
   * Update MCP server
   */
  updateMCPServer(id, updates) {
    const servers = this.getMCPServers();
    const index = servers.findIndex(s => s.id === id);

    if (index >= 0) {
      servers[index] = {
        ...servers[index],
        ...updates,
        updatedAt: Date.now(),
      };

      localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(servers));
      window.dispatchEvent(new Event('storage'));
      return servers[index];
    }

    return null;
  }

  /**
   * Delete an MCP server
   */
  deleteMCPServer(id) {
    const servers = this.getMCPServers();
    const filtered = servers.filter(s => s.id !== id);

    localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));
  }

  /**
   * Toggle MCP server status (active/inactive)
   */
  toggleServerStatus(id) {
    const server = this.getTool(id);

    if (server && server.type === 'MCP Server') {
      const newStatus = server.status === 'active' ? 'inactive' : 'active';
      return this.updateMCPServer(id, { status: newStatus });
    }

    return null;
  }

  /**
   * Validate server configuration
   */
  validateServerConfig(server, config) {
    const errors = [];

    if (!server.configFields) return { valid: true, errors: [] };

    server.configFields.forEach(field => {
      if (field.required && !config[field.name]) {
        errors.push(`${field.label} is required`);
      }

      // Type validation
      if (config[field.name] !== undefined) {
        if (field.type === 'number' && isNaN(config[field.name])) {
          errors.push(`${field.label} must be a number`);
        }

        if (field.type === 'array' && !Array.isArray(config[field.name])) {
          errors.push(`${field.label} must be an array`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test MCP server connection
   */
  async testConnection(server) {
    // Mock test - in production, would actually try to connect
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Connection successful',
          capabilities: server.capabilities || [],
        });
      }, 1000);
    });
  }

  /**
   * Get server statistics
   */
  getServerStats(id) {
    // Mock stats - in production, would track actual usage
    return {
      calls: Math.floor(Math.random() * 1000),
      lastUsed: Date.now() - Math.floor(Math.random() * 86400000),
      errors: Math.floor(Math.random() * 10),
      avgResponseTime: Math.floor(Math.random() * 1000),
    };
  }

  /**
   * Pin/unpin a tool
   */
  togglePin(id) {
    const tool = this.getTool(id);

    if (tool && tool.type === 'MCP Server') {
      const server = this.getMCPServers().find(s => s.id === id);
      if (server) {
        return this.updateMCPServer(id, { pinned: !server.pinned });
      }
    }

    return null;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category) {
    const tools = this.getAllTools();
    return tools.filter(tool => tool.category === category);
  }

  /**
   * Get active MCP servers
   */
  getActiveServers() {
    const servers = this.getMCPServers();
    return servers.filter(s => s.status === 'active');
  }

  /**
   * Export MCP server configuration
   */
  exportServerConfig(id) {
    const server = this.getTool(id);

    if (server && server.type === 'MCP Server') {
      // Remove sensitive data
      const exportData = {
        ...server,
        config: {
          ...server.config,
          // Mask sensitive fields
          ...(server.configFields || []).reduce((acc, field) => {
            if (field.type === 'password' && server.config?.[field.name]) {
              acc[field.name] = '***REDACTED***';
            }
            return acc;
          }, {}),
        },
      };

      return JSON.stringify(exportData, null, 2);
    }

    return null;
  }

  /**
   * Import MCP server configuration
   */
  importServerConfig(configJson) {
    try {
      const config = JSON.parse(configJson);

      // Validate structure
      if (!config.id || !config.name) {
        throw new Error('Invalid configuration format');
      }

      return this.saveMCPServer(config);
    } catch (error) {
      console.error('Failed to import server config:', error);
      throw error;
    }
  }
}

export default new ToolsStorage();
