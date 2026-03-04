import React, { useState } from 'react';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block-wrapper my-3 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <span className="px-2 py-0.5 text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 rounded uppercase border border-pink-200 dark:border-purple-800">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-xs font-medium rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:shadow-glow-blue-sm transition-all text-neutral-600 dark:text-neutral-400 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-neutral-50 dark:bg-neutral-950">
        <code className={`language-${language || 'text'} text-sm`}>
          {value}
        </code>
      </pre>
    </div>
  );
}

export default CodeBlock;
