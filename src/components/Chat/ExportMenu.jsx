import React, { useState } from 'react';
import exportService from '../../services/storage/exportService';

function ExportMenu({ conversation }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await exportService.saveToFile(conversation, format);
      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export conversation');
    } finally {
      setIsExporting(false);
    }
  };

  if (!conversation) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
        title="Export conversation"
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-surface-elevated border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-text-secondary px-3 py-2">
                Export as
              </div>

              <button
                onClick={() => handleExport('markdown')}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface text-text-primary transition-colors text-sm disabled:opacity-50"
              >
                📄 Markdown (.md)
              </button>

              <button
                onClick={() => handleExport('html')}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface text-text-primary transition-colors text-sm disabled:opacity-50"
              >
                🌐 HTML (.html)
              </button>

              <button
                onClick={() => handleExport('text')}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface text-text-primary transition-colors text-sm disabled:opacity-50"
              >
                📝 Plain Text (.txt)
              </button>

              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface text-text-primary transition-colors text-sm disabled:opacity-50"
              >
                🔧 JSON (.json)
              </button>

              {isExporting && (
                <div className="px-3 py-2 text-xs text-text-secondary text-center">
                  Exporting...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExportMenu;
