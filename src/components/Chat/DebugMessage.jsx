import React from 'react';

/**
 * DebugMessage - Shows raw message content for debugging
 * Add this temporarily to MessageCard to see what's actually stored
 */
function DebugMessage({ message }) {
  return (
    <details className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
      <summary className="cursor-pointer font-semibold text-yellow-900 dark:text-yellow-100">
        🐛 Debug Info (Click to expand)
      </summary>
      <div className="mt-2 space-y-2">
        <div>
          <strong>Content Type:</strong>{' '}
          <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
            {typeof message.content}
          </code>
        </div>
        <div>
          <strong>Content Length:</strong>{' '}
          <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
            {message.content?.length || 0} chars
          </code>
        </div>
        <div>
          <strong>First 200 chars:</strong>
          <pre className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(message.content?.substring(0, 200))}
          </pre>
        </div>
        <div>
          <strong>Raw Content (JSON):</strong>
          <pre className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded overflow-x-auto text-xs max-h-64">
            {JSON.stringify(message.content, null, 2)}
          </pre>
        </div>
      </div>
    </details>
  );
}

export default DebugMessage;
