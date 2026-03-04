import React, { useState } from 'react';
import { useConversation } from '../../../context/ConversationContext';
import ConversationCard from '../../Sidebar/ConversationCard';
import { cn } from '../../../lib/utils';
import PanelFilters from './PanelFilters';

/**
 * ChatPanel - Shows conversation list
 */
function ChatPanel({ isCollapsed, activeColor = 'blue' }) {
  const { conversations, activeConversationId, loadConversation, deleteConversation, pinConversation } = useConversation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'today', 'pinned', 'all'

  // Filter conversations based on active tab
  const getFilteredConversations = () => {
    let filtered = conversations;

    // Apply tab filter
    if (activeTab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(conv => conv.createdAt >= today);
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(conv => conv.pinned);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredConversations = getFilteredConversations();

  if (isCollapsed) {
    return (
      <div className="p-2">
        {conversations.slice(0, 5).map((conv) => (
          <button
            key={conv.id}
            onClick={() => loadConversation(conv.id)}
            className={cn(
              'w-10 h-10 rounded-lg mb-2 flex items-center justify-center transition-all',
              conv.id === activeConversationId
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700'
            )}
            title={conv.title}
          >
            <span className="text-xs font-medium">
              {conv.title.substring(0, 2).toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3">
      <PanelFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search conversations..."
        color="blue"
      />

      {/* Conversations */}
      <div className="space-y-0.5">
        {filteredConversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onClick={() => loadConversation(conv.id)}
            onDelete={deleteConversation}
          />
        ))}

        {filteredConversations.length === 0 && (
          <div className="text-center py-8 text-neutral-500 text-xs">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPanel;
