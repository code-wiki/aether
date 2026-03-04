import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { HiPlus, HiChevronLeft } from 'react-icons/hi2';
import ChatPanel from './panels/ChatPanel';
import AgentsPanel from './panels/AgentsPanel';
import WorkflowsPanel from './panels/WorkflowsPanel';
import KnowledgePanel from './panels/KnowledgePanel';
import ToolsPanel from './panels/ToolsPanel';

/**
 * SecondarySidebar - Contextual panel (Sidebar 2)
 * Shows content based on primary sidebar selection
 * Collapses to icons when needed
 */
function SecondarySidebar({
  activeSection,
  isCollapsed,
  onToggleCollapse,
  onCreateNew,
  onOpenAgent,
  onOpenWorkflow,
  onOpenKnowledge,
  onOpenMCP,
  selectedAgent,
  selectedWorkflow,
  selectedKnowledge,
  selectedTool
}) {
  const panelConfig = {
    chat: {
      title: 'Conversations',
      component: ChatPanel,
      createLabel: 'New Chat',
      color: 'pink',
    },
    agents: {
      title: 'AI Agents',
      component: AgentsPanel,
      createLabel: 'Create Agent',
      color: 'purple',
    },
    workflows: {
      title: 'Workflows',
      component: WorkflowsPanel,
      createLabel: 'Create Workflow',
      color: 'orange',
    },
    knowledge: {
      title: 'Knowledge Base',
      component: KnowledgePanel,
      createLabel: 'Add Documents',
      color: 'yellow',
    },
    tools: {
      title: 'Tools & MCP',
      component: ToolsPanel,
      createLabel: 'Add Tool',
      color: 'blue',
    },
  };

  const config = panelConfig[activeSection];
  const PanelComponent = config?.component;

  // Color mapping - Logo-inspired gradients
  const colorClasses = {
    pink: 'from-pink-500 to-pink-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ width: isCollapsed ? 56 : 260 }}
        animate={{ width: isCollapsed ? 56 : 260 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={cn(
          'h-full bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800/80 flex flex-col',
          isCollapsed ? 'items-center' : ''
        )}
      >
        {/* macOS Window Chrome Spacing */}
        <div className="h-12" style={{ WebkitAppRegion: 'drag' }} />

        {/* Header */}
        <div className={cn(
          'border-b border-neutral-200 dark:border-neutral-800/80',
          isCollapsed ? 'p-2' : 'px-4 py-3'
        )}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {config?.title}
              </h2>
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
              >
                <HiChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => onCreateNew(activeSection)}
              className={cn(
                'w-full px-3 py-2 rounded-md text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-150 hover:opacity-90',
                `bg-gradient-to-r ${colorClasses[config?.color]}`
              )}
            >
              <HiPlus className="w-4 h-4" />
              {config?.createLabel}
            </button>
          )}

          {isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <HiPlus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {PanelComponent && (
            <PanelComponent
              isCollapsed={isCollapsed}
              activeColor={config?.color}
              onOpenItem={{
                agents: onOpenAgent,
                workflows: onOpenWorkflow,
                knowledge: onOpenKnowledge,
                tools: onOpenMCP
              }[activeSection]}
              selectedAgent={selectedAgent}
              selectedWorkflow={selectedWorkflow}
              selectedKnowledge={selectedKnowledge}
              selectedTool={selectedTool}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SecondarySidebar;
