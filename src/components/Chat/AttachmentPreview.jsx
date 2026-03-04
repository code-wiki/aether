import React, { useState } from 'react';

function AttachmentPreview({ file, onRemove }) {
  const [imageError, setImageError] = useState(false);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('text/')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = file.type.startsWith('image/');
  const shouldShowImage = isImage && !imageError && file.data;

  return (
    <div className="relative inline-block mr-2 mb-2">
      <div className="p-2 bg-surface border border-border rounded-lg flex items-center gap-2 pr-8">
        {shouldShowImage ? (
          <img
            src={file.data}
            alt={file.name}
            className="w-12 h-12 object-cover rounded"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center text-2xl bg-surface-elevated rounded">
            {getFileIcon(file.type)}
          </div>
        )}

        <div className="max-w-[150px]">
          <div className="text-sm text-text-primary truncate" title={file.name}>
            {file.name}
          </div>
          <div className="text-xs text-text-secondary">{formatFileSize(file.size)}</div>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
          aria-label="Remove attachment"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default AttachmentPreview;
