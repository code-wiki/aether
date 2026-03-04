import React, { useState, useEffect, lazy, Suspense } from 'react';
import { initializeSampleData } from '../services/storage/sampleData';

import PrimarySidebar from './Navigation/PrimarySidebar';
import SecondarySidebar from './Navigation/SecondarySidebar';
import TertiarySidebar from './Navigation/TertiarySidebar';
import ChatView from './Chat/ChatView';
import AgentsView from './Agents/AgentsView';
import WorkflowsView from './WorkflowBuilder/WorkflowsView';
import KnowledgeView from './Knowledge/KnowledgeView';
import ToolsView from './Tools/ToolsView';
import StatusBar from './StatusBar/StatusBar';
import CommandPalette from './CommandPalette/CommandPalette';
import LoadingFallback from './LazyLoad';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { useConversation } from '../context/ConversationContext';
import { useAgent } from '../context/AgentContext';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import useGlobalShortcuts from '../hooks/useGlobalShortcuts';

// Lazy load Settings (only loaded when opened)
const SettingsView = lazy(() => import('./Settings/SettingsView'));

/**
 * AppShell - Main application layout
 * Features:
 * - Responsive layout (mobile → desktop)
 * - Collapsible sidebar (Cmd+B)
 * - Mobile drawer navigation
 * - Command palette integration (Cmd+K)
 * - Global keyboard shortcuts
 * - Settings panel
 * - Linear.app inspired minimal chrome design
 */
const AppShell = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState('chat'); // chat | agents | workflows | knowledge | tools
  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false);
  const [tertiarySidebarCollapsed, setTertiarySidebarCollapsed] = useState(false);

  // Selected items for each section
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Agent sessions state
  const [agentSessions, setAgentSessions] = useState(() => {
    const stored = localStorage.getItem('aether_agent_sessions');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Listen for agent session changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('aether_agent_sessions');
      if (stored) {
        try {
          setAgentSessions(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse agent sessions:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Trigger flags for creating new items
  const [triggerNewWorkflow, setTriggerNewWorkflow] = useState(0);
  const [triggerNewAgent, setTriggerNewAgent] = useState(0);
  const [triggerNewKB, setTriggerNewKB] = useState(0);
  const [triggerNewTool, setTriggerNewTool] = useState(0);

  const { togglePalette } = useCommandPalette();
  const { createConversation } = useConversation();
  const { executions } = useAgent();
  const { toggleTheme, theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Handle "Create New" based on active section
  const handleCreateNew = (section) => {
    if (section === 'chat') {
      createConversation();
    } else if (section === 'agents') {
      setTriggerNewAgent(prev => prev + 1);
    } else if (section === 'workflows') {
      setTriggerNewWorkflow(prev => prev + 1);
    } else if (section === 'knowledge') {
      setTriggerNewKB(prev => prev + 1);
    } else if (section === 'tools') {
      setTriggerNewTool(prev => prev + 1);
    }
  };

  // Global keyboard shortcuts
  const shortcuts = {
    'mod+k': (e) => {
      e.preventDefault();
      togglePalette();
    },
    'mod+n': (e) => {
      e.preventDefault();
      createConversation();
    },
    'mod+b': (e) => {
      e.preventDefault();
      setSecondarySidebarCollapsed((prev) => !prev);
    },
    'mod+,': (e) => {
      e.preventDefault();
      setShowSettings(true);
    },
    'mod+shift+t': (e) => {
      e.preventDefault();
      toggleTheme();
    },
    'escape': () => {
      if (showSettings) {
        setShowSettings(false);
      }
    },
  };

  useGlobalShortcuts(shortcuts);

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleExport = () => {
    // Export functionality will be implemented
    console.log('Export conversation');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Command Palette */}
      <CommandPalette
        onOpenSettings={handleOpenSettings}
        onToggleTheme={toggleTheme}
        currentTheme={theme}
        onExport={handleExport}
      />

      {/* Primary Sidebar (Always visible) */}
      <PrimarySidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSettingsClick={handleOpenSettings}
      />

      {/* Secondary Sidebar (Contextual) */}
      <SecondarySidebar
        activeSection={activeSection}
        isCollapsed={secondarySidebarCollapsed}
        onToggleCollapse={() => setSecondarySidebarCollapsed(!secondarySidebarCollapsed)}
        onCreateNew={handleCreateNew}
        onOpenAgent={setSelectedAgent}
        onOpenWorkflow={setSelectedWorkflow}
        onOpenKnowledge={setSelectedKnowledge}
        onOpenMCP={setSelectedTool}
        selectedAgent={selectedAgent}
        selectedWorkflow={selectedWorkflow}
        selectedKnowledge={selectedKnowledge}
        selectedTool={selectedTool}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {activeSection === 'chat' && <ChatView isMobile={isMobile} isTablet={isTablet} />}
        {activeSection === 'agents' && (
          <AgentsView
            isMobile={isMobile}
            isTablet={isTablet}
            selectedAgent={selectedAgent}
            onAgentChange={setSelectedAgent}
            triggerNew={triggerNewAgent}
            selectedSession={selectedSession}
            onSessionChange={setSelectedSession}
          />
        )}
        {activeSection === 'workflows' && (
          <WorkflowsView
            isMobile={isMobile}
            isTablet={isTablet}
            selectedWorkflow={selectedWorkflow}
            onWorkflowChange={setSelectedWorkflow}
            triggerNew={triggerNewWorkflow}
          />
        )}
        {activeSection === 'knowledge' && (
          <KnowledgeView
            isMobile={isMobile}
            isTablet={isTablet}
            selectedKB={selectedKnowledge}
            onKBChange={setSelectedKnowledge}
            triggerNew={triggerNewKB}
          />
        )}
        {activeSection === 'tools' && (
          <ToolsView
            isMobile={isMobile}
            isTablet={isTablet}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            triggerNew={triggerNewTool}
          />
        )}
        {!isMobile && <StatusBar />}
      </div>

      {/* Tertiary Sidebar - Execution History / Agent Sessions */}
      {(activeSection === 'workflows' || activeSection === 'agents') && !isMobile && (
        <TertiarySidebar
          type={activeSection === 'workflows' ? 'workflow' : 'agent'}
          selectedWorkflow={selectedWorkflow}
          selectedAgent={selectedAgent}
          executions={executions}
          sessions={agentSessions}
          onExecutionClick={setSelectedExecution}
          onSessionClick={setSelectedSession}
          isCollapsed={tertiarySidebarCollapsed}
          onToggleCollapse={() => setTertiarySidebarCollapsed(!tertiarySidebarCollapsed)}
        />
      )}

      {/* Settings View (Full-screen, lazy loaded) */}
      {showSettings && (
        <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
          <SettingsView onClose={() => setShowSettings(false)} isMobile={isMobile} />
        </Suspense>
      )}
    </div>
  );
};

export default AppShell;
