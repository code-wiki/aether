const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Settings API
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings) => ipcRenderer.invoke('settings:update', settings),
    getKey: (key) => ipcRenderer.invoke('settings:get-key', key),
    setKey: (key, value) => ipcRenderer.invoke('settings:set-key', key, value),
    deleteKey: (key) => ipcRenderer.invoke('settings:delete-key', key),
  },

  // Dialog API
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:open-file', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:save-file', options),
  },

  // Window control API
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // Theme API
  theme: {
    toggle: (theme) => ipcRenderer.invoke('theme:toggle', theme),
  },

  // App info API
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPath: (name) => ipcRenderer.invoke('app:get-path', name),
  },

  // Filesystem API (secure, sandboxed)
  fs: {
    exists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
    readJSON: (filePath) => ipcRenderer.invoke('fs:read-json', filePath),
    readText: (filePath) => ipcRenderer.invoke('fs:read-text', filePath),
  },

  // OS info API
  os: {
    homedir: () => ipcRenderer.invoke('os:homedir'),
    platform: () => ipcRenderer.invoke('os:platform'),
  },

  // Shell execution API (for gcloud CLI checks)
  shell: {
    exec: (command) => ipcRenderer.invoke('shell:exec', command),
  },

  // GCP Authentication API (runs in main process Node.js context)
  gcp: {
    getAccessToken: (scopes) => ipcRenderer.invoke('gcp:get-access-token', scopes),
    clearTokenCache: () => ipcRenderer.invoke('gcp:clear-token-cache'),
  },

  // Vertex AI Discovery API (runs in main process to bypass CORS)
  vertexAI: {
    fetchLocations: (projectId) => ipcRenderer.invoke('vertex-ai:fetch-locations', projectId),
    fetchGeminiModels: (projectId, location) => ipcRenderer.invoke('vertex-ai:fetch-gemini-models', projectId, location),
    fetchClaudeModels: (projectId, location) => ipcRenderer.invoke('vertex-ai:fetch-claude-models', projectId, location),
  },

  // Platform info
  platform: process.platform,
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux',
});

console.log('Preload script loaded');
