/**
 * GCP Auth Status Checker
 * Checks if Application Default Credentials are expired and need refresh
 */

/**
 * Get the path to Application Default Credentials file
 */
async function getADCPath() {
  const homeDir = await window.electron.os.homedir();
  const platform = await window.electron.os.platform();

  if (platform === 'win32') {
    // Windows: %APPDATA%\gcloud\application_default_credentials.json
    const appData = await window.electron.app.getPath('appData');
    return `${appData}\\gcloud\\application_default_credentials.json`;
  }

  // macOS/Linux: ~/.config/gcloud/application_default_credentials.json
  return `${homeDir}/.config/gcloud/application_default_credentials.json`;
}

/**
 * Check if ADC exists and is valid (not expired)
 * Returns status object with detailed information
 */
export async function checkAuthStatus() {
  try {
    const adcPath = await getADCPath();

    // Check if file exists
    const exists = await window.electron.fs.exists(adcPath);

    if (!exists) {
      return {
        valid: false,
        expired: false,
        missing: true,
        message: 'Application Default Credentials not found. Please authenticate with Google Cloud.',
        action: 'authenticate'
      };
    }

    // Read credentials file
    const credentials = await window.electron.fs.readJSON(adcPath);

    // Check credential type
    if (credentials.type === 'service_account') {
      // Service account credentials don't expire
      return {
        valid: true,
        expired: false,
        missing: false,
        type: 'service_account',
        message: 'Using service account credentials'
      };
    }

    // For authorized_user credentials, check expiry
    if (credentials.type === 'authorized_user') {
      // If there's a refresh_token, we can refresh automatically
      if (credentials.refresh_token) {
        return {
          valid: true,
          expired: false,
          missing: false,
          type: 'authorized_user',
          hasRefreshToken: true,
          message: 'Credentials are valid and can be refreshed automatically'
        };
      }

      // No refresh token means we need to re-authenticate
      return {
        valid: false,
        expired: true,
        missing: false,
        type: 'authorized_user',
        hasRefreshToken: false,
        message: 'Credentials have expired. Please re-authenticate with Google Cloud.',
        action: 'reauthenticate'
      };
    }

    // Unknown credential type
    return {
      valid: false,
      expired: false,
      missing: false,
      type: credentials.type || 'unknown',
      message: 'Unknown credential type. Please re-authenticate with Google Cloud.',
      action: 'reauthenticate'
    };

  } catch (error) {
    console.error('[AuthStatus] Error checking auth status:', error);

    return {
      valid: false,
      expired: false,
      error: true,
      message: `Error checking authentication: ${error.message}`,
      action: 'authenticate'
    };
  }
}

/**
 * Test if we can get an access token (validates auth works end-to-end)
 */
export async function testAuthConnection() {
  try {
    const token = await window.electron.gcp.getAccessToken();

    if (token && token.length > 0) {
      return {
        success: true,
        message: 'Successfully retrieved access token'
      };
    }

    return {
      success: false,
      message: 'Failed to retrieve access token'
    };

  } catch (error) {
    console.error('[AuthStatus] Error testing auth connection:', error);

    return {
      success: false,
      message: error.message || 'Failed to authenticate',
      error: error
    };
  }
}

/**
 * Get auth setup command based on platform
 */
export function getAuthCommand() {
  return 'gcloud auth application-default login';
}

/**
 * Get instructions for setting up gcloud auth
 */
export function getAuthInstructions() {
  return {
    title: 'Google Cloud Authentication Required',
    steps: [
      {
        number: 1,
        description: 'Open your terminal or command prompt'
      },
      {
        number: 2,
        description: 'Run the following command:',
        command: getAuthCommand(),
        copyable: true
      },
      {
        number: 3,
        description: 'Sign in with your Google account when prompted'
      },
      {
        number: 4,
        description: 'Return to Aether and click "I\'ve Authenticated"'
      }
    ],
    alternativeTitle: 'Alternative: Service Account',
    alternative: 'You can also use a service account JSON key file. Download it from the Google Cloud Console and configure it in Settings.'
  };
}
