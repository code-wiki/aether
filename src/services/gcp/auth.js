/**
 * GCP Authentication Service
 * Handles Application Default Credentials (ADC) detection and validation
 *
 * Features:
 * - Auto-detect gcloud CLI credentials
 * - Extract project ID from credentials
 * - OS-specific path handling (macOS/Windows/Linux)
 * - Validate credentials with GCP
 * - Clear error messages with fix instructions
 */

/**
 * GCP ADC Paths by OS
 */
const getADCPath = async () => {
  const homeDir = await window.electron?.os?.homedir();

  // Platform-specific paths
  const platform = await window.electron?.os?.platform();

  switch (platform) {
    case 'win32':
      return `${homeDir}\\AppData\\Roaming\\gcloud\\application_default_credentials.json`;
    case 'darwin':
    case 'linux':
    default:
      return `${homeDir}/.config/gcloud/application_default_credentials.json`;
  }
};

/**
 * Detect Application Default Credentials
 * @returns {Promise<{success: boolean, credentialsPath?: string, projectId?: string, error?: string}>}
 */
export const detectADC = async () => {
  try {
    const adcPath = await getADCPath();

    // Check if file exists (via Electron IPC)
    if (!window.electron?.fs) {
      return {
        success: false,
        error: 'Electron filesystem API not available',
        instructions: 'Please restart the application',
      };
    }

    const exists = await window.electron.fs.exists(adcPath);

    if (!exists) {
      return {
        success: false,
        error: 'Application Default Credentials not found',
        instructions: 'Run: gcloud auth application-default login',
        adcPath,
      };
    }

    // Read credentials file
    const credentials = await window.electron.fs.readJSON(adcPath);

    // Extract project ID (multiple possible fields)
    let projectId = credentials.quota_project_id ||
                    credentials.project_id ||
                    null;

    // If no project ID in credentials, try to get from gcloud config as fallback
    if (!projectId && window.electron?.shell) {
      try {
        const result = await window.electron.shell.exec('gcloud config get-value project');
        if (result.success && result.stdout?.trim()) {
          projectId = result.stdout.trim();
          console.log('Project ID detected from gcloud config:', projectId);

          // Auto-set quota project in ADC for future use
          try {
            await window.electron.shell.exec(`gcloud auth application-default set-quota-project ${projectId}`);
            console.log('Auto-configured quota_project_id in ADC');
          } catch (setErr) {
            console.warn('Failed to auto-set quota_project_id:', setErr);
          }
        }
      } catch (gcloudErr) {
        console.warn('Failed to get project from gcloud config:', gcloudErr);
      }
    }

    if (!projectId) {
      return {
        success: false,
        error: 'Project ID not found in credentials or gcloud config',
        instructions: 'Set quota_project_id: gcloud auth application-default set-quota-project PROJECT_ID',
        credentialsPath: adcPath,
      };
    }

    // Validate credential type
    if (credentials.type !== 'authorized_user' && credentials.type !== 'service_account') {
      return {
        success: false,
        error: `Unsupported credential type: ${credentials.type}`,
        instructions: 'Use authorized_user or service_account credentials',
        credentialsPath: adcPath,
      };
    }

    return {
      success: true,
      credentialsPath: adcPath,
      projectId,
      credentialType: credentials.type,
      clientEmail: credentials.client_email,
      autoConfigured: !credentials.quota_project_id, // Flag if we auto-configured it
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to detect ADC',
      instructions: 'Run: gcloud auth application-default login',
    };
  }
};

/**
 * Validate GCP credentials by making a test API call
 * @param {string} projectId - GCP project ID
 * @param {string} location - GCP location (e.g., 'us-central1')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const validateCredentials = async (projectId, location = 'us-central1') => {
  try {
    // This will be called after Vertex AI is initialized
    // For now, just check if projectId is valid format
    if (!projectId || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
      return {
        success: false,
        error: 'Invalid project ID format',
      };
    }

    // TODO: Make actual test API call to Vertex AI
    // For now, assume valid if ADC detected
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to validate credentials',
    };
  }
};

/**
 * Get setup instructions based on platform
 * @returns {string[]} - Array of setup instruction steps
 */
export const getSetupInstructions = () => {
  // Try to detect platform synchronously if possible
  // Fallback to generic instructions if detection fails
  let platform = 'generic';

  // Check user agent as fallback for platform detection
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      platform = 'darwin';
    } else if (userAgent.includes('win')) {
      platform = 'win32';
    } else if (userAgent.includes('linux')) {
      platform = 'linux';
    }
  }

  const baseInstructions = [
    '1. Install Google Cloud SDK:',
    '   https://cloud.google.com/sdk/docs/install',
    '',
    '2. Initialize gcloud CLI:',
    '   gcloud init',
    '',
    '3. Authenticate with Application Default Credentials:',
    '   gcloud auth application-default login',
    '',
    '4. Set quota project (if needed):',
    '   gcloud auth application-default set-quota-project YOUR_PROJECT_ID',
    '',
    '5. Restart Aether',
  ];

  if (platform === 'darwin') {
    return [
      'macOS Setup:',
      '',
      'Install gcloud CLI via Homebrew:',
      '   brew install --cask google-cloud-sdk',
      '',
      ...baseInstructions.slice(1),
    ];
  } else if (platform === 'win32') {
    return [
      'Windows Setup:',
      '',
      'Download and install Google Cloud SDK:',
      '   https://cloud.google.com/sdk/docs/install#windows',
      '',
      ...baseInstructions.slice(1),
    ];
  }

  return baseInstructions;
};

/**
 * Check if gcloud CLI is installed
 * @returns {Promise<{installed: boolean, version?: string}>}
 */
export const checkGCloudInstalled = async () => {
  try {
    if (!window.electron?.shell) {
      return { installed: false };
    }

    const result = await window.electron.shell.exec('gcloud --version');

    if (result.success && result.stdout) {
      const versionMatch = result.stdout.match(/Google Cloud SDK ([\d.]+)/);
      return {
        installed: true,
        version: versionMatch ? versionMatch[1] : 'unknown',
      };
    }

    return { installed: false };
  } catch (err) {
    return { installed: false };
  }
};

/**
 * GCP Locations (regions)
 */
export const GCP_LOCATIONS = [
  { id: 'us-central1', name: 'US Central (Iowa)', flag: '🇺🇸' },
  { id: 'us-east4', name: 'US East (N. Virginia)', flag: '🇺🇸' },
  { id: 'us-west1', name: 'US West (Oregon)', flag: '🇺🇸' },
  { id: 'us-west4', name: 'US West (Las Vegas)', flag: '🇺🇸' },
  { id: 'europe-west1', name: 'Europe West (Belgium)', flag: '🇪🇺' },
  { id: 'europe-west4', name: 'Europe West (Netherlands)', flag: '🇪🇺' },
  { id: 'asia-northeast1', name: 'Asia Northeast (Tokyo)', flag: '🇯🇵' },
  { id: 'asia-southeast1', name: 'Asia Southeast (Singapore)', flag: '🇸🇬' },
];

/**
 * Auto-detect optimal GCP region based on gcloud config or defaults
 * @returns {Promise<string>} - Region ID
 */
export const detectOptimalRegion = async () => {
  try {
    // Try to get region from gcloud config
    if (window.electron?.shell) {
      const result = await window.electron.shell.exec('gcloud config get-value compute/region');
      if (result.success && result.stdout?.trim()) {
        const region = result.stdout.trim();
        // Verify it's a valid Vertex AI region
        if (GCP_LOCATIONS.some(loc => loc.id === region)) {
          return region;
        }
      }
    }

    // Fallback to us-central1 (most common, lowest latency for US)
    return 'us-central1';
  } catch (err) {
    console.warn('Failed to detect region:', err);
    return 'us-central1';
  }
};

export default {
  detectADC,
  validateCredentials,
  getSetupInstructions,
  checkGCloudInstalled,
  GCP_LOCATIONS,
};
