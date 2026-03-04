import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import workflowEngine from '../services/agents/WorkflowEngine.js';
import ImageGenerationTool from '../services/agents/builtin-tools/ImageGenerationTool.js';
import ChartGenerationTool from '../services/agents/builtin-tools/ChartGenerationTool.js';
import { useSettings } from './SettingsContext.jsx';

// Import workflow templates
import blogPostCreator from '../services/agents/templates/blog-post-creator.json';
import dataAnalyzer from '../services/agents/templates/data-analyzer.json';

const AgentContext = createContext();

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within AgentProvider');
  }
  return context;
}

export function AgentProvider({ children }) {
  const { settings } = useSettings();
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [activeExecution, setActiveExecution] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  /**
   * Initialize workflow engine with tools and templates
   */
  useEffect(() => {
    // Always register image generation tool (will show helpful error if API key missing)
    const imageGenTool = new ImageGenerationTool(settings.apiKeys?.openai);
    workflowEngine.registerTool(imageGenTool);

    // Register chart generation tool
    const chartGenTool = new ChartGenerationTool();
    workflowEngine.registerTool(chartGenTool);

    // Register workflow templates
    workflowEngine.registerWorkflow(blogPostCreator);
    workflowEngine.registerWorkflow(dataAnalyzer);

    // Load registered workflows into state
    setWorkflows(workflowEngine.getRegisteredWorkflows());

    console.log('[AgentContext] Workflow engine initialized');
    console.log('[AgentContext] Registered tools:', workflowEngine.getRegisteredTools().map(t => t.name));
  }, [settings.apiKeys]);

  /**
   * Execute a workflow
   * @param {string} workflowId - Workflow ID to execute
   * @param {Object} inputs - Input values
   * @param {string} conversationId - Optional conversation ID to link execution
   * @returns {Promise<Object>} Execution result
   */
  const runWorkflow = useCallback(async (workflowId, inputs, conversationId = null) => {
    try {
      setIsExecuting(true);

      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      console.log(`[AgentContext] Starting workflow: ${workflow.name}`);

      const execution = await workflowEngine.execute(
        workflow,
        inputs,
        (progress) => {
          // Update active execution with progress
          setActiveExecution({
            ...progress,
            conversationId,
            workflowName: workflow.name,
          });
        },
        settings // Pass settings to workflow engine
      );

      // Add conversation ID to execution
      execution.conversationId = conversationId;
      execution.workflowName = workflow.name;

      // Store execution
      setExecutions(prev => [execution, ...prev]);
      setActiveExecution(null);
      setIsExecuting(false);

      console.log(`[AgentContext] Workflow completed: ${workflow.name}`);
      return execution;

    } catch (error) {
      console.error('[AgentContext] Workflow execution failed:', error);
      setIsExecuting(false);
      setActiveExecution(null);
      throw error;
    }
  }, [workflows]);

  /**
   * Get workflow by ID
   * @param {string} id - Workflow ID
   * @returns {Object|null} Workflow definition
   */
  const getWorkflow = useCallback((id) => {
    return workflows.find(w => w.id === id) || null;
  }, [workflows]);

  /**
   * Get executions for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Array} Executions
   */
  const getExecutionsByConversation = useCallback((conversationId) => {
    return executions.filter(e => e.conversationId === conversationId);
  }, [executions]);

  /**
   * Get execution by ID
   * @param {string} id - Execution ID
   * @returns {Object|null} Execution
   */
  const getExecution = useCallback((id) => {
    return executions.find(e => e.id === id) || null;
  }, [executions]);

  /**
   * Add an execution to history
   * @param {Object} execution - Execution record to add
   */
  const addExecution = useCallback((execution) => {
    setExecutions(prev => [execution, ...prev]);
  }, []);

  /**
   * Clear all executions
   */
  const clearExecutions = useCallback(() => {
    setExecutions([]);
    setActiveExecution(null);
  }, []);

  /**
   * Get available tools
   */
  const getTools = useCallback(() => {
    return workflowEngine.getRegisteredTools();
  }, []);

  /**
   * Validate a workflow definition
   * @param {Object} workflow - Workflow to validate
   * @returns {Object} Validation result
   */
  const validateWorkflow = useCallback((workflow) => {
    return workflowEngine.validateWorkflow(workflow);
  }, []);

  const value = {
    // State
    workflows,
    executions,
    activeExecution,
    isExecuting,

    // Actions
    runWorkflow,
    getWorkflow,
    getExecutionsByConversation,
    getExecution,
    addExecution,
    clearExecutions,
    getTools,
    validateWorkflow,

    // Engine reference (for advanced usage)
    workflowEngine,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

export default AgentContext;
