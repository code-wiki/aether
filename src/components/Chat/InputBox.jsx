import React, { useState } from 'react';
import { useConversation } from '../../context/ConversationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAI } from '../../hooks/useAI';
import FileUpload from './FileUpload';
import AttachmentPreview from './AttachmentPreview';

function InputBox({ isStreaming }) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const { activeConversation } = useConversation();
  const { settings } = useSettings();
  const { sendMessage, error } = useAI();

  const handleFileSelect = (files) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;

    const message = input.trim();
    const files = [...attachments];
    setInput('');
    setAttachments([]);

    // Get current provider and model
    const provider = activeConversation?.provider || settings.defaultProvider || 'gemini';
    const model = activeConversation?.model || settings.defaultModel[provider];

    // TODO: Add file support to AI providers (Phase 6.5)
    // For now, include file info in message
    let fullMessage = message;
    if (files.length > 0) {
      fullMessage += '\n\n[Attachments: ' + files.map(f => f.name).join(', ') + ']';
    }

    // Send to AI
    try {
      await sendMessage(fullMessage, provider, model);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-6 py-4 border-t border-border">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-3 px-4 py-2 bg-danger bg-opacity-10 border border-danger rounded-lg text-danger text-sm">
            Error: {error}
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="mb-3">
            {attachments.map((file, index) => (
              <AttachmentPreview
                key={index}
                file={file}
                onRemove={() => handleRemoveAttachment(index)}
              />
            ))}
          </div>
        )}

        <div className="bg-surface border border-border rounded-2xl p-3 flex gap-2 items-end">
          <FileUpload onFileSelect={handleFileSelect} disabled={isStreaming} />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent resize-none outline-none text-text-primary placeholder-text-secondary max-h-32"
            style={{ minHeight: '24px' }}
          />

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isStreaming}
            className="p-2 rounded-xl bg-accent hover:bg-blue-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InputBox;
