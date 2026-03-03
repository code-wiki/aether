import React, { useState } from 'react';

function FileUpload({ onFileSelect, disabled }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = async (files) => {
    const validFiles = [];

    for (const file of files) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Check file type
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/markdown',
        'application/json',
      ];

      if (!validTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported.`);
        continue;
      }

      // Convert to base64
      const base64 = await fileToBase64(file);

      validFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
      });
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        multiple
        accept="image/*,.pdf,.txt,.md,.json"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />

      <label
        htmlFor="file-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          block cursor-pointer p-2 rounded-lg transition-colors
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-surface-elevated'
          }
          ${isDragging ? 'bg-accent bg-opacity-20 border-accent' : ''}
        `}
        title="Upload files (images, PDFs, text)"
      >
        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </label>
    </div>
  );
}

export default FileUpload;
