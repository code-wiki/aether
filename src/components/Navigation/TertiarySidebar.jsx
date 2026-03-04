import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { HiChevronRight, HiChevronLeft } from 'react-icons/hi2';
import ExecutionHistoryPanel from './panels/ExecutionHistoryPanel';
import AgentSessionsPanel from './panels/AgentSessionsPanel';

/**
 * TertiarySidebar - History/Sessions panel (Sidebar 3)
 * Shows workflow execution history or agent chat sessions
 * Changes based on active section
 */
function TertiarySidebar({
  type = 'workflow', // 'workflow' or 'agent'
  selectedWorkflow,
  selectedAgent,
  executions,
  sessions,
  onExecutionClick,
  onSessionClick,
  isCollapsed,
  onToggleCollapse,
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ width: isCollapsed ? 60 : 280 }}
        animate={{ width: isCollapsed ? 60 : 280 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'h-full border-l border-neutral-200 dark:border-neutral-800',
          'bg-white dark:bg-neutral-950',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
          {!isCollapsed && (
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              History
            </h3>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors ml-auto"
            title={isCollapsed ? 'Expand history' : 'Collapse history'}
          >
            {isCollapsed ? (
              <HiChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <HiChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>

        {/* Panel Content - Changes based on type */}
        {type === 'workflow' ? (
          <ExecutionHistoryPanel
            selectedWorkflow={selectedWorkflow}
            executions={executions}
            onExecutionClick={onExecutionClick}
            isCollapsed={isCollapsed}
          />
        ) : (
          <AgentSessionsPanel
            selectedAgent={selectedAgent}
            sessions={sessions}
            onSessionClick={onSessionClick}
            isCollapsed={isCollapsed}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default TertiarySidebar;
