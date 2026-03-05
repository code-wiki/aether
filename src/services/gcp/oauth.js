/**
 * GCP OAuth Flow for Desktop GUI
 * Provides GUI-based authentication instead of terminal
 */

/**
 * Start OAuth flow by opening gcloud auth in the system browser
 * This leverages gcloud CLI but makes it accessible via GUI
 */
export async function startGUIAuthentication() {
  try {
    if (!window.electron?.shell) {
      throw new Error('Electron shell API not available');
    }

    console.log('[OAuth] Starting GUI authentication flow...');

    // Run gcloud auth application-default login
    // This will open the browser automatically and handle the OAuth flow
    const result = await window.electron.shell.exec('gcloud auth application-default login --no-launch-browser');

    // The command will output a URL that the user needs to visit
    // We'll extract it and open it in the default browser
    if (result.stdout) {
      // Extract URL from output (format: "Go to the following link in your browser:")
      const urlMatch = result.stdout.match(/https:\/\/accounts\.google\.com[^\s]+/);

      if (urlMatch && urlMatch[0]) {
        const authUrl = urlMatch[0];
        console.log('[OAuth] Opening authentication URL in browser...');

        // Open in default browser
        await window.electron.shell.exec(`open "${authUrl}"`);

        return {
          success: true,
          message: 'Browser opened for authentication',
          authUrl,
        };
      }
    }

    // Fallback: try with --launch-browser flag (default behavior)
    console.log('[OAuth] Trying with browser auto-launch...');
    const fallbackResult = await window.electron.shell.exec('gcloud auth application-default login');

    return {
      success: true,
      message: 'Authentication started (check your browser)',
    };

  } catch (error) {
    console.error('[OAuth] Error starting authentication:', error);
    return {
      success: false,
      error: error.message || 'Failed to start authentication',
    };
  }
}

/**
 * Alternative: Open browser-based OAuth flow
 * This opens the auth URL directly without using gcloud CLI
 */
export async function openGoogleOAuthInBrowser() {
  try {
    // Google OAuth URL for Application Default Credentials
    // This is the same URL that gcloud CLI uses
    const oauthUrl = 'https://accounts.google.com/o/oauth2/auth?' + new URLSearchParams({
      client_id: '764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com', // gcloud CLI client ID
      redirect_uri: 'http://localhost:8085/',
      scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/appengine.admin https://www.googleapis.com/auth/sqlservice.login https://www.googleapis.com/auth/compute https://www.googleapis.com/auth/accounts.reauth',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    }).toString();

    // Open in default browser (cross-platform)
    const platform = await window.electron.os.platform();
    let openCommand;

    if (platform === 'darwin') {
      openCommand = `open "${oauthUrl}"`;
    } else if (platform === 'win32') {
      openCommand = `start "" "${oauthUrl}"`;
    } else {
      openCommand = `xdg-open "${oauthUrl}"`;
    }

    await window.electron.shell.exec(openCommand);

    return {
      success: true,
      message: 'Browser opened for authentication',
    };

  } catch (error) {
    console.error('[OAuth] Error opening browser:', error);
    return {
      success: false,
      error: error.message || 'Failed to open browser',
    };
  }
}

/**
 * Check if gcloud CLI is installed (required for GUI auth)
 */
export async function checkGCloudAvailable() {
  try {
    const result = await window.electron.shell.exec('gcloud --version');
    return {
      available: result.success,
      version: result.stdout?.match(/Google Cloud SDK ([\d.]+)/)?.[1] || 'unknown',
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
    };
  }
}

/**
 * Poll for credential file changes after auth
 * Used to detect when user completes authentication
 */
export async function waitForCredentials(maxWaitMs = 120000, intervalMs = 2000) {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkInterval = setInterval(async () => {
      try {
        // Check if ADC file exists
        const homeDir = await window.electron.os.homedir();
        const platform = await window.electron.os.platform();

        let adcPath;
        if (platform === 'win32') {
          const appData = await window.electron.app.getPath('appData');
          adcPath = `${appData}\\gcloud\\application_default_credentials.json`;
        } else {
          adcPath = `${homeDir}/.config/gcloud/application_default_credentials.json`;
        }

        const exists = await window.electron.fs.exists(adcPath);

        if (exists) {
          // Verify it has required fields
          const credentials = await window.electron.fs.readJSON(adcPath);

          if (credentials.refresh_token || credentials.type === 'service_account') {
            clearInterval(checkInterval);
            resolve({
              success: true,
              message: 'Credentials detected successfully',
              credentials,
            });
            return;
          }
        }

        // Timeout check
        if (Date.now() - startTime > maxWaitMs) {
          clearInterval(checkInterval);
          resolve({
            success: false,
            timeout: true,
            message: 'Authentication timeout - please try again',
          });
        }

      } catch (error) {
        console.error('[OAuth] Error checking for credentials:', error);
      }
    }, intervalMs);
  });
}

export default {
  startGUIAuthentication,
  openGoogleOAuthInBrowser,
  checkGCloudAvailable,
  waitForCredentials,
};
