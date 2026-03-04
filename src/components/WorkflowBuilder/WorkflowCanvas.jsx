import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Save, Play, FileText, Sparkles } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useConversation } from '../../context/ConversationContext';
import { useSettings } from '../../context/SettingsContext';
import AINode from './NodeTypes/AINode';
import AgentNode from './NodeTypes/AgentNode';
import ToolNode from './NodeTypes/ToolNode';
import InputNode from './NodeTypes/InputNode';
import OutputNode from './NodeTypes/OutputNode';
import NodePalette from './NodePalette';
import NodeConfigPanel from './NodeConfigPanel';
import WorkflowLibrary from './WorkflowLibrary';
import { cn } from '../../lib/utils';
import aiService from '../../services/ai/AIService';

const nodeTypes = {
  ai: AINode,
  agent: AgentNode,
  tool: ToolNode,
  input: InputNode,
  output: OutputNode,
};

/**
 * WorkflowCanvas - Visual workflow builder using React Flow
 */
function WorkflowCanvas({ onClose, initialWorkflow }) {
  const { runWorkflow, workflowEngine } = useAgent();
  const { activeConversation } = useConversation();
  const { settings } = useSettings();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow');
  const [workflowId, setWorkflowId] = useState(initialWorkflow?.id || null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add node from palette
  const addNode = useCallback(
    (type, label, extraData = {}) => {
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: 250, y: 100 + nodes.length * 100 },
        data: {
          label,
          ...(type === 'ai' && {
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            prompt: '',
          }),
          ...(type === 'agent' && {
            agentId: null,
            agentName: '',
            agentModel: '',
            instruction: '',
          }),
          ...(type === 'tool' && {
            tool: 'image-generation',
            parameters: {},
          }),
          ...(type === 'input' && {
            name: 'input',
            type: 'text',
          }),
          ...extraData,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  // Save workflow
  const saveWorkflow = useCallback(() => {
    if (!workflowName.trim()) {
      // Silently return if no name - user will see the workflow name field is empty
      return;
    }

    const workflow = {
      id: workflowId || `workflow-${Date.now()}`,
      name: workflowName,
      description: `${nodes.length} nodes workflow`,
      version: '1.0.0',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
      inputs: nodes.filter((n) => n.type === 'input').map((n) => ({
        name: n.data.name,
        type: n.data.type || 'text',
      })),
      outputs: nodes.filter((n) => n.type === 'output').map((n) => ({
        name: n.data.name || 'result',
      })),
      createdAt: workflowId ? (initialWorkflow?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      tags: [],
      pinned: initialWorkflow?.pinned || false,
    };

    // Save to localStorage
    const stored = localStorage.getItem('aether_workflows');
    let workflows = stored ? JSON.parse(stored) : [];

    if (workflowId) {
      // Update existing
      workflows = workflows.map(w => w.id === workflowId ? workflow : w);
    } else {
      // Create new
      workflows.unshift(workflow);
      setWorkflowId(workflow.id);
    }

    localStorage.setItem('aether_workflows', JSON.stringify(workflows));
    window.dispatchEvent(new Event('storage'));

    // Also register with engine
    workflowEngine?.registerWorkflow(workflow);

    // Close the canvas - workflow saved successfully
    onClose();
  }, [workflowName, workflowId, nodes, edges, workflowEngine, initialWorkflow, onClose]);

  // Run workflow
  const runCurrentWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Cannot run workflow: No nodes added.\n\nPlease add at least one node from the palette.');
      return;
    }

    if (!workflowEngine) {
      alert('Workflow engine not initialized.\n\nPlease refresh the page and try again.');
      return;
    }

    setIsRunning(true);

    try {
      console.log('[WorkflowCanvas] Starting workflow execution...');

      // Build workflow definition
      const workflow = {
        id: `workflow-temp-${Date.now()}`,
        name: workflowName,
        description: 'Temporary workflow',
        version: '1.0.0',
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
        inputs: nodes.filter((n) => n.type === 'input').map((n) => ({
          name: n.data.name,
          type: n.data.type || 'text',
        })),
        outputs: nodes.filter((n) => n.type === 'output').map((n) => ({
          name: n.data.name || 'result',
        })),
      };

      console.log('[WorkflowCanvas] Workflow definition:', workflow);

      // Get inputs from user (TODO: Create proper input modal)
      const inputs = {};
      const inputNodes = nodes.filter((n) => n.type === 'input');

      // For now, use default values or skip inputs
      for (const node of inputNodes) {
        inputs[node.data.name] = node.data.type === 'text' ? 'sample text' : '';
      }

      console.log('[WorkflowCanvas] Inputs:', inputs);

      // Register workflow with engine first
      workflowEngine.registerWorkflow(workflow);

      // Execute workflow directly using the engine
      const execution = await workflowEngine.execute(
        workflow,
        inputs,
        (progress) => {
          console.log('[WorkflowCanvas] Progress:', progress);
        }
      );

      console.log('[WorkflowCanvas] Execution completed:', execution);

      // Show success alert with outputs
      const outputText = Object.entries(execution.outputs)
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
        .join('\n');

      alert(`✅ Workflow completed successfully!\n\nOutputs:\n${outputText}\n\nCheck the console for detailed results.`);

    } catch (error) {
      console.error('[WorkflowCanvas] Execution failed:', error);
      alert(`❌ Workflow failed!\n\nError: ${error.message}\n\nCheck the console for details.`);
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, workflowName, workflowEngine]);

  // Load template
  const loadTemplate = useCallback(
    (template) => {
      setWorkflowName(template.name);
      setNodes(
        template.nodes.map((n) => ({
          ...n,
          position: n.position || { x: 250, y: 100 },
        }))
      );
      setEdges(template.edges || []);
      setShowLibrary(false);
    },
    [setNodes, setEdges]
  );

  // Generate workflow with AI
  const generateWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      // Initialize Claude provider only if not already active
      if (!aiService.activeProvider || aiService.activeProviderName !== 'claude') {
        await aiService.initializeProvider('claude', {
          projectId: settings.gcp.projectId,
          location: settings.gcp.location,
        });
      }

      const messages = [
        {
          role: 'system',
          content: `You are an AI workflow designer. Generate ONLY valid JSON with no additional text.

CRITICAL: Your entire response must be ONLY the JSON object. Do not include any explanations, markdown formatting, or text before/after the JSON.

Required JSON structure:
{
  "name": "Workflow Name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "unique-id",
      "type": "input|agent|ai|tool|output",
      "position": {"x": 100, "y": 100},
      "data": {}
    }
  ],
  "edges": [
    {"id": "edge-id", "source": "source-node-id", "target": "target-node-id"}
  ]
}

Node data requirements:
- input: {"label": "Input Name", "name": "variableName", "type": "text"}
- agent: {"label": "Agent Name", "agentId": null, "agentName": "", "instruction": ""}
- ai: {"label": "AI Model", "provider": "claude", "model": "claude-sonnet-4-5@20250929", "prompt": "{{input}}", "temperature": 0.7}
- tool: {"label": "Tool Name", "tool": "image-generation", "parameters": {}}
- output: {"label": "Output", "name": "result"}

Position nodes left to right with 200px horizontal spacing starting at x:50, y:100.`
        },
        { role: 'user', content: `Create a workflow for: ${aiPrompt}` }
      ];

      const response = await aiService.sendMessage(messages, {
        model: 'claude-sonnet-4-5@20250929',
      });

      // Extract JSON from response
      // Try to parse the response directly first
      let workflowData;
      try {
        workflowData = JSON.parse(response.trim());
      } catch (e) {
        // If direct parsing fails, try to extract JSON from markdown code blocks or text
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || response.match(/(\{[\s\S]*\})/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response. Please try again.');
        }
        workflowData = JSON.parse(jsonMatch[1]);
      }

      // Load the generated workflow
      setWorkflowName(workflowData.name || 'AI Generated Workflow');
      setNodes(workflowData.nodes || []);
      setEdges(workflowData.edges || []);
      setShowAIGenerator(false);
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
      // Show error in the UI instead of alert
      setAiPrompt(`Error: ${error.message}\n\nPlease try again with a different description.`);
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, setNodes, setEdges, settings]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm">
      <div className="h-screen w-screen flex flex-col bg-neutral-0 dark:bg-neutral-1000">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-accent-500 rounded px-2"
              placeholder="Workflow Name"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIGenerator(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/30"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>

            <button
              onClick={() => setShowLibrary(true)}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>

            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={runCurrentWorkflow}
              disabled={isRunning}
              className={cn(
                'px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg flex items-center gap-2 transition-colors',
                isRunning && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex">
          {/* Node palette */}
          <NodePalette onAddNode={addNode} />

          {/* Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-neutral-50 dark:bg-neutral-950"
            >
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'ai':
                      return '#8b5cf6';
                    case 'tool':
                      return '#06b6d4';
                    case 'input':
                      return '#10b981';
                    case 'output':
                      return '#f59e0b';
                    default:
                      return '#6b7280';
                  }
                }}
              />
            </ReactFlow>
          </div>

          {/* Config panel */}
          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onUpdate={(data) => updateNodeData(selectedNode.id, data)}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>

      {/* Template library modal */}
      {showLibrary && (
        <WorkflowLibrary onLoad={loadTemplate} onClose={() => setShowLibrary(false)} />
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Generate Workflow with AI
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Describe what you want your workflow to do, and Claude will design it for you.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Workflow Description
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Example: Create a blog post from a topic - research the topic, create an outline, write sections, and generate a cover image"
                    disabled={isGenerating}
                  />
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    💡 Be specific about inputs, steps, and outputs
                  </p>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Examples:
                  </h4>
                  <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• "Analyze an uploaded CSV file and create charts"</li>
                    <li>• "Research a topic, summarize findings, and create a presentation"</li>
                    <li>• "Generate product descriptions from images"</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAIGenerator(false);
                  setAiPrompt('');
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={generateWithAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowCanvas;
