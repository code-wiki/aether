import React, { useState, useEffect } from 'react';
import { HiChatBubbleLeftRight, HiCheckCircle, HiXCircle, HiArrowPath, HiClock } from 'react-icons/hi2';
import { cn } from '../../../lib/utils';

/**
 * AgentSessionsPanel - Shows agent chat sessions history
 * Third sidebar panel for agents
 */
function AgentSessionsPanel({ selectedAgent, sessions, onSessionClick, isCollapsed }) {
  const [filteredSessions, setFilteredSessions] = useState([]);

  useEffect(() => {
    if (selectedAgent && sessions) {
      // Filter sessions for selected agent
      const agentSessions = sessions.filter(
        session => session.agentId === selectedAgent.id
      );
      setFilteredSessions(agentSessions);
    } else {
      setFilteredSessions([]);
    }
  }, [selectedAgent, sessions]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSessionPreview = (session) => {
    if (!session.messages || session.messages.length === 0) {
      return 'No messages yet';
    }

    // Get first user message as preview
    const firstUserMsg = session.messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      const preview = firstUserMsg.content.substring(0, 50);
      return preview.length < firstUserMsg.content.length ? `${preview}...` : preview;
    }

    return 'New session';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'error':
        return <HiXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'active':
        return <HiArrowPath className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />;
      default:
        return <HiChatBubbleLeftRight className="w-4 h-4 text-neutral-400" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        {filteredSessions.slice(0, 5).map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionClick?.(session)}
            className={cn(
              'w-10 h-10 rounded-lg mb-2 flex items-center justify-center transition-all',
              'bg-purple-100 dark:bg-purple-950/30 hover:bg-purple-200 dark:hover:bg-purple-900/40'
            )}
            title={`Session ${formatTime(session.createdAt)}`}
          >
            <HiChatBubbleLeftRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Chat Sessions
        </h3>
        {selectedAgent && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {selectedAgent.name}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!selectedAgent ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiChatBubbleLeftRight className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Select an agent to view chat sessions
              </p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiChatBubbleLeftRight className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No chat sessions yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Click "Use Agent" to start a session
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionClick?.(session)}
                className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-start gap-2 mb-2">
                  {getStatusIcon(session.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                      {session.title || 'Chat Session'}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatTime(session.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Session preview */}
                <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800">
                  <div className="text-xs text-purple-900 dark:text-purple-100 truncate">
                    {getSessionPreview(session)}
                  </div>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Messages:</span>
                    <span className="font-medium">
                      {session.messages?.length || 0}
                    </span>
                  </div>
                  {session.duration && (
                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {Math.floor(session.duration / 60000)}m
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentSessionsPanel;
