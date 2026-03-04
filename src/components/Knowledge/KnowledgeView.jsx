import React, { useState, useEffect } from 'react';
import { HiDocumentText, HiTrash, HiPencil, HiExclamationTriangle, HiEye } from 'react-icons/hi2';
import KnowledgeUploader from './KnowledgeUploader';
import DocumentViewer from './DocumentViewer';
import KnowledgeBaseStorage from '../../services/storage/KnowledgeBaseStorage';

/**
 * KnowledgeView - Main content view for knowledge base section
 * Shows detail panel for selected KB (list is in secondary sidebar)
 */
function KnowledgeView({ isMobile, isTablet, selectedKB, onKBChange, triggerNew }) {
  const [showUploader, setShowUploader] = useState(false);
  const [editingKB, setEditingKB] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Watch for triggerNew changes to open uploader for new KB
  useEffect(() => {
    if (triggerNew > 0) {
      setEditingKB(null);
      setShowUploader(true);
    }
  }, [triggerNew]);

  // Load documents when selectedKB changes
  useEffect(() => {
    if (selectedKB) {
      const docs = KnowledgeBaseStorage.getDocumentsByKB(selectedKB.id);
      setDocuments(docs);
    } else {
      setDocuments([]);
    }
  }, [selectedKB]);

  const handleEdit = (kb, e) => {
    e?.stopPropagation();
    setEditingKB(kb);
    setShowUploader(true);
  };

  const handleSaveKB = async (kb) => {
    const saved = KnowledgeBaseStorage.saveKnowledgeBase(kb);
    onKBChange?.(saved);
    setShowUploader(false);
    setEditingKB(null);
  };

  const handleDeleteClick = (kbId) => {
    setDeleteConfirm(kbId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    KnowledgeBaseStorage.deleteKnowledgeBase(deleteConfirm);

    if (selectedKB?.id === deleteConfirm) {
      onKBChange?.(null);
    }

    setDeleteConfirm(null);
  };

  const handleDeleteDocument = (docId) => {
    if (confirm('Delete this document?')) {
      KnowledgeBaseStorage.deleteDocument(docId);
      const updatedDocs = KnowledgeBaseStorage.getDocumentsByKB(selectedKB.id);
      setDocuments(updatedDocs);

      // Refresh KB to update stats
      const updatedKB = KnowledgeBaseStorage.getKnowledgeBase(selectedKB.id);
      onKBChange?.(updatedKB);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
        {selectedKB ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 text-3xl">
                  {selectedKB.icon || '📚'}
                </div>

                {/* Header Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {selectedKB.name}
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {selectedKB.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEdit(selectedKB, e)}
                      className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedKB.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Documents
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedKB.documents || 0}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Total Size
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedKB.size || '0 KB'}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Chunks
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedKB.totalChunks || 0}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Embedding Model
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedKB.embeddingModel || 'text-embedding-3-small'}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg col-span-2">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Created
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {new Date(selectedKB.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Documents ({documents.length})
                  </h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                        <HiDocumentText className="w-6 h-6 text-amber-500" />
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        No documents yet
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        Edit this knowledge base to add documents
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors group cursor-pointer"
                          onClick={() => setViewingDocument(doc)}
                        >
                          <div className="flex items-start gap-3">
                            <HiDocumentText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate mb-1">
                                {doc.name}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                <span>{KnowledgeBaseStorage.formatSize(doc.size)}</span>
                                {doc.chunks && (
                                  <>
                                    <span>•</span>
                                    <span>{doc.chunks} chunks</span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="capitalize">{doc.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingDocument(doc);
                                }}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-all"
                                title="View document"
                              >
                                <HiEye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id);
                                }}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                                title="Delete document"
                              >
                                <HiTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <HiDocumentText className="w-12 h-12 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Select a knowledge base
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Choose a knowledge base from the list to view its details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Knowledge Uploader Modal */}
      {showUploader && (
        <KnowledgeUploader
          onClose={() => {
            setShowUploader(false);
            setEditingKB(null);
          }}
          onSave={handleSaveKB}
          initialKB={editingKB}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <HiExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Delete Knowledge Base
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to delete this knowledge base? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KnowledgeView;
