import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { HiBeaker, HiSparkles, HiMagnifyingGlass, HiXMark, HiStar } from 'react-icons/hi2';

function WorkflowsPanel({ isCollapsed, activeColor = 'orange', onOpenItem, selectedWorkflow }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'today', 'pinned', 'all'

  // Load workflows from localStorage with default examples
  const [workflows, setWorkflows] = useState(() => {
    const stored = localStorage.getItem('aether_workflows');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse workflows:', e);
      }
    }

    // Return default example workflows if none exist
    const defaultWorkflows = [
      {
        id: 'example-1',
        name: 'Blog Post Creator',
        description: 'Research topic → Create outline → Write sections → Generate cover image',
        nodes: [
          { id: 'input-1', type: 'input', position: { x: 50, y: 100 }, data: { label: 'Topic Input', name: 'topic', type: 'text' } },
          { id: 'ai-1', type: 'ai', position: { x: 300, y: 100 }, data: { label: 'Research', provider: 'gemini', model: 'gemini-1.5-flash', prompt: 'Research this topic: {{input.topic}}' } },
          { id: 'ai-2', type: 'ai', position: { x: 550, y: 100 }, data: { label: 'Create Outline', provider: 'claude', model: 'claude-sonnet-4-5', prompt: 'Create an outline based on: {{ai-1.output}}' } },
          { id: 'tool-1', type: 'tool', position: { x: 300, y: 300 }, data: { label: 'Generate Cover', tool: 'image-generation', parameters: { prompt: 'Blog cover image for: {{input.topic}}' } } },
          { id: 'output-1', type: 'output', position: { x: 800, y: 200 }, data: { label: 'Final Post', name: 'result' } },
        ],
        edges: [],
        pinned: false,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'example-2',
        name: 'Data Analyzer',
        description: 'Parse CSV → Analyze trends → Generate insights → Create charts',
        nodes: [
          { id: 'input-1', type: 'input', position: { x: 50, y: 100 }, data: { label: 'CSV Data', name: 'csvData', type: 'text' } },
          { id: 'ai-1', type: 'ai', position: { x: 300, y: 100 }, data: { label: 'Analyze Data', provider: 'claude', model: 'claude-sonnet-4-5', prompt: 'Analyze this CSV data: {{input.csvData}}' } },
          { id: 'tool-1', type: 'tool', position: { x: 550, y: 100 }, data: { label: 'Create Chart', tool: 'chart-generation', parameters: {} } },
          { id: 'output-1', type: 'output', position: { x: 800, y: 100 }, data: { label: 'Analysis Report', name: 'result' } },
        ],
        edges: [],
        pinned: false,
        createdAt: Date.now() - 172800000,
      },
    ];

    // Save default workflows to localStorage
    localStorage.setItem('aether_workflows', JSON.stringify(defaultWorkflows));
    return defaultWorkflows;
  });

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('aether_workflows');
      if (stored) {
        try {
          setWorkflows(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse workflows:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter workflows
  const getFilteredWorkflows = () => {
    let filtered = workflows;

    // Apply tab filter
    if (activeTab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(wf => wf.createdAt >= today);
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(wf => wf.pinned);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((wf) =>
        wf.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredWorkflows = getFilteredWorkflows();

  const togglePin = (workflowId, e) => {
    e.stopPropagation();
    const updated = workflows.map(wf =>
      wf.id === workflowId ? { ...wf, pinned: !wf.pinned } : wf
    );
    setWorkflows(updated);
    localStorage.setItem('aether_workflows', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        {workflows.slice(0, 5).map((workflow) => (
          <button
            key={workflow.id}
            onClick={() => onOpenItem?.(workflow)}
            className="w-10 h-10 rounded-lg mb-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
            title={workflow.name}
          >
            <HiBeaker className="w-5 h-5" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Search */}
      <div className="relative mb-3">
        <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workflows..."
          className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm placeholder:text-neutral-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          >
            <HiXMark className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'all'
              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'today'
              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('pinned')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'pinned'
              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Pinned
        </button>
      </div>

      {/* Workflows List */}
      <div className="space-y-1.5">
        {filteredWorkflows.map((workflow) => (
          <button
            key={workflow.id}
            onClick={() => onOpenItem?.(workflow)}
            className={cn(
              "w-full p-2.5 rounded-md transition-colors text-left group",
              selectedWorkflow?.id === workflow.id
                ? "bg-orange-50 dark:bg-orange-950/30 border-l-2 border-orange-500"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <HiBeaker className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                    {workflow.name}
                  </h3>
                  <button
                    onClick={(e) => togglePin(workflow.id, e)}
                    className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors flex-shrink-0 ml-1"
                    title={workflow.pinned ? 'Unpin' : 'Pin'}
                  >
                    <HiStar className={cn(
                      'w-3 h-3 transition-all',
                      workflow.pinned
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                    )} />
                  </button>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-1">
                  {workflow.description || 'No description'}
                </p>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <HiSparkles className="w-3 h-3" />
                  <span>{workflow.nodes?.length || 0} nodes</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <HiBeaker className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-0.5">
              {searchQuery ? 'No workflows found' : 'No workflows yet'}
            </p>
            <p className="text-xs text-neutral-500">
              {searchQuery ? 'Try a different search' : 'Create automated workflows'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowsPanel;
