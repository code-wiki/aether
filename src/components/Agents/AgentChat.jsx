import React, { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane, HiPaperClip, HiXMark, HiArrowLeft, HiClipboard, HiCheck, HiArrowDownTray } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';
import { useSettings } from '../../context/SettingsContext';
import aiService from '../../services/ai/AIService';

// Custom loading animation styles
const loadingStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(400%);
    }
  }
  @keyframes progress {
    0% {
      background-position: 0% 50%;
      width: 20%;
    }
    50% {
      background-position: 100% 50%;
      width: 80%;
    }
    100% {
      background-position: 0% 50%;
      width: 20%;
    }
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .loading-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
  .message-appear {
    animation: fadeInUp 0.3s ease-out;
  }
`;

/**
 * AgentChat - Interactive chat interface for using an agent
 * Replaces the agent detail view when "Use Agent" is clicked
 */
function AgentChat({ agent, onBack, sessionId = null, initialMessages = null }) {
  const { settings } = useSettings();
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [currentSessionId] = useState(sessionId || `session-${Date.now()}`);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load initial messages if provided
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save session to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const sessions = JSON.parse(localStorage.getItem('aether_agent_sessions') || '[]');
      const existingSessionIndex = sessions.findIndex(s => s.id === currentSessionId);

      const sessionData = {
        id: currentSessionId,
        agentId: agent.id,
        title: messages[0]?.content.substring(0, 50) || 'Chat Session',
        messages,
        status: isLoading ? 'active' : 'completed',
        createdAt: existingSessionIndex >= 0 ? sessions[existingSessionIndex].createdAt : Date.now(),
        updatedAt: Date.now(),
        duration: existingSessionIndex >= 0
          ? Date.now() - sessions[existingSessionIndex].createdAt
          : 0,
      };

      if (existingSessionIndex >= 0) {
        sessions[existingSessionIndex] = sessionData;
      } else {
        sessions.unshift(sessionData);
      }

      localStorage.setItem('aether_agent_sessions', JSON.stringify(sessions));
      window.dispatchEvent(new Event('storage'));
    }
  }, [messages, agent.id, currentSessionId, isLoading]);

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = loadingStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = async (files) => {
    const newAttachments = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Date.now() + Math.random(),
              name: file.name,
              type: file.type,
              size: file.size,
              data: e.target.result, // base64 data URL
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleDownloadMessage = (message) => {
    try {
      // Create a blob with the message content
      const blob = new Blob([message.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${agent.name}-response-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download message:', error);
    }
  };

  const downloadArtifact = (artifact) => {
    try {
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = artifact.data; // Already a data URL
      link.download = artifact.name || `artifact-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download artifact:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      attachments: [...attachments],
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Show typing indicator briefly for better UX
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTyping(false);

    try {
      // Initialize Claude provider
      if (!aiService.activeProvider || aiService.activeProviderName !== 'claude') {
        await aiService.initializeProvider('claude', {
          projectId: settings.gcp.projectId,
          location: settings.gcp.location,
        });
      }

      // Prepare messages with system prompt
      const messagesToSend = [
        { role: 'system', content: agent.systemPrompt || 'You are a helpful AI assistant.' },
        ...messages.map(m => ({ role: m.role, content: m.content, attachments: m.attachments })),
        { role: 'user', content: userMessage.content, attachments: userMessage.attachments },
      ];

      // Call AI
      const response = await aiService.sendMessage(messagesToSend, {
        model: agent.model || 'claude-sonnet-4-5@20250929',
        temperature: agent.temperature || 0.7,
      });

      // Simulate streaming effect by revealing text gradually
      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Agent chat error:', error);
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <HiArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">
            {agent.icon || '🤖'}
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {agent.name}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Using {agent.model || 'claude-sonnet-4-5@20250929'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center max-w-md">
              {/* Icon with animated gradient */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 animate-[bounce_2s_ease-in-out_infinite]">
                {agent.icon || '🤖'}
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Start chatting with {agent.name}
              </h3>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {agent.description || 'Ask questions, upload files, or give instructions'}
              </p>

              {/* Example prompts */}
              {agent.skills && agent.skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Try asking about:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {agent.skills.slice(0, 3).map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(`Help me with ${skill.toLowerCase()}`)}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-lg transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File upload hint */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <HiPaperClip className="w-4 h-4" />
                <span>Supports images, PDFs, and documents</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex message-appear group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="relative max-w-[80%]">
              <div
                className={`rounded-lg p-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-purple-500 text-white shadow-purple-500/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {message.attachments?.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {message.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 text-xs opacity-80"
                      >
                        <HiPaperClip className="w-3 h-3" />
                        <span>{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <ReactMarkdown className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  {message.content}
                </ReactMarkdown>

                {/* Display generated artifacts (images, files, etc.) */}
                {message.artifacts && message.artifacts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                    {message.artifacts.map((artifact, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                              {artifact.name || 'Generated file'}
                            </span>
                            <span className="text-xs text-neutral-500">
                              ({artifact.type})
                            </span>
                          </div>
                          <button
                            onClick={() => downloadArtifact(artifact)}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                            title="Download file"
                          >
                            <HiArrowDownTray className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                          </button>
                        </div>
                        {artifact.type.startsWith('image/') && (
                          <img
                            src={artifact.data}
                            alt={artifact.name}
                            className="w-full rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons - only show for assistant messages */}
              {message.role === 'assistant' && (
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyMessage(message.id, message.content)}
                    className="p-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedMessageId === message.id ? (
                      <HiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <HiClipboard className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadMessage(message)}
                    className="p-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                    title="Download as markdown"
                  >
                    <HiArrowDownTray className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && !isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ animationDelay: '100ms' }} />
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
              </div>
            </div>
          </div>
        )}

        {isLoading && !isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent loading-shimmer" />

              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    {agent.name} is thinking...
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-purple-600 dark:text-purple-400">
                    <span>Processing your request</span>
                    <span className="animate-pulse">●</span>
                  </div>
                  <div className="h-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"
                      style={{
                        animation: 'progress 2s ease-in-out infinite',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm"
              >
                <HiPaperClip className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[150px]">
                  {att.name}
                </span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                >
                  <HiXMark className="w-3 h-3 text-neutral-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,.pdf,.txt,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <HiPaperClip className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${agent.name}...`}
            className="flex-1 resize-none rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-neutral-100"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiPaperAirplane className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentChat;
