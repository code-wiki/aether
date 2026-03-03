import React, { useState } from 'react';

function MessageActions({ message, onBranch, onEdit, onCopy }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleBranch = () => {
    onBranch(message.id);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 md:p-3 min-w-[36px] min-h-[36px] md:min-w-[44px] md:min-h-[44px] rounded hover:bg-surface-elevated transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
        title="Message actions"
        aria-label="Show message actions"
      >
        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-surface-elevated border border-border rounded-lg shadow-2xl z-20 overflow-hidden">
            <button
              onClick={handleCopyText}
              className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy text
            </button>

            <button
              onClick={handleBranch}
              className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Branch from here
            </button>

            {message.role === 'assistant' && (
              <button
                onClick={() => {
                  // Regenerate response
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MessageActions;
