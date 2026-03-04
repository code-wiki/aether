import React, { useState, useEffect } from 'react';
import { HiCog6Tooth, HiPlay, HiTrash, HiExclamationTriangle } from 'react-icons/hi2';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowExecution from './WorkflowExecution';
import { useAgent } from '../../context/AgentContext';
import { useSettings } from '../../context/SettingsContext';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import AINode from './NodeTypes/AINode';
import AgentNode from './NodeTypes/AgentNode';
import ToolNode from './NodeTypes/ToolNode';
import InputNode from './NodeTypes/InputNode';
import OutputNode from './NodeTypes/OutputNode';

const nodeTypes = {
  ai: AINode,
  agent: AgentNode,
  tool: ToolNode,
  input: InputNode,
  output: OutputNode,
};

/**
 * WorkflowsView - Main content view for workflows section
 * Shows detail panel for selected workflow (list is in secondary sidebar)
 */
function WorkflowsView({ isMobile, isTablet, selectedWorkflow, onWorkflowChange, triggerNew }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const { workflowEngine, addExecution } = useAgent();
  const { settings } = useSettings();

  // Watch for triggerNew changes to open builder for new workflow
  useEffect(() => {
    if (triggerNew > 0) {
      setEditingWorkflow(null);
      setShowBuilder(true);
    }
  }, [triggerNew]);

  const handleEdit = (workflow, e) => {
    e?.stopPropagation();
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleDeleteClick = (workflowId) => {
    setDeleteConfirm(workflowId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    // Delete from localStorage
    const stored = localStorage.getItem('aether_workflows');
    if (stored) {
      try {
        const workflows = JSON.parse(stored);
        const updated = workflows.filter(w => w.id !== deleteConfirm);
        localStorage.setItem('aether_workflows', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Failed to delete workflow:', e);
      }
    }

    if (selectedWorkflow?.id === deleteConfirm) {
      onWorkflowChange?.(null);
    }

    setDeleteConfirm(null);
  };

  const handleRun = (workflow, e) => {
    e?.stopPropagation();
    setRunningWorkflow(true);
  };

  const handleExecute = async (inputs, onProgress) => {
    // Register workflow with engine
    workflowEngine.registerWorkflow(selectedWorkflow);

    // Execute workflow with settings
    const result = await workflowEngine.execute(selectedWorkflow, inputs, onProgress, settings);

    // Add execution to history with workflow metadata
    const executionRecord = {
      ...result,
      workflowId: selectedWorkflow.id,
      workflowName: selectedWorkflow.name,
    };
    addExecution(executionRecord);

    // Update lastRun timestamp in localStorage
    const stored = localStorage.getItem('aether_workflows');
    if (stored) {
      try {
        const workflows = JSON.parse(stored);
        const updated = workflows.map(w =>
          w.id === selectedWorkflow.id ? { ...w, lastRun: Date.now() } : w
        );
        localStorage.setItem('aether_workflows', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Failed to update lastRun:', e);
      }
    }

    return result;
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
        {selectedWorkflow && runningWorkflow ? (
          /* Workflow Execution View */
          <WorkflowExecution
            workflow={selectedWorkflow}
            onBack={() => setRunningWorkflow(false)}
            onExecute={handleExecute}
          />
        ) : selectedWorkflow ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <HiCog6Tooth className="w-8 h-8 text-white" />
                </div>

                {/* Header Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {selectedWorkflow.name}
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {selectedWorkflow.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleRun(selectedWorkflow, e)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <HiPlay className="w-4 h-4" />
                      Run
                    </button>
                    <button
                      onClick={(e) => handleEdit(selectedWorkflow, e)}
                      className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <HiCog6Tooth className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedWorkflow.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Visual Workflow Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      Workflow Visualization
                    </h3>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-full">
                      {selectedWorkflow.nodes?.length || 0} nodes, {selectedWorkflow.edges?.length || 0} connections
                    </span>
                  </div>
                  <div className="h-[32rem] border-2 border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 shadow-lg">
                    <ReactFlow
                      nodes={selectedWorkflow.nodes || []}
                      edges={selectedWorkflow.edges || []}
                      nodeTypes={nodeTypes}
                      fitView
                      nodesDraggable={false}
                      nodesConnectable={false}
                      elementsSelectable={false}
                      zoomOnScroll={false}
                      panOnDrag={false}
                    >
                      <Background />
                      <Controls showInteractive={false} />
                    </ReactFlow>
                  </div>
                </div>

                {/* Workflow Information Grid */}
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Workflow Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
                      <div className="text-xs font-medium text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-2">
                        Nodes
                      </div>
                      <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                        {selectedWorkflow.nodes?.length || 0}
                      </div>
                      <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                        Processing steps
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
                      <div className="text-xs font-medium text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-2">
                        Created
                      </div>
                      <div className="text-lg font-bold text-cyan-900 dark:text-cyan-100">
                        {new Date(selectedWorkflow.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                        {Math.floor((Date.now() - selectedWorkflow.createdAt) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                        Last Run
                      </div>
                      <div className="text-lg font-bold text-green-900 dark:text-green-100">
                        {selectedWorkflow.lastRun
                          ? new Date(selectedWorkflow.lastRun).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Never'}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {selectedWorkflow.lastRun
                          ? `${Math.floor((Date.now() - selectedWorkflow.lastRun) / (1000 * 60 * 60 * 24))} days ago`
                          : 'Not executed yet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        Ready to execute this workflow?
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Run the workflow to see results, or edit to customize the configuration.
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleRun(selectedWorkflow, e)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-green-500/30"
                    >
                      <HiPlay className="w-4 h-4" />
                      Run Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
                <HiCog6Tooth className="w-16 h-16 text-cyan-500" />
              </div>

              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                No Workflow Selected
              </h3>

              <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                Select a workflow from the sidebar to view its configuration, visual preview, and execution details.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
                <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
                  <div className="w-10 h-10 mb-3 rounded-lg bg-cyan-500 flex items-center justify-center">
                    <HiPlay className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Run Workflows
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Execute multi-step AI workflows with custom inputs
                  </p>
                </div>

                <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
                  <div className="w-10 h-10 mb-3 rounded-lg bg-cyan-500 flex items-center justify-center">
                    <HiCog6Tooth className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Visual Builder
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Create workflows with a drag-and-drop interface
                  </p>
                </div>

                <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
                  <div className="w-10 h-10 mb-3 rounded-lg bg-cyan-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Track History
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Monitor execution status and view outputs
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">Pro Tip:</span> Use the workflow builder to create custom AI automations by connecting agents, tools, and transformations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Builder Modal */}
      {showBuilder && (
        <WorkflowCanvas
          onClose={() => {
            setShowBuilder(false);
            setEditingWorkflow(null);
          }}
          initialWorkflow={editingWorkflow}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <HiExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Delete Workflow
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to delete this workflow? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WorkflowsView;
