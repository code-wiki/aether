/**
 * Sample data for Knowledge Bases and Tools
 */

export const sampleKnowledgeBases = [
  {
    id: 'kb-sample-1',
    name: 'Product Documentation',
    description: 'Technical documentation for our flagship product including API references, user guides, and troubleshooting',
    icon: '📚',
    embeddingModel: 'text-embedding-004', // Using Gemini
    chunkSize: 1000,
    chunkOverlap: 200,
    createdAt: Date.now() - 7 * 86400000, // 7 days ago
    updatedAt: Date.now() - 2 * 86400000,
    documents: 12,
    size: '3.2 MB',
    totalChunks: 245,
    pinned: true,
  },
  {
    id: 'kb-sample-2',
    name: 'Customer Support FAQs',
    description: 'Common questions and answers from customer support tickets, best practices, and solutions',
    icon: '💬',
    embeddingModel: 'text-embedding-3-small', // Using OpenAI Small
    chunkSize: 1000,
    chunkOverlap: 200,
    createdAt: Date.now() - 14 * 86400000, // 14 days ago
    updatedAt: Date.now() - 1 * 86400000,
    documents: 45,
    size: '8.7 MB',
    totalChunks: 567,
    pinned: false,
  },
  {
    id: 'kb-sample-3',
    name: 'Company Policies',
    description: 'HR policies, code of conduct, security guidelines, and compliance documentation',
    icon: '📝',
    embeddingModel: 'text-multilingual-embedding-002', // Using Gemini Multilingual
    chunkSize: 1500,
    chunkOverlap: 300,
    createdAt: Date.now() - 30 * 86400000, // 30 days ago
    updatedAt: Date.now() - 5 * 86400000,
    documents: 23,
    size: '5.1 MB',
    totalChunks: 342,
    pinned: false,
  },
  {
    id: 'kb-sample-4',
    name: 'Research Papers',
    description: 'Academic papers on AI, machine learning, and natural language processing',
    icon: '🔬',
    embeddingModel: 'text-embedding-3-large', // Using OpenAI Large
    chunkSize: 2000,
    chunkOverlap: 400,
    createdAt: Date.now() - 60 * 86400000, // 60 days ago
    updatedAt: Date.now() - 10 * 86400000,
    documents: 8,
    size: '12.4 MB',
    totalChunks: 456,
    pinned: true,
  },
];

export const sampleDocuments = [
  // Product Documentation KB
  {
    id: 'doc-1',
    knowledgeBaseId: 'kb-sample-1',
    name: 'API Reference Guide.pdf',
    type: 'application/pdf',
    size: 524288, // 512 KB
    status: 'completed',
    chunks: 45,
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'doc-2',
    knowledgeBaseId: 'kb-sample-1',
    name: 'Getting Started Guide.md',
    type: 'text/markdown',
    size: 102400, // 100 KB
    status: 'completed',
    chunks: 15,
    createdAt: Date.now() - 6 * 86400000,
    updatedAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'doc-3',
    knowledgeBaseId: 'kb-sample-1',
    name: 'Troubleshooting Common Issues.txt',
    type: 'text/plain',
    size: 81920, // 80 KB
    status: 'completed',
    chunks: 12,
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },

  // Customer Support FAQs KB
  {
    id: 'doc-4',
    knowledgeBaseId: 'kb-sample-2',
    name: 'Account Management FAQs.pdf',
    type: 'application/pdf',
    size: 204800, // 200 KB
    status: 'completed',
    chunks: 28,
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'doc-5',
    knowledgeBaseId: 'kb-sample-2',
    name: 'Billing and Payments.md',
    type: 'text/markdown',
    size: 153600, // 150 KB
    status: 'completed',
    chunks: 22,
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'doc-6',
    knowledgeBaseId: 'kb-sample-2',
    name: 'Technical Support Solutions.txt',
    type: 'text/plain',
    size: 256000, // 250 KB
    status: 'completed',
    chunks: 38,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },

  // Company Policies KB
  {
    id: 'doc-7',
    knowledgeBaseId: 'kb-sample-3',
    name: 'Employee Handbook 2024.pdf',
    type: 'application/pdf',
    size: 1048576, // 1 MB
    status: 'completed',
    chunks: 85,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'doc-8',
    knowledgeBaseId: 'kb-sample-3',
    name: 'Security Best Practices.md',
    type: 'text/markdown',
    size: 122880, // 120 KB
    status: 'completed',
    chunks: 18,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 25 * 86400000,
  },

  // Research Papers KB
  {
    id: 'doc-9',
    knowledgeBaseId: 'kb-sample-4',
    name: 'Attention Is All You Need.pdf',
    type: 'application/pdf',
    size: 2097152, // 2 MB
    status: 'completed',
    chunks: 124,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'doc-10',
    knowledgeBaseId: 'kb-sample-4',
    name: 'BERT - Pre-training of Deep Bidirectional Transformers.pdf',
    type: 'application/pdf',
    size: 1572864, // 1.5 MB
    status: 'completed',
    chunks: 95,
    createdAt: Date.now() - 55 * 86400000,
    updatedAt: Date.now() - 55 * 86400000,
  },
];

export const sampleChunks = [
  // Chunks for doc-1 (API Reference Guide.pdf)
  {
    id: 'chunk-1-1',
    documentId: 'doc-1',
    knowledgeBaseId: 'kb-sample-1',
    content: 'API Authentication\n\nAll API requests require authentication using an API key. Include your API key in the Authorization header:\n\nAuthorization: Bearer YOUR_API_KEY\n\nAPI keys can be generated from your account dashboard. Keep your API keys secure and never share them publicly.',
    chunkIndex: 0,
    metadata: { section: 'Authentication', page: 1 },
    embedding: null,
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'chunk-1-2',
    documentId: 'doc-1',
    knowledgeBaseId: 'kb-sample-1',
    content: 'Rate Limits\n\nThe API enforces the following rate limits:\n- Free tier: 100 requests per hour\n- Pro tier: 1,000 requests per hour\n- Enterprise: Custom limits\n\nIf you exceed your rate limit, you will receive a 429 Too Many Requests response. The response includes a Retry-After header indicating when you can make requests again.',
    chunkIndex: 1,
    metadata: { section: 'Rate Limits', page: 2 },
    embedding: null,
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'chunk-1-3',
    documentId: 'doc-1',
    knowledgeBaseId: 'kb-sample-1',
    content: 'GET /api/users\n\nRetrieve a list of users in your organization.\n\nParameters:\n- page (optional): Page number for pagination (default: 1)\n- limit (optional): Number of results per page (default: 20, max: 100)\n- sort (optional): Sort field (created_at, name, email)\n\nResponse: Returns an array of user objects with id, name, email, role, and created_at fields.',
    chunkIndex: 2,
    metadata: { section: 'Users API', page: 5 },
    embedding: null,
    createdAt: Date.now() - 7 * 86400000,
  },

  // Chunks for doc-2 (Getting Started Guide.md)
  {
    id: 'chunk-2-1',
    documentId: 'doc-2',
    knowledgeBaseId: 'kb-sample-1',
    content: 'Getting Started with Our Platform\n\nWelcome! This guide will help you get up and running in minutes.\n\nStep 1: Create an Account\nVisit our signup page and create your account. You\'ll receive a confirmation email - click the link to verify your email address.\n\nStep 2: Set Up Your Workspace\nOnce logged in, create your first workspace. A workspace is where you and your team collaborate on projects.',
    chunkIndex: 0,
    metadata: { section: 'Introduction' },
    embedding: null,
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'chunk-2-2',
    documentId: 'doc-2',
    knowledgeBaseId: 'kb-sample-1',
    content: 'Step 3: Install the SDK\n\nFor JavaScript/Node.js:\nnpm install @ourplatform/sdk\n\nFor Python:\npip install ourplatform-sdk\n\nFor other languages, check our documentation.\n\nStep 4: Initialize the Client\n\nconst client = require(\'@ourplatform/sdk\');\nclient.init({ apiKey: \'YOUR_API_KEY\' });',
    chunkIndex: 1,
    metadata: { section: 'Installation' },
    embedding: null,
    createdAt: Date.now() - 6 * 86400000,
  },

  // Chunks for doc-4 (Account Management FAQs.pdf)
  {
    id: 'chunk-4-1',
    documentId: 'doc-4',
    knowledgeBaseId: 'kb-sample-2',
    content: 'Frequently Asked Questions: Account Management\n\nQ: How do I reset my password?\nA: Click the "Forgot Password" link on the login page. Enter your email address and we\'ll send you a reset link. The link expires after 24 hours.\n\nQ: Can I change my email address?\nA: Yes, go to Settings > Account > Email. Enter your new email and confirm with your password. You\'ll need to verify the new email address.',
    chunkIndex: 0,
    metadata: { section: 'Account Basics' },
    embedding: null,
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'chunk-4-2',
    documentId: 'doc-4',
    knowledgeBaseId: 'kb-sample-2',
    content: 'Q: How do I delete my account?\nA: We\'re sorry to see you go! To delete your account:\n1. Go to Settings > Account > Danger Zone\n2. Click "Delete Account"\n3. Confirm by typing your email address\n4. All your data will be permanently deleted within 30 days\n\nNote: This action cannot be undone. Consider exporting your data first.',
    chunkIndex: 1,
    metadata: { section: 'Account Deletion' },
    embedding: null,
    createdAt: Date.now() - 14 * 86400000,
  },

  // Chunks for doc-7 (Employee Handbook 2024.pdf)
  {
    id: 'chunk-7-1',
    documentId: 'doc-7',
    knowledgeBaseId: 'kb-sample-3',
    content: 'Employee Handbook 2024\n\nWelcome to Our Company!\n\nThis handbook outlines our company policies, benefits, and expectations. Please read it carefully and keep it for reference.\n\nOur Mission: To innovate and deliver exceptional products that improve people\'s lives.\n\nOur Values:\n- Integrity: We do the right thing, even when it\'s hard\n- Innovation: We constantly seek better ways\n- Collaboration: We succeed together\n- Excellence: We set high standards',
    chunkIndex: 0,
    metadata: { section: 'Introduction', page: 1 },
    embedding: null,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'chunk-7-2',
    documentId: 'doc-7',
    knowledgeBaseId: 'kb-sample-3',
    content: 'Work Hours and Flexibility\n\nCore Hours: 10 AM - 3 PM (required)\nFlexible Hours: You may adjust your start and end times outside core hours\n\nRemote Work Policy:\n- Hybrid employees: Minimum 2 days per week in office\n- Fully remote employees: Must attend quarterly team meetings\n- All employees: Maintain regular communication with team\n\nTime Off:\n- 20 days paid vacation per year\n- 10 sick days per year\n- 12 company holidays',
    chunkIndex: 1,
    metadata: { section: 'Work Schedule', page: 8 },
    embedding: null,
    createdAt: Date.now() - 30 * 86400000,
  },

  // Chunks for doc-9 (Attention Is All You Need.pdf)
  {
    id: 'chunk-9-1',
    documentId: 'doc-9',
    knowledgeBaseId: 'kb-sample-4',
    content: 'Attention Is All You Need\n\nAbstract\n\nThe dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    chunkIndex: 0,
    metadata: { section: 'Abstract', page: 1 },
    embedding: null,
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'chunk-9-2',
    documentId: 'doc-9',
    knowledgeBaseId: 'kb-sample-4',
    content: 'The Transformer Architecture\n\nThe Transformer follows the overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.\n\nEncoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism and a position-wise fully connected feed-forward network. We employ a residual connection around each sub-layer, followed by layer normalization.',
    chunkIndex: 1,
    metadata: { section: 'Architecture', page: 3 },
    embedding: null,
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'chunk-9-3',
    documentId: 'doc-9',
    knowledgeBaseId: 'kb-sample-4',
    content: 'Scaled Dot-Product Attention\n\nWe call our particular attention "Scaled Dot-Product Attention". The input consists of queries and keys of dimension dk, and values of dimension dv. We compute the dot products of the query with all keys, divide each by √dk, and apply a softmax function to obtain the weights on the values.\n\nAttention(Q, K, V) = softmax(QK^T / √dk)V',
    chunkIndex: 2,
    metadata: { section: 'Attention Mechanism', page: 4 },
    embedding: null,
    createdAt: Date.now() - 60 * 86400000,
  },
];

export const sampleMCPServers = [
  {
    id: 'mcp-sample-1',
    name: 'GitHub',
    description: 'Manage repositories, issues, and pull requests',
    icon: '🐙',
    category: 'Developer',
    author: 'Anthropic',
    type: 'MCP Server',
    provider: 'GitHub',
    status: 'active',
    installedAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
    pinned: true,
    config: {
      token: '***REDACTED***',
      owner: 'my-organization',
    },
    configFields: [
      { name: 'token', label: 'GitHub Token', type: 'password', required: true },
      { name: 'owner', label: 'Default Owner', type: 'text', default: '' },
    ],
  },
  {
    id: 'mcp-sample-2',
    name: 'Brave Search',
    description: 'Search the web using Brave Search API',
    icon: '🔍',
    category: 'Web',
    author: 'Community',
    type: 'MCP Server',
    provider: 'Brave',
    status: 'active',
    installedAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
    pinned: false,
    config: {
      apiKey: '***REDACTED***',
      safeSearch: true,
    },
    configFields: [
      { name: 'apiKey', label: 'Brave API Key', type: 'password', required: true },
      { name: 'safeSearch', label: 'Safe Search', type: 'boolean', default: true },
    ],
  },
  {
    id: 'mcp-sample-3',
    name: 'Slack',
    description: 'Send messages and read channels',
    icon: '💬',
    category: 'Communication',
    author: 'Community',
    type: 'MCP Server',
    provider: 'Slack',
    status: 'inactive',
    installedAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
    pinned: false,
    config: {
      token: '***REDACTED***',
      defaultChannel: 'general',
    },
    configFields: [
      { name: 'token', label: 'Slack Bot Token', type: 'password', required: true },
      { name: 'defaultChannel', label: 'Default Channel', type: 'text', default: 'general' },
    ],
  },
];

/**
 * Initialize sample data in localStorage
 */
export function initializeSampleData() {
  const KB_STORAGE_KEY = 'aether_knowledge_bases';
  const DOCUMENTS_STORAGE_KEY = 'aether_kb_documents';
  const CHUNKS_STORAGE_KEY = 'aether_kb_chunks';
  const MCP_SERVERS_STORAGE_KEY = 'aether_mcp_servers';

  // Check if data already exists
  const existingKBs = localStorage.getItem(KB_STORAGE_KEY);
  const existingDocs = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
  const existingChunks = localStorage.getItem(CHUNKS_STORAGE_KEY);
  const existingMCPs = localStorage.getItem(MCP_SERVERS_STORAGE_KEY);

  // Only initialize if no data exists
  if (!existingKBs || JSON.parse(existingKBs).length === 0) {
    localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(sampleKnowledgeBases));
    console.log('✅ Sample knowledge bases initialized');
  }

  if (!existingDocs || JSON.parse(existingDocs).length === 0) {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(sampleDocuments));
    console.log('✅ Sample documents initialized');
  }

  if (!existingChunks || JSON.parse(existingChunks).length === 0) {
    localStorage.setItem(CHUNKS_STORAGE_KEY, JSON.stringify(sampleChunks));
    console.log('✅ Sample document chunks initialized');
  }

  if (!existingMCPs || JSON.parse(existingMCPs).length === 0) {
    localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(sampleMCPServers));
    console.log('✅ Sample MCP servers initialized');
  }

  // Trigger storage event to refresh UI
  window.dispatchEvent(new Event('storage'));
}

/**
 * Clear all sample data
 */
export function clearSampleData() {
  const KB_STORAGE_KEY = 'aether_knowledge_bases';
  const DOCUMENTS_STORAGE_KEY = 'aether_kb_documents';
  const CHUNKS_STORAGE_KEY = 'aether_kb_chunks';
  const MCP_SERVERS_STORAGE_KEY = 'aether_mcp_servers';

  localStorage.removeItem(KB_STORAGE_KEY);
  localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
  localStorage.removeItem(CHUNKS_STORAGE_KEY);
  localStorage.removeItem(MCP_SERVERS_STORAGE_KEY);

  console.log('🗑️ All sample data cleared');

  // Trigger storage event to refresh UI
  window.dispatchEvent(new Event('storage'));
}
