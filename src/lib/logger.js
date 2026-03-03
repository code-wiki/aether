// Production-ready logging utility
// Replaces direct console.log calls with structured, environment-aware logging

/**
 * Logger provides structured logging with automatic environment detection.
 * In development: Logs everything to console with styled prefixes
 * In production: Only logs errors and warnings, info/debug are silent
 *
 * Usage:
 * import { logger } from '../lib/logger';
 * logger.info('User logged in', { userId: 123 });
 * logger.error('Failed to fetch', error);
 */

const isDev = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

// ANSI color codes for terminal styling (development only)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, prefix, ...args) => {
  const timestamp = new Date().toISOString();
  const levelColors = {
    DEBUG: colors.gray,
    INFO: colors.blue,
    WARN: colors.yellow,
    ERROR: colors.red,
    SUCCESS: colors.green,
  };

  const color = levelColors[level] || colors.reset;
  const formattedPrefix = prefix ? `[${prefix}]` : '';

  if (isDev) {
    return [
      `${colors.dim}${timestamp}${colors.reset}`,
      `${color}${colors.bright}[${level}]${colors.reset}`,
      `${colors.cyan}${formattedPrefix}${colors.reset}`,
      ...args,
    ];
  }

  return [`[${level}]`, formattedPrefix, ...args];
};

/**
 * Main logger object with leveled logging methods
 */
export const logger = {
  /**
   * Debug logging (verbose, development only)
   * Use for detailed troubleshooting information
   */
  debug: (prefix, ...args) => {
    if (isDev && !isTest) {
      console.debug(...formatMessage('DEBUG', prefix, ...args));
    }
  },

  /**
   * Info logging (general information)
   * Use for normal application flow events
   */
  info: (prefix, ...args) => {
    if (isDev && !isTest) {
      console.log(...formatMessage('INFO', prefix, ...args));
    }
  },

  /**
   * Warning logging (recoverable issues)
   * Logged in both dev and production
   */
  warn: (prefix, ...args) => {
    if (!isTest) {
      console.warn(...formatMessage('WARN', prefix, ...args));
    }
  },

  /**
   * Error logging (critical issues)
   * Always logged, even in production
   */
  error: (prefix, ...args) => {
    console.error(...formatMessage('ERROR', prefix, ...args));

    // In production, send to error tracking service (Sentry, etc.)
    if (!isDev && !isTest) {
      // Error tracking integration point
      if (window.Sentry) {
        window.Sentry.captureException(args[0]);
      }
    }
  },

  /**
   * Success logging (positive outcomes)
   * Development only, for user-facing success messages use Toast
   */
  success: (prefix, ...args) => {
    if (isDev && !isTest) {
      console.log(...formatMessage('SUCCESS', prefix, ...args));
    }
  },

  /**
   * Group logging (collapsible log groups)
   * Development only, for organizing related logs
   */
  group: (label) => {
    if (isDev && !isTest) {
      console.group(`${colors.magenta}${label}${colors.reset}`);
    }
  },

  groupEnd: () => {
    if (isDev && !isTest) {
      console.groupEnd();
    }
  },

  /**
   * Table logging (structured data visualization)
   * Development only, for displaying objects/arrays
   */
  table: (data) => {
    if (isDev && !isTest) {
      console.table(data);
    }
  },

  /**
   * Performance timing
   * Measures execution time of operations
   */
  time: (label) => {
    if (isDev && !isTest) {
      console.time(`⏱️  ${label}`);
    }
  },

  timeEnd: (label) => {
    if (isDev && !isTest) {
      console.timeEnd(`⏱️  ${label}`);
    }
  },
};

/**
 * Create a scoped logger with automatic prefix
 * Useful for component/service-specific logging
 *
 * Usage:
 * const log = createLogger('AIService');
 * log.info('Initializing provider', { provider: 'gemini' });
 */
export const createLogger = (prefix) => ({
  debug: (...args) => logger.debug(prefix, ...args),
  info: (...args) => logger.info(prefix, ...args),
  warn: (...args) => logger.warn(prefix, ...args),
  error: (...args) => logger.error(prefix, ...args),
  success: (...args) => logger.success(prefix, ...args),
  group: (label) => logger.group(`${prefix} - ${label}`),
  groupEnd: logger.groupEnd,
  table: logger.table,
  time: (label) => logger.time(`${prefix} - ${label}`),
  timeEnd: (label) => logger.timeEnd(`${prefix} - ${label}`),
});

/**
 * Migration helper: Map old console.log patterns to logger
 * This helps when refactoring existing code
 *
 * Before: console.log('[Settings]', 'Updated config', config);
 * After:  log.info('Updated config', config);
 */
export const loggerMap = {
  Settings: createLogger('Settings'),
  Conversation: createLogger('Conversation'),
  useAI: createLogger('useAI'),
  AIService: createLogger('AIService'),
  GCPAuth: createLogger('GCPAuth'),
  Storage: createLogger('Storage'),
  ConversationDB: createLogger('ConversationDB'),
};

export default logger;
