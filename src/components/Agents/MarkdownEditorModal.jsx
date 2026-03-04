import React, { useState } from 'react';
import { X, Eye, Edit3, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * MarkdownEditorModal - View and edit markdown files with live preview
 * Split-view editor with markdown on left, preview on right
 */
function MarkdownEditorModal({ title, content, onClose, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [markdown, setMarkdown] = useState(content || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (e) => {
    setMarkdown(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(markdown);
    setHasChanges(false);
    setEditMode(false);
  };

  const handleCancel = () => {
    setMarkdown(content || '');
    setHasChanges(false);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              {editMode ? 'Editing mode - Changes are not saved until you click Save' : 'View mode - Click Edit to make changes'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={cn(
                    'px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg transition-all flex items-center gap-1.5',
                    hasChanges ? 'hover:bg-purple-600 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {editMode ? (
            /* Split View - Editor + Preview */
            <div className="h-full flex">
              {/* Editor Pane */}
              <div className="flex-1 flex flex-col border-r border-neutral-200 dark:border-neutral-800">
                <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Markdown Editor
                  </span>
                </div>
                <textarea
                  value={markdown}
                  onChange={handleChange}
                  className="flex-1 p-6 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-sm resize-none outline-none border-none focus:ring-0"
                  placeholder="Write your markdown here..."
                  style={{ border: 'none', outline: 'none' }}
                />
              </div>

              {/* Preview Pane */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Live Preview
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-950">
                  <div className="prose dark:prose-invert max-w-none prose-sm prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-code:text-purple-700 dark:prose-code:text-purple-300 prose-code:bg-neutral-200 dark:prose-code:bg-neutral-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-neutral-900 prose-pre:text-neutral-0">
                    {markdown ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-neutral-500 italic">Preview will appear here...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* View Only Mode */
            <div className="h-full overflow-y-auto p-8 bg-neutral-50 dark:bg-neutral-950">
              <div className="max-w-4xl mx-auto prose dark:prose-invert prose-lg prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-code:text-purple-700 dark:prose-code:text-purple-300 prose-code:bg-neutral-200 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-neutral-900 prose-pre:text-neutral-0">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 italic">No content yet. Click Edit to add content.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with helpful hints */}
        {editMode && (
          <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex-shrink-0">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-medium">Markdown Tips:</span> Use # for headings, **bold**, *italic*, `code`, - for lists, and [links](url)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkdownEditorModal;
