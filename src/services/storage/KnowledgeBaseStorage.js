/**
 * KnowledgeBaseStorage - Manages knowledge bases, documents, and chunks in localStorage
 */

const KB_STORAGE_KEY = 'aether_knowledge_bases';
const DOCUMENTS_STORAGE_KEY = 'aether_kb_documents';
const CHUNKS_STORAGE_KEY = 'aether_kb_chunks';

class KnowledgeBaseStorage {
  /**
   * Get all knowledge bases
   */
  getAllKnowledgeBases() {
    try {
      const stored = localStorage.getItem(KB_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load knowledge bases:', error);
      return [];
    }
  }

  /**
   * Get a single knowledge base by ID
   */
  getKnowledgeBase(id) {
    const kbs = this.getAllKnowledgeBases();
    return kbs.find(kb => kb.id === id);
  }

  /**
   * Save a new knowledge base
   */
  saveKnowledgeBase(kb) {
    const kbs = this.getAllKnowledgeBases();

    // Check if KB already exists
    const existingIndex = kbs.findIndex(existing => existing.id === kb.id);

    const kbData = {
      ...kb,
      id: kb.id || `kb-${Date.now()}`,
      createdAt: kb.createdAt || Date.now(),
      updatedAt: Date.now(),
      documents: 0, // Will be updated as documents are added
      size: '0 KB',
      totalChunks: 0,
    };

    if (existingIndex >= 0) {
      kbs[existingIndex] = kbData;
    } else {
      kbs.push(kbData);
    }

    localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(kbs));
    window.dispatchEvent(new Event('storage')); // Trigger storage event

    return kbData;
  }

  /**
   * Update knowledge base metadata
   */
  updateKnowledgeBase(id, updates) {
    const kbs = this.getAllKnowledgeBases();
    const index = kbs.findIndex(kb => kb.id === id);

    if (index >= 0) {
      kbs[index] = {
        ...kbs[index],
        ...updates,
        updatedAt: Date.now(),
      };

      localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(kbs));
      window.dispatchEvent(new Event('storage'));
      return kbs[index];
    }

    return null;
  }

  /**
   * Delete a knowledge base and all its documents/chunks
   */
  deleteKnowledgeBase(id) {
    // Delete KB
    const kbs = this.getAllKnowledgeBases();
    const filtered = kbs.filter(kb => kb.id !== id);
    localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(filtered));

    // Delete all documents for this KB
    const docs = this.getAllDocuments();
    const filteredDocs = docs.filter(doc => doc.knowledgeBaseId !== id);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));

    // Delete all chunks for this KB
    const chunks = this.getAllChunks();
    const filteredChunks = chunks.filter(chunk => chunk.knowledgeBaseId !== id);
    localStorage.setItem(CHUNKS_STORAGE_KEY, JSON.stringify(filteredChunks));

    window.dispatchEvent(new Event('storage'));
  }

  /**
   * Get all documents
   */
  getAllDocuments() {
    try {
      const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load documents:', error);
      return [];
    }
  }

  /**
   * Get documents for a specific knowledge base
   */
  getDocumentsByKB(kbId) {
    const docs = this.getAllDocuments();
    return docs.filter(doc => doc.knowledgeBaseId === kbId);
  }

  /**
   * Save a document
   */
  saveDocument(doc) {
    const docs = this.getAllDocuments();

    const docData = {
      ...doc,
      id: doc.id || `doc-${Date.now()}`,
      createdAt: doc.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    docs.push(docData);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));

    // Update KB stats
    this.updateKBStats(doc.knowledgeBaseId);

    return docData;
  }

  /**
   * Delete a document and its chunks
   */
  deleteDocument(docId) {
    const docs = this.getAllDocuments();
    const doc = docs.find(d => d.id === docId);

    if (!doc) return;

    // Delete document
    const filtered = docs.filter(d => d.id !== docId);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(filtered));

    // Delete chunks
    const chunks = this.getAllChunks();
    const filteredChunks = chunks.filter(chunk => chunk.documentId !== docId);
    localStorage.setItem(CHUNKS_STORAGE_KEY, JSON.stringify(filteredChunks));

    // Update KB stats
    this.updateKBStats(doc.knowledgeBaseId);

    window.dispatchEvent(new Event('storage'));
  }

  /**
   * Get all chunks
   */
  getAllChunks() {
    try {
      const stored = localStorage.getItem(CHUNKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load chunks:', error);
      return [];
    }
  }

  /**
   * Get chunks for a specific document
   */
  getChunksByDocument(docId) {
    const chunks = this.getAllChunks();
    return chunks.filter(chunk => chunk.documentId === docId);
  }

  /**
   * Save chunks for a document
   */
  saveChunks(chunks) {
    const allChunks = this.getAllChunks();
    allChunks.push(...chunks);
    localStorage.setItem(CHUNKS_STORAGE_KEY, JSON.stringify(allChunks));

    // Update KB stats if chunks have kbId
    if (chunks.length > 0 && chunks[0].knowledgeBaseId) {
      this.updateKBStats(chunks[0].knowledgeBaseId);
    }
  }

  /**
   * Update knowledge base statistics
   */
  updateKBStats(kbId) {
    const docs = this.getDocumentsByKB(kbId);
    const totalSize = docs.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const chunks = this.getAllChunks().filter(chunk => chunk.knowledgeBaseId === kbId);

    this.updateKnowledgeBase(kbId, {
      documents: docs.length,
      size: this.formatSize(totalSize),
      totalChunks: chunks.length,
    });
  }

  /**
   * Format bytes to human readable size
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Extract text from file
   */
  async extractText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result;
        resolve(text);
      };

      reader.onerror = reject;

      // Read as text for supported formats
      const ext = file.name.split('.').pop().toLowerCase();
      if (['txt', 'md', 'csv'].includes(ext)) {
        reader.readAsText(file);
      } else {
        // For PDF, DOC, etc., we'd need additional libraries
        // For now, just return placeholder
        resolve(`[Content of ${file.name}]\nFull text extraction for ${ext} files requires additional processing.`);
      }
    });
  }

  /**
   * Chunk text into smaller pieces
   */
  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.substring(start, end);
      chunks.push(chunk);

      // Move start position with overlap
      start = end - overlap;

      // Prevent infinite loop
      if (start >= text.length - overlap) break;
    }

    return chunks;
  }

  /**
   * Process a file: extract text, chunk, and store
   */
  async processFile(file, knowledgeBaseId, options = {}) {
    const { chunkSize = 1000, chunkOverlap = 200 } = options;

    // Extract text
    const text = await this.extractText(file);

    // Save document
    const doc = this.saveDocument({
      knowledgeBaseId,
      name: file.name,
      type: file.type || 'text/plain',
      size: file.size,
      content: text,
      status: 'processing',
    });

    // Chunk text
    const textChunks = this.chunkText(text, chunkSize, chunkOverlap);

    // Create chunk objects
    const chunks = textChunks.map((content, index) => ({
      id: `chunk-${doc.id}-${index}`,
      knowledgeBaseId,
      documentId: doc.id,
      index,
      content,
      embedding: null, // Would be generated by embedding service
      createdAt: Date.now(),
    }));

    // Save chunks
    this.saveChunks(chunks);

    // Update document status
    const docs = this.getAllDocuments();
    const docIndex = docs.findIndex(d => d.id === doc.id);
    if (docIndex >= 0) {
      docs[docIndex].status = 'completed';
      docs[docIndex].chunks = chunks.length;
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    }

    return {
      document: doc,
      chunks: chunks.length,
    };
  }

  /**
   * Search across knowledge base
   */
  searchKnowledgeBase(kbId, query) {
    const docs = this.getDocumentsByKB(kbId);
    const results = [];

    docs.forEach(doc => {
      if (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())) {
        // Find matching chunks
        const chunks = this.getChunksByDocument(doc.id);
        const matchingChunks = chunks.filter(chunk =>
          chunk.content.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingChunks.length > 0) {
          results.push({
            document: doc,
            matches: matchingChunks.length,
            preview: matchingChunks[0].content.substring(0, 200),
          });
        }
      }
    });

    return results;
  }
}

export default new KnowledgeBaseStorage();
