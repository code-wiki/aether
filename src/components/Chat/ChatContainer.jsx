import React, { useState } from 'react';
import { useConversation } from '../../context/ConversationContext';
import { MessageSquare } from 'lucide-react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import ModelSelector from './ModelSelector';
import ExportMenu from './ExportMenu';
import PersonaSelector from './PersonaSelector';

function ChatContainer() {
  const { activeConversation, messages, isStreaming } = useConversation();

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <MessageSquare className="w-16 h-16 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Aether</h2>
          <p className="text-text-secondary">Start a new conversation to begin</p>
          <p className="text-sm text-text-secondary mt-4">
            Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">⌘K</kbd> to open command palette
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{activeConversation.title}</h2>
          <div className="text-sm text-text-secondary mt-1">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PersonaSelector />
          <ExportMenu conversation={activeConversation} />
          <ModelSelector />
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <InputBox isStreaming={isStreaming} />
    </div>
  );
}

export default ChatContainer;
