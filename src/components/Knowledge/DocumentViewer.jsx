import React, { useState, useEffect } from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';
import KnowledgeBaseStorage from '../../services/storage/KnowledgeBaseStorage';

/**
 * DocumentViewer - View document content and chunks
 */
function DocumentViewer({ document, onClose }) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'chunks'

  useEffect(() => {
    if (document) {
      loadChunks();
    }
  }, [document]);

  const loadChunks = async () => {
    setLoading(true);
    try {
      const docChunks = KnowledgeBaseStorage.getChunksByDocument(document.id);
      setChunks(docChunks);
    } catch (error) {
      console.error('Error loading chunks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Create a blob with all chunks combined
    const fullContent = chunks.map(chunk => chunk.content).join('\n\n');
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = document.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {document.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                  <span>{KnowledgeBaseStorage.formatSize(document.size)}</span>
                  {document.chunks && (
                    <>
                      <span>•</span>
                      <span>{document.chunks} chunks</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="capitalize">{document.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Download document"
              >
                <Download className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'content'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Full Content
            </button>
            <button
              onClick={() => setActiveTab('chunks')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chunks'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Chunks ({chunks.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chunks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                No Content Available
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                This document has no chunks. It may not have been processed yet.
              </p>
            </div>
          ) : activeTab === 'content' ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                {chunks.map(chunk => chunk.content).join('\n\n')}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <div
                  key={chunk.id}
                  className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded font-medium">
                        Chunk {index + 1}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {chunk.content.length} characters
                      </span>
                    </div>
                    {chunk.embedding && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Embedded
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-mono">
                    {chunk.content}
                  </div>
                  {chunk.metadata && (
                    <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {Object.entries(chunk.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            <strong>{key}:</strong> {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <div>
              Document ID: <span className="font-mono">{document.id}</span>
            </div>
            <div>
              Created: {new Date(document.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
