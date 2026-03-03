const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const Store = require('electron-store');
const { createMenu } = require('./menu');

const execAsync = promisify(exec);

const store = new Store();
let mainWindow;

const isDev = process.env.NODE_ENV !== 'production' || process.argv.includes('--dev');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FFFFFF',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: isDev ? false : true, // Disable CORS in dev for API calls
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  createMenu(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================
// IPC Handlers
// ============================================

// Settings handlers
ipcMain.handle('settings:get', async () => {
  return store.store;
});

ipcMain.handle('settings:update', async (event, settings) => {
  Object.keys(settings).forEach(key => {
    store.set(key, settings[key]);
  });
  return { success: true };
});

ipcMain.handle('settings:get-key', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('settings:set-key', async (event, key, value) => {
  store.set(key, value);
  return { success: true };
});

ipcMain.handle('settings:delete-key', async (event, key) => {
  store.delete(key);
  return { success: true };
});

// File dialog handlers
ipcMain.handle('dialog:open-file', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('dialog:save-file', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// Window control handlers
ipcMain.handle('window:minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow.close();
});

// Theme handler
ipcMain.handle('theme:toggle', (event, theme) => {
  store.set('theme', theme);
  return { success: true, theme };
});

// App info
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app:get-path', (event, name) => {
  return app.getPath(name);
});

// ============================================
// GCP & Filesystem Handlers
// ============================================

// Filesystem handlers (secure, sandboxed)
ipcMain.handle('fs:exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('fs:read-json', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Failed to read JSON file: ${err.message}`);
  }
});

ipcMain.handle('fs:read-text', async (event, filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`);
  }
});

// OS info handlers
ipcMain.handle('os:homedir', () => {
  return os.homedir();
});

ipcMain.handle('os:platform', () => {
  return process.platform;
});

// Shell execution (for checking gcloud CLI)
ipcMain.handle('shell:exec', async (event, command) => {
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      stdout: err.stdout?.trim() || '',
      stderr: err.stderr?.trim() || '',
    };
  }
});

// ============================================
// GCP Authentication Handlers (Node.js only)
// ============================================

let gcpAuthInstance = null;
let gcpAccessToken = null;
let gcpTokenExpiry = null;

/**
 * Helper function to get a valid GCP access token
 */
async function getGCPAccessToken(scopes = ['https://www.googleapis.com/auth/cloud-platform']) {
  try {
    // Check if we have a valid cached token
    if (gcpAccessToken && gcpTokenExpiry && Date.now() < gcpTokenExpiry) {
      return {
        success: true,
        token: gcpAccessToken,
        cached: true,
      };
    }

    // Dynamically import GoogleAuth (only works in Node.js)
    const { GoogleAuth } = await import('google-auth-library');

    // Initialize auth if needed
    if (!gcpAuthInstance) {
      gcpAuthInstance = new GoogleAuth({ scopes });
    }

    // Get access token
    const client = await gcpAuthInstance.getClient();
    const tokenResponse = await client.getAccessToken();

    if (!tokenResponse.token) {
      throw new Error('Failed to obtain access token');
    }

    // Cache the token (expires in ~1 hour, refresh 5 min early)
    gcpAccessToken = tokenResponse.token;
    gcpTokenExpiry = Date.now() + (55 * 60 * 1000); // 55 minutes

    return {
      success: true,
      token: tokenResponse.token,
      cached: false,
    };
  } catch (err) {
    console.error('GCP auth error:', err);
    return {
      success: false,
      error: err.message || 'Failed to get access token',
    };
  }
}

ipcMain.handle('gcp:get-access-token', async (event, scopes = ['https://www.googleapis.com/auth/cloud-platform']) => {
  return await getGCPAccessToken(scopes);
});

// Clear cached GCP token (useful for debugging or switching accounts)
ipcMain.handle('gcp:clear-token-cache', () => {
  gcpAccessToken = null;
  gcpTokenExpiry = null;
  gcpAuthInstance = null;
  return { success: true };
});

// ============================================
// Vertex AI Discovery Handlers
// ============================================

/**
 * Fetch available GCP locations for Vertex AI
 */
ipcMain.handle('vertex-ai:fetch-locations', async (event, projectId) => {
  try {
    // Get access token
    const tokenResult = await getGCPAccessToken();
    if (!tokenResult.success) {
      throw new Error(tokenResult.error || 'Failed to get access token');
    }

    // Fetch from Node.js (bypasses CORS)
    const fetch = (await import('node-fetch')).default;
    const url = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('[Main] Fetch locations error:', err);
    return { success: false, error: err.message };
  }
});

/**
 * Fetch Gemini models for a specific location
 */
ipcMain.handle('vertex-ai:fetch-gemini-models', async (event, projectId, location) => {
  try {
    // Get access token
    const tokenResult = await getGCPAccessToken();
    if (!tokenResult.success) {
      throw new Error(tokenResult.error || 'Failed to get access token');
    }

    // Fetch from Node.js (bypasses CORS)
    const fetch = (await import('node-fetch')).default;
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('[Main] Fetch Gemini models error:', err);
    return { success: false, error: err.message };
  }
});

/**
 * Fetch Claude models for a specific location
 */
ipcMain.handle('vertex-ai:fetch-claude-models', async (event, projectId, location) => {
  try {
    // Get access token
    const tokenResult = await getGCPAccessToken();
    if (!tokenResult.success) {
      throw new Error(tokenResult.error || 'Failed to get access token');
    }

    // Fetch from Node.js (bypasses CORS)
    const fetch = (await import('node-fetch')).default;
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('[Main] Fetch Claude models error:', err);
    return { success: false, error: err.message };
  }
});

// ============================================
// AI Streaming Handlers (Gemini & Claude)
// ============================================

/**
 * Stream Gemini response
 */
ipcMain.handle('ai:stream-gemini', async (event, projectId, location, model, messages, config) => {
  try {
    const tokenResult = await getGCPAccessToken();
    if (!tokenResult.success) {
      throw new Error(tokenResult.error || 'Failed to get access token');
    }

    const fetch = (await import('node-fetch')).default;
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:streamGenerateContent`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Gemini API error: ${response.status} - ${errorText}` };
    }

    // Read stream and send chunks back
    const chunks = [];
    const reader = response.body;

    for await (const chunk of reader) {
      chunks.push(chunk);
    }

    const fullResponse = Buffer.concat(chunks).toString();
    return { success: true, data: fullResponse };
  } catch (err) {
    console.error('[Main] Gemini stream error:', err);
    return { success: false, error: err.message };
  }
});

/**
 * Stream Claude response
 */
ipcMain.handle('ai:stream-claude', async (event, projectId, location, model, messages, config) => {
  try {
    const tokenResult = await getGCPAccessToken();
    if (!tokenResult.success) {
      throw new Error(tokenResult.error || 'Failed to get access token');
    }

    const fetch = (await import('node-fetch')).default;
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${model}:streamRawPredict`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anthropic_version: 'vertex-2023-10-16',
        messages: messages,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Claude API error: ${response.status} - ${errorText}` };
    }

    // Read stream and send chunks back
    const chunks = [];
    const reader = response.body;

    for await (const chunk of reader) {
      chunks.push(chunk);
    }

    const fullResponse = Buffer.concat(chunks).toString();
    return { success: true, data: fullResponse };
  } catch (err) {
    console.error('[Main] Claude stream error:', err);
    return { success: false, error: err.message };
  }
});

console.log('Electron main process started');
