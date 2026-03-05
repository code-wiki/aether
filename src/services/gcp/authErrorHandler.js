/**
 * Global GCP Authentication Error Handler
 * Handles auth failures during API calls by signing out the user
 */

/**
 * Check if an error is authentication-related
 */
export function isAuthError(error) {
  if (!error) return false;

  const errorMessage = error.message || error.toString();
  const errorStatus = error.status || error.statusCode;

  // Check for HTTP auth errors
  if (errorStatus === 401 || errorStatus === 403) {
    return true;
  }

  // Check for common auth error messages
  const authErrorPatterns = [
    /unauthorized/i,
    /unauthenticated/i,
    /invalid.*credentials/i,
    /authentication.*failed/i,
    /access.*denied/i,
    /permission.*denied/i,
    /invalid.*token/i,
    /token.*expired/i,
    /refresh.*token/i,
  ];

  return authErrorPatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Handle authentication error by signing out the user
 * Returns them to the welcome screen to re-authenticate
 */
export function handleAuthError(error) {
  console.error('[AuthErrorHandler] GCP authentication error detected:', error);

  // Clear authentication state
  localStorage.removeItem('aether:welcomeCompleted');
  localStorage.removeItem('aether:lastAuthCheck');

  // Clear token cache in main process
  if (window.electron?.gcp?.clearTokenCache) {
    window.electron.gcp.clearTokenCache();
  }

  // Dispatch custom event to notify App component
  const event = new CustomEvent('gcp-auth-error', {
    detail: { error }
  });
  window.dispatchEvent(event);

  console.log('[AuthErrorHandler] User signed out - returning to welcome screen');
}

export default {
  isAuthError,
  handleAuthError,
};
