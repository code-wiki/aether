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
          'mb-2 p-3 rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800',
          isMobile ? 'text-xs' : 'text-sm'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-900 dark:text-purple-100">
              Prompt Enhancement
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-purple-200/50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <X className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </button>
        </div>

        {/* Optimized Prompt Preview */}
        {hasOptimizations && (
          <div className="mb-3">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
              Enhanced Version:
            </div>
            <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-purple-200 dark:border-purple-800 mb-2">
              <p className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                {optimizedPrompt}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onApply(optimizedPrompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Use Enhanced Version
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                Keep Original
              </button>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
              Suggestions:
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-start gap-2">
                    <Wand2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-purple-900 dark:text-purple-100 text-xs">
                        {suggestion.label}
                      </div>
                      <div className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                        {suggestion.description}
                      </div>
                      {suggestion.preview && (
                        <button
                          onClick={() => setSelectedSuggestion(selectedSuggestion === index ? null : index)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1"
                        >
                          {selectedSuggestion === index ? 'Hide preview' : 'Show preview'}
                        </button>
                      )}
                      {selectedSuggestion === index && suggestion.preview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800"
                        >
                          <p className="text-xs text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                            {suggestion.preview}
                          </p>
                          <button
                            onClick={() => onApply(suggestion.preview)}
                            className="mt-2 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
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
