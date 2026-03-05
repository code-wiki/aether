import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import PromptOptimizer from '../../services/ai/PromptOptimizer';

/**
 * PromptEnhancer - Shows suggestions and optimizes prompts
 */
function PromptEnhancer({ prompt, onApply, onClose, isMobile }) {
  const [suggestions, setSuggestions] = useState([]);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    if (prompt && prompt.length > 3) {
      const newSuggestions = PromptOptimizer.getSuggestions(prompt);
      setSuggestions(newSuggestions);

      const optimized = PromptOptimizer.optimize(prompt, {
        autoEnhance: true,
        useTemplates: true,
        addClarity: true,
      });
      setOptimizedPrompt(optimized);
    } else {
      setSuggestions([]);
      setOptimizedPrompt('');
    }
  }, [prompt]);

  if (!prompt || prompt.length < 3) return null;

  const hasOptimizations = optimizedPrompt && optimizedPrompt !== prompt;

  if (!hasOptimizations && suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          'mb-2 rounded-xl border bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 border-purple-200 dark:border-purple-800',
          isMobile ? 'p-2 text-xs' : 'p-3 text-sm'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between', isMobile ? 'mb-2' : 'mb-3')}>
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            <Sparkles className={cn('flex-shrink-0 text-purple-600 dark:text-purple-400', isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
            <span className={cn('font-semibold text-purple-900 dark:text-purple-100 truncate', isMobile ? 'text-xs' : 'text-sm')}>
              Prompt Enhancement
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-purple-200/50 dark:hover:bg-purple-900/30 transition-colors flex-shrink-0"
          >
            <X className={cn('text-purple-600 dark:text-purple-400', isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          </button>
        </div>

        {/* Optimized Prompt Preview */}
        {hasOptimizations && (
          <div className={cn(isMobile ? 'mb-2' : 'mb-3')}>
            <div className={cn('font-medium text-purple-700 dark:text-purple-300', isMobile ? 'text-xs mb-1.5' : 'text-xs mb-2')}>
              Enhanced Version:
            </div>
            <div className={cn(
              'bg-white dark:bg-neutral-900 rounded-lg border border-purple-200 dark:border-purple-800 overflow-auto',
              isMobile ? 'p-2 mb-1.5 max-h-32' : 'p-3 mb-2 max-h-48'
            )}>
              <p className={cn('text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap break-words', isMobile ? 'text-xs' : 'text-sm')}>
                {optimizedPrompt}
              </p>
            </div>
            <div className={cn('flex gap-1.5 md:gap-2', isMobile ? 'flex-col' : 'flex-row')}>
              <button
                onClick={() => onApply(optimizedPrompt)}
                className={cn(
                  'flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors',
                  isMobile ? 'px-2.5 py-2 text-xs w-full' : 'px-3 py-1.5 text-xs'
                )}
              >
                <Check className={cn(isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                <span className="truncate">Use Enhanced Version</span>
              </button>
              <button
                onClick={onClose}
                className={cn(
                  'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors border border-neutral-200 dark:border-neutral-700',
                  isMobile ? 'px-2.5 py-2 text-xs w-full' : 'px-3 py-1.5 text-xs'
                )}
              >
                Keep Original
              </button>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <div className={cn('font-medium text-purple-700 dark:text-purple-300', isMobile ? 'text-xs mb-1.5' : 'text-xs mb-2')}>
              Suggestions:
            </div>
            <div className={cn('space-y-1.5 md:space-y-2', isMobile && 'max-h-60 overflow-y-auto')}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={cn(
                    'bg-white dark:bg-neutral-900 rounded-lg border border-purple-200 dark:border-purple-800',
                    isMobile ? 'p-2' : 'p-2.5'
                  )}
                >
                  <div className={cn('flex items-start', isMobile ? 'gap-1.5' : 'gap-2')}>
                    <Wand2 className={cn('text-purple-600 dark:text-purple-400 flex-shrink-0', isMobile ? 'w-3 h-3 mt-0.5' : 'w-3.5 h-3.5 mt-0.5')} />
                    <div className="flex-1 min-w-0">
                      <div className={cn('font-medium text-purple-900 dark:text-purple-100 break-words', isMobile ? 'text-xs' : 'text-xs')}>
                        {suggestion.label}
                      </div>
                      <div className={cn('text-purple-700 dark:text-purple-300 break-words', isMobile ? 'text-xs mt-0.5' : 'text-xs mt-0.5')}>
                        {suggestion.description}
                      </div>
                      {suggestion.preview && (
                        <button
                          onClick={() => setSelectedSuggestion(selectedSuggestion === index ? null : index)}
                          className={cn('text-purple-600 dark:text-purple-400 hover:underline', isMobile ? 'text-xs mt-1' : 'text-xs mt-1')}
                        >
                          {selectedSuggestion === index ? 'Hide preview' : 'Show preview'}
                        </button>
                      )}
                      {selectedSuggestion === index && suggestion.preview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={cn(
                            'bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800 overflow-auto',
                            isMobile ? 'mt-1.5 p-1.5 max-h-24' : 'mt-2 p-2 max-h-32'
                          )}
                        >
                          <p className={cn('text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap break-words', isMobile ? 'text-xs' : 'text-xs')}>
                            {suggestion.preview}
                          </p>
                          <button
                            onClick={() => onApply(suggestion.preview)}
                            className={cn(
                              'bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors w-full md:w-auto',
                              isMobile ? 'mt-1.5 px-2 py-1.5 text-xs' : 'mt-2 px-2 py-1 text-xs'
                            )}
                          >
                            Use This
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default PromptEnhancer;
