import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Loader2, Hash, Settings, Wand2 } from 'lucide-react';
import { useConversation } from '../../context/ConversationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAttachment } from '../../context/AttachmentContext';
import { useAI } from '../../hooks/useAI';
import FileUpload from './FileUpload';
import AttachmentPreview from './AttachmentPreview';
import VoiceRecorder from './VoiceRecorder';
import PromptEnhancer from './PromptEnhancer';
import { fadeInUp } from '../../design-system/motion';
import { cn } from '../../lib/utils';

/**
 * ComposerBar - Responsive rich input composer
 * Features:
 * - Responsive design (compact on mobile)
 * - Multi-line text input
 * - Slash commands (/model, /export, /persona)
 * - Token counter (desktop only)
 * - File attachments
 * - Keyboard shortcuts (Shift+Enter for new line, Enter to send)
 * - Auto-resize textarea
 * - Linear.app inspired minimal design
 */
const ComposerBar = ({ isMobile, isTablet }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPromptEnhancer, setShowPromptEnhancer] = useState(false);
  const textareaRef = useRef(null);

  const { activeConversation, isStreaming, messages: conversationMessages } = useConversation();
  const { settings } = useSettings();
  const { uploadAttachment } = useAttachment();
  const { sendMessage, error } = useAI();

  // Slash commands configuration
  const slashCommands = [
    { command: '/model', description: 'Switch AI model', icon: Hash },
    { command: '/export', description: 'Export conversation', icon: Hash },
    { command: '/persona', description: 'Change persona', icon: Hash },
    { command: '/clear', description: 'Clear input', icon: Hash },
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Detect slash commands
  useEffect(() => {
    const lastWord = input.split(' ').pop();
    setShowSlashCommands(lastWord?.startsWith('/'));
  }, [input]);

  const handleFileSelect = (files) => {
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceTranscript = (transcript) => {
    setInput((prev) => prev + (prev ? ' ' : '') + transcript);
  };

  const handlePromptEnhance = (enhancedPrompt) => {
    setInput(enhancedPrompt);
    setShowPromptEnhancer(false);
  };

  const togglePromptEnhancer = () => {
    setShowPromptEnhancer(!showPromptEnhancer);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;

    const message = input.trim();
    const files = [...attachments];
    setInput('');
    setAttachments([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Get current provider and model
    const provider = activeConversation?.provider || settings.defaultProvider || 'gemini';
    const model = activeConversation?.model || settings.defaultModel[provider];

    // Handle slash commands
    if (message.startsWith('/')) {
      handleSlashCommand(message);
      return;
    }

    // Process file attachments through the attachment service
    let processedAttachments = [];
    if (files.length > 0) {
      try {
        // Files from FileUpload are already processed with base64 data
        // We just need to ensure they have the correct structure
        processedAttachments = files.map(file => ({
          id: file.id || crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data, // base64 data URL
          source: 'upload',
          conversationId: activeConversation?.id,
        }));
      } catch (err) {
        console.error('Failed to process attachments:', err);
        // Continue without attachments if processing fails
      }
    }

    // Send to AI with attachments
    try {
      await sendMessage(message, provider, model, processedAttachments);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSlashCommand = (command) => {
    const cmd = command.toLowerCase().trim();

    if (cmd === '/clear') {
      setInput('');
      setAttachments([]);
    } else if (cmd.startsWith('/model')) {
      // Open model selector (TODO: Integrate with command palette)
      console.log('Open model selector');
    } else if (cmd.startsWith('/export')) {
      // Trigger export (TODO: Integrate with export menu)
      console.log('Export conversation');
    } else if (cmd.startsWith('/persona')) {
      // Open persona selector (TODO: Integrate with command palette)
      console.log('Open persona selector');
    }
  };

  const handleKeyDown = (e) => {
    // Enter to send (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Escape to clear
    if (e.key === 'Escape') {
      setInput('');
      setShowSlashCommands(false);
    }
  };

  // Listen for message actions (edit, regenerate, quick reply)
  useEffect(() => {
    const handleEditMessage = (e) => {
      const { message } = e.detail;
      setInput(message.content);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    const handleQuickReply = (e) => {
      const { text } = e.detail;
      setInput(text);
      // Auto-submit quick replies
      setTimeout(() => {
        handleSubmit();
      }, 100);
    };

    const handleRegenerateMessage = async (e) => {
      const { message } = e.detail;
      // Find the user message before this assistant message and resend it
      // Use conversationMessages from top-level hook instead of calling hook here
      const msgIndex = conversationMessages.findIndex(m => m.id === message.id);
      if (msgIndex > 0 && conversationMessages[msgIndex - 1].role === 'user') {
        const userMessage = conversationMessages[msgIndex - 1];
        setInput(userMessage.content);
        setTimeout(() => {
          handleSubmit();
        }, 100);
      }
    };

    window.addEventListener('editMessage', handleEditMessage);
    window.addEventListener('quickReply', handleQuickReply);
    window.addEventListener('regenerateMessage', handleRegenerateMessage);

    return () => {
      window.removeEventListener('editMessage', handleEditMessage);
      window.removeEventListener('quickReply', handleQuickReply);
      window.removeEventListener('regenerateMessage', handleRegenerateMessage);
    };
  }, [conversationMessages]);

  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil((input.length + attachments.length * 100) / 4);

  return (
    <div className={cn(
      "border-t border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-1000",
      "px-3 py-3 md:px-4 md:py-3.5 lg:px-6 lg:py-4"
    )}>
      <div className="max-w-4xl mx-auto">
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              {...fadeInUp}
              className={cn(
                "mb-2 md:mb-3 px-3 py-2 md:px-4 md:py-3",
                "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
                "rounded-lg md:rounded-xl"
              )}
            >
              <div className="flex items-start gap-2 md:gap-3">
                <div className="flex-1">
                  <div className="text-xs md:text-sm font-semibold text-red-900 dark:text-red-100 mb-1 md:mb-2">
                    Error
                  </div>
                  <div className="text-xs md:text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    {error}
                  </div>
                </div>
                {!isMobile && (
                  <button
                    onClick={() => {
                      // Open settings via keyboard shortcut simulation
                      const event = new KeyboardEvent('keydown', {
                        key: ',',
                        metaKey: true,
                        bubbles: true
                      });
                      window.dispatchEvent(event);
                    }}
                    className="px-2 md:px-3 py-1 md:py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-900 dark:text-red-100 rounded-md md:rounded-lg text-xs font-medium flex items-center gap-1 md:gap-1.5 transition-colors flex-shrink-0"
                    title="Open Settings (⌘,)"
                  >
                    <Settings className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span className="hidden md:inline">Settings</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div {...fadeInUp} className="mb-2 md:mb-3 flex flex-wrap gap-1.5 md:gap-2">
              {attachments.map((file, index) => (
                <AttachmentPreview
                  key={index}
                  file={file}
                  onRemove={() => handleRemoveAttachment(index)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt Enhancer */}
        {showPromptEnhancer && (
          <PromptEnhancer
            prompt={input}
            onApply={handlePromptEnhance}
            onClose={() => setShowPromptEnhancer(false)}
            isMobile={isMobile}
          />
        )}

        {/* Slash Commands Autocomplete */}
        <AnimatePresence>
          {showSlashCommands && (
            <motion.div
              {...fadeInUp}
              className="mb-2 md:mb-3 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg md:rounded-xl border border-neutral-200 dark:border-neutral-700"
            >
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 px-2">
                Slash Commands
              </div>
              <div className="space-y-1">
                {slashCommands.map(({ command, description, icon: Icon }) => (
                  <button
                    key={command}
                    onClick={() => setInput(command + ' ')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-left transition-colors"
                  >
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                        {command}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container with accent glow on focus - Responsive */}
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={{
              boxShadow: isFocused
                ? '0 0 0 2px rgba(0, 184, 230, 0.2), 0 0 20px rgba(0, 184, 230, 0.1)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-neutral-100 dark:bg-neutral-900 border",
              "rounded-xl md:rounded-2xl p-2 md:p-3 flex gap-2 md:gap-3 items-end",
              "transition-all",
              isFocused
                ? "border-pink-500"
                : "border-neutral-200 dark:border-neutral-800"
            )}
          >
            {/* File Upload Button - Hide on mobile */}
            {!isMobile && <FileUpload onFileSelect={handleFileSelect} disabled={isStreaming} />}

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isMobile ? "Type a message..." : "Type a message... (Shift+Enter for new line)"}
              rows={1}
              disabled={isStreaming}
              className={cn(
                "flex-1 bg-transparent resize-none outline-none border-none",
                "text-neutral-900 dark:text-neutral-0 placeholder-neutral-400",
                "max-h-[200px] min-h-[24px]",
                "focus:ring-0 focus:outline-none focus:border-none",
                isMobile ? "text-sm" : "text-base"
              )}
              style={{ border: 'none', outline: 'none' }}
            />

            {/* Token Counter - Desktop only */}
            {!isMobile && input.length > 0 && (
              <div className="text-xs text-neutral-400 self-center px-2">
                ~{estimatedTokens} tokens
              </div>
            )}

            {/* Voice Recorder */}
            <VoiceRecorder
              onTranscript={handleVoiceTranscript}
              disabled={isStreaming}
              isMobile={isMobile}
            />

            {/* Prompt Enhancer Button */}
            {input.length > 3 && !isMobile && (
              <motion.button
                type="button"
                onClick={togglePromptEnhancer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  showPromptEnhancer
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                )}
                title="Enhance prompt"
              >
                <Wand2 className="w-5 h-5" />
              </motion.button>
            )}

            {/* Send Button with enhanced states - Touch accessible (44x44px minimum) */}
            <motion.button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isStreaming}
              whileHover={(!input.trim() && attachments.length === 0) || isStreaming ? {} : { scale: 1.05 }}
              whileTap={(!input.trim() && attachments.length === 0) || isStreaming ? {} : { scale: 0.95 }}
              className={cn(
                "rounded-lg md:rounded-xl bg-pink-500 text-white",
                "transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50",
                "min-w-[44px] min-h-[44px]", // Accessibility: touch target minimum
                !isStreaming && (input.trim() || attachments.length > 0) && "hover:bg-pink-600 hover:shadow-glow-blue-sm",
                "p-3" // Changed from p-2 (32px) to p-3 (44px total with icon)
              )}
              aria-label="Send message"
            >
              {isStreaming ? (
                <Loader2 className={cn("animate-spin", isMobile ? "w-4 h-4" : "w-5 h-5")} />
              ) : (
                <Send className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
              )}
            </motion.button>
          </motion.div>

          {/* Keyboard Hints - Desktop only */}
          {!isMobile && (
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono">
                    Enter
                  </kbd>{' '}
                  to send
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono">
                    Shift+Enter
                  </kbd>{' '}
                  for new line
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono">
                    /
                  </kbd>{' '}
                  for commands
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ComposerBar;
