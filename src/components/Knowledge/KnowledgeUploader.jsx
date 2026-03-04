import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, File, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { cn } from '../../lib/utils';
import KnowledgeBaseStorage from '../../services/storage/KnowledgeBaseStorage';

/**
 * KnowledgeUploader - Upload and manage knowledge bases for RAG
 */
function KnowledgeUploader({ onClose, onSave, initialKB }) {
  const [step, setStep] = useState(initialKB ? 2 : 1); // 1: Create KB, 2: Upload Docs, 3: Processing
  const [knowledgeBase, setKnowledgeBase] = useState(() => {
    if (initialKB) {
      // Editing existing KB - preserve existing data and initialize files array
      return {
        ...initialKB,
        files: [], // Initialize empty files array for new uploads
        chunkSize: initialKB.chunkSize || 1000,
        chunkOverlap: initialKB.chunkOverlap || 200,
      };
    }
    // Creating new KB
    return {
      name: '',
      description: '',
      icon: '📚',
      files: [],
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-small',
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const icons = ['📚', '📖', '📄', '📝', '💼', '🎓', '🔬', '💡', '🗂️', '📊'];

  const embeddingModels = [
    // OpenAI Embeddings
    { id: 'text-embedding-3-small', name: 'OpenAI Small', provider: 'OpenAI', description: 'Fast and efficient (1536 dimensions)' },
    { id: 'text-embedding-3-large', name: 'OpenAI Large', provider: 'OpenAI', description: 'More accurate (3072 dimensions)' },

    // Google (Gemini) Embeddings
    { id: 'text-embedding-004', name: 'Gemini Embedding', provider: 'Google', description: 'Latest Gemini embedding model (768 dimensions)' },
    { id: 'text-multilingual-embedding-002', name: 'Gemini Multilingual', provider: 'Google', description: 'Supports 100+ languages' },

    // Local/Open Source (Future)
    { id: 'all-MiniLM-L6-v2', name: 'MiniLM (Local)', provider: 'Local', description: 'Fast local embedding model (384 dimensions)', disabled: true },
  ];

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'txt', 'md', 'doc', 'docx'].includes(ext);
    });

    setKnowledgeBase(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        chunks: 0,
      }))]
    }));
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      chunks: 0,
    }));

    setKnowledgeBase(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const handleProcess = async () => {
    setProcessing(true);
    setStep(3);

    try {
      // Save or update KB
      let kbId = knowledgeBase.id;
      if (!kbId) {
        // Create new KB
        const savedKB = KnowledgeBaseStorage.saveKnowledgeBase({
          name: knowledgeBase.name,
          description: knowledgeBase.description,
          icon: knowledgeBase.icon,
          embeddingModel: knowledgeBase.embeddingModel,
          chunkSize: knowledgeBase.chunkSize,
          chunkOverlap: knowledgeBase.chunkOverlap,
        });
        kbId = savedKB.id;
        setKnowledgeBase(prev => ({ ...prev, id: kbId }));
      } else {
        // Update existing KB metadata
        KnowledgeBaseStorage.saveKnowledgeBase({
          id: kbId,
          name: knowledgeBase.name,
          description: knowledgeBase.description,
          icon: knowledgeBase.icon,
          embeddingModel: knowledgeBase.embeddingModel,
          chunkSize: knowledgeBase.chunkSize,
          chunkOverlap: knowledgeBase.chunkOverlap,
        });
      }

      // Process files
      for (let i = 0; i < knowledgeBase.files.length; i++) {
        const file = knowledgeBase.files[i];

        // Update status to processing
        setKnowledgeBase(prev => ({
          ...prev,
          files: prev.files.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f)
        }));

        // Process file with storage service
        const result = await KnowledgeBaseStorage.processFile(
          file.file,
          kbId,
          {
            chunkSize: knowledgeBase.chunkSize,
            chunkOverlap: knowledgeBase.chunkOverlap,
          }
        );

        // Update status to completed
        setKnowledgeBase(prev => ({
          ...prev,
          files: prev.files.map((f, idx) => idx === i ? {
            ...f,
            status: 'processed',
            chunks: result.chunks
          } : f)
        }));
      }

      setProcessing(false);

      // Auto-save after 2 seconds
      setTimeout(() => {
        const finalKB = KnowledgeBaseStorage.getKnowledgeBase(kbId);
        onSave(finalKB);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessing(false);
      alert('Failed to process files. Please try again.');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {initialKB ? 'Edit Knowledge Base' : 'Create Knowledge Base'}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Step {step} of 3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all',
                  s <= step ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-neutral-200 dark:bg-neutral-800'
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Knowledge Base Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setKnowledgeBase({ ...knowledgeBase, icon })}
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all',
                        knowledgeBase.icon === icon
                          ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={knowledgeBase.name}
                  onChange={(e) => setKnowledgeBase({ ...knowledgeBase, name: e.target.value })}
                  placeholder="e.g., Product Documentation, Customer Support"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Description
                </label>
                <textarea
                  value={knowledgeBase.description}
                  onChange={(e) => setKnowledgeBase({ ...knowledgeBase, description: e.target.value })}
                  placeholder="Describe what this knowledge base contains..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Embedding Model
                </label>
                <div className="space-y-2">
                  {embeddingModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => !model.disabled && setKnowledgeBase({ ...knowledgeBase, embeddingModel: model.id })}
                      disabled={model.disabled}
                      className={cn(
                        'w-full p-3 rounded-lg border-2 transition-all text-left',
                        model.disabled && 'opacity-50 cursor-not-allowed',
                        knowledgeBase.embeddingModel === model.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {model.name}
                            </div>
                            <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded">
                              {model.provider}
                            </span>
                            {model.disabled && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {model.description}
                          </div>
                        </div>
                        {knowledgeBase.embeddingModel === model.id && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 ml-2">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload Documents */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 transition-all',
                  isDragging
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-amber-500'
                )}
              >
                <div className="text-center">
                  <Upload className={cn(
                    'w-12 h-12 mx-auto mb-4',
                    isDragging ? 'text-amber-500' : 'text-neutral-400'
                  )} />
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium mb-1">
                    Drag and drop files here
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Supports PDF, TXT, MD, DOC, DOCX
                  </p>
                  <label className="inline-block px-4 py-2 bg-amber-500 text-white rounded-lg font-medium cursor-pointer hover:bg-amber-600 transition-colors">
                    Browse Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.md,.doc,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* File List */}
              {knowledgeBase.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Uploaded Files ({knowledgeBase.files.length})
                  </h3>
                  <div className="space-y-2">
                    {knowledgeBase.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {formatSize(file.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setKnowledgeBase(prev => ({
                              ...prev,
                              files: prev.files.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <details className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                  Advanced Settings
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Chunk Size: {knowledgeBase.chunkSize} characters
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="100"
                      value={knowledgeBase.chunkSize}
                      onChange={(e) => setKnowledgeBase({ ...knowledgeBase, chunkSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Chunk Overlap: {knowledgeBase.chunkOverlap} characters
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="50"
                      value={knowledgeBase.chunkOverlap}
                      onChange={(e) => setKnowledgeBase({ ...knowledgeBase, chunkOverlap: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                {processing ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Processing Documents
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Chunking, embedding, and indexing your documents...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Knowledge Base Created!
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Your documents have been processed and indexed
                    </p>
                  </>
                )}
              </div>

              {/* Processing Status */}
              <div className="space-y-2">
                {knowledgeBase.files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    {file.status === 'processed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {file.status === 'processed' ? `${file.chunks} chunks created` : 'Processing...'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                step === 1
                  ? 'text-neutral-400 cursor-not-allowed'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              Back
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              {step < 2 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!knowledgeBase.name}
                  className={cn(
                    'px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium transition-all',
                    !knowledgeBase.name
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105'
                  )}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleProcess}
                  disabled={knowledgeBase.files.length === 0}
                  className={cn(
                    'px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium transition-all',
                    knowledgeBase.files.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105'
                  )}
                >
                  Process & Create
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KnowledgeUploader;
