/**
 * WorkflowEngine - Execute multi-step AI workflows
 * Supports sequential execution of nodes with variable substitution
 */
import { v4 as uuidv4 } from 'uuid';
import aiService from '../ai/AIService.js';

class WorkflowEngine {
  constructor() {
    this.tools = new Map();
    this.workflows = new Map();
  }

  /**
   * Register a tool for use in workflows
   * @param {Tool} tool - Tool instance
   */
  registerTool(tool) {
    this.tools.set(tool.name, tool);
    console.log(`[WorkflowEngine] Registered tool: ${tool.name}`);
  }

  /**
   * Register a workflow
   * @param {Object} workflow - Workflow definition
   */
  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, workflow);
    console.log(`[WorkflowEngine] Registered workflow: ${workflow.name}`);
  }

  /**
   * Execute a workflow
   * @param {Object} workflow - Workflow definition
   * @param {Object} inputs - Input values
   * @param {Function} onProgress - Progress callback
   * @param {Object} settings - Application settings (for provider config)
   * @returns {Promise<Object>} Execution result
   */
  async execute(workflow, inputs, onProgress, settings = null) {
    const execution = {
      id: uuidv4(),
      workflowId: workflow.id,
      status: 'running',
      inputs,
      outputs: {},
      nodeStates: {},
      startedAt: Date.now(),
    };

    // Store settings for use in node execution
    this.settings = settings;

    try {
      console.log(`[WorkflowEngine] Starting workflow: ${workflow.name}`);

      // Build execution context
      const context = { ...inputs };

      // Execute nodes in order (assuming nodes are already ordered)
      for (const node of workflow.nodes || []) {
        execution.nodeStates[node.id] = {
          nodeId: node.id,
          status: 'running',
          startedAt: Date.now(),
        };

        // Notify progress
        if (onProgress) {
          onProgress({
            ...execution,
            currentNode: node.id,
          });
        }

        try {
          const result = await this.executeNode(node, context);

          execution.nodeStates[node.id] = {
            ...execution.nodeStates[node.id],
            status: 'completed',
            result,
            completedAt: Date.now(),
          };

          // Store result in context
          context[node.id] = result;
          execution.outputs[node.id] = result;

        } catch (error) {
          execution.nodeStates[node.id] = {
            ...execution.nodeStates[node.id],
            status: 'failed',
            error: error.message,
            completedAt: Date.now(),
          };

          throw error;
        }
      }

      execution.status = 'completed';
      execution.completedAt = Date.now();

      console.log(`[WorkflowEngine] Workflow completed: ${workflow.name}`);
      return execution;

    } catch (error) {
      console.error(`[WorkflowEngine] Workflow failed:`, error);
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = Date.now();
      throw error;
    }
  }

  /**
   * Execute a single node
   * @param {Object} node - Node to execute
   * @param {Object} context - Execution context
   * @returns {Promise<any>} Node result
   */
  async executeNode(node, context) {
    console.log(`[WorkflowEngine] Executing node: ${node.id} (${node.type})`);

    switch (node.type) {
      case 'input':
        return this.executeInputNode(node, context);

      case 'ai':
        return await this.executeAINode(node, context);

      case 'agent':
        return await this.executeAgentNode(node, context);

      case 'tool':
        return await this.executeToolNode(node, context);

      case 'transform':
        return await this.executeTransformNode(node, context);

      case 'condition':
        return await this.executeConditionNode(node, context);

      case 'output':
        return this.executeOutputNode(node, context);

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  /**
   * Execute input node (returns input value)
   */
  executeInputNode(node, context) {
    const inputName = node.data?.name || node.id;
    return context[inputName];
  }

  /**
   * Execute AI node (calls AI model)
   */
  async executeAINode(node, context) {
    const { provider, model, prompt, temperature, maxTokens } = node.data;

    if (!prompt || !prompt.trim()) {
      throw new Error(`AI node ${node.id} has no prompt configured`);
    }

    // Render prompt template
    const renderedPrompt = this.renderTemplate(prompt, context);

    // Initialize provider only if not already active
    if (!aiService.activeProvider || aiService.activeProviderName !== provider) {
      // Get GCP config from settings (for Claude/Gemini)
      const config = this.getProviderConfig(provider);
      await aiService.initializeProvider(provider, config);
    }

    // Call AI
    const response = await aiService.sendMessage(
      [{ role: 'user', content: renderedPrompt }],
      {
        model,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 4096,
      }
    );

    return response;
  }

  /**
   * Execute agent node (runs a configured agent)
   */
  async executeAgentNode(node, context) {
    const { agentId, agentModel, instruction } = node.data;

    if (!agentId) {
      throw new Error(`Agent node ${node.id} has no agent selected`);
    }

    // Load agent from localStorage
    const stored = localStorage.getItem('aether_agents');
    if (!stored) {
      throw new Error('No agents found. Please create an agent first.');
    }

    const agents = JSON.parse(stored);
    const agent = agents.find(a => a.id === agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Render instruction template
    const renderedInstruction = instruction
      ? this.renderTemplate(instruction, context)
      : 'Execute the task with your configured skills';

    // Use the agent's model and system prompt
    const model = agentModel || agent.model || 'claude-sonnet-4-5@20250929';
    const systemPrompt = agent.systemPrompt || 'You are a helpful AI assistant.';

    // Initialize provider (assuming Claude for now)
    if (!aiService.activeProvider || aiService.activeProviderName !== 'claude') {
      const config = this.getProviderConfig('claude');
      await aiService.initializeProvider('claude', config);
    }

    // Call AI with agent's configuration
    const response = await aiService.sendMessage(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: renderedInstruction }
      ],
      {
        model,
        temperature: agent.temperature || 0.7,
      }
    );

    return response;
  }

  /**
   * Execute tool node (calls registered tool)
   */
  async executeToolNode(node, context) {
    const { tool: toolName, parameters } = node.data;

    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // Render parameter values
    const renderedParams = {};
    for (const [key, value] of Object.entries(parameters || {})) {
      if (typeof value === 'string') {
        renderedParams[key] = this.renderTemplate(value, context);
      } else {
        renderedParams[key] = value;
      }
    }

    // Execute tool
    return await tool.execute(renderedParams);
  }

  /**
   * Execute transform node (JavaScript transformation)
   */
  async executeTransformNode(node, context) {
    const { expression } = node.data;

    try {
      // Create a safe function with context variables
      const func = new Function(...Object.keys(context), `return ${expression};`);
      return func(...Object.values(context));
    } catch (error) {
      throw new Error(`Transform error: ${error.message}`);
    }
  }

  /**
   * Execute condition node (branching logic)
   */
  async executeConditionNode(node, context) {
    const { condition } = node.data;

    try {
      const func = new Function(...Object.keys(context), `return ${condition};`);
      const result = func(...Object.values(context));
      return !!result;
    } catch (error) {
      throw new Error(`Condition error: ${error.message}`);
    }
  }

  /**
   * Execute output node (returns final output)
   */
  executeOutputNode(node, context) {
    const { source } = node.data;
    return context[source];
  }

  /**
   * Render template with variable substitution
   * Supports {{variable}} and {{node.output}} syntax
   * @param {string} template - Template string
   * @param {Object} context - Variable context
   * @returns {string} Rendered string
   */
  renderTemplate(template, context) {
    if (!template) return '';

    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const path = variable.trim().split('.');
      let value = context;

      for (const key of path) {
        value = value?.[key];
      }

      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Validate workflow definition
   * @param {Object} workflow - Workflow to validate
   * @returns {Object} Validation result
   */
  validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.id) {
      errors.push('Workflow must have an ID');
    }

    if (!workflow.name) {
      errors.push('Workflow must have a name');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // Validate each node
    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(`Node at index ${index} missing ID`);
        }

        if (!node.type) {
          errors.push(`Node ${node.id} missing type`);
        }

        if (!node.data) {
          errors.push(`Node ${node.id} missing data`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get a tool by name
   * @param {string} name - Tool name
   * @returns {Tool|null} Tool instance or null
   */
  getTool(name) {
    return this.tools.get(name) || null;
  }

  /**
   * Get list of registered tools
   * @returns {Array} Tool metadata
   */
  getRegisteredTools() {
    return Array.from(this.tools.values()).map(tool => tool.getMetadata());
  }

  /**
   * Get list of registered workflows
   * @returns {Array} Workflows
   */
  getRegisteredWorkflows() {
    return Array.from(this.workflows.values());
  }

  /**
   * Get provider configuration from settings
   * @param {string} provider - Provider name
   * @returns {Object} Provider config
   */
  getProviderConfig(provider) {
    // Use settings passed during execute() call
    if (this.settings) {
      switch (provider) {
        case 'gemini':
        case 'claude':
          return {
            projectId: this.settings.gcp?.projectId,
            location: this.settings.gcp?.location || 'us-east5',
          };
        case 'openai':
          return {
            apiKey: this.settings.apiKeys?.openai,
          };
        default:
          return {};
      }
    }

    // Fallback: try to get from electron store
    if (window.electron?.settings) {
      const settings = window.electron.settings.get();

      switch (provider) {
        case 'gemini':
        case 'claude':
          return {
            projectId: settings?.gcp?.projectId,
            location: settings?.gcp?.location || 'us-east5',
          };
        case 'openai':
          return {
            apiKey: settings?.apiKeys?.openai,
          };
        default:
          return {};
      }
    }

    // Fallback: return empty config
    console.warn('[WorkflowEngine] Could not load provider config from settings');
    return {};
  }
}

// Create singleton instance
const workflowEngine = new WorkflowEngine();

export default workflowEngine;
