import { saveAs } from 'file-saver';

/**
 * ExportService - Export conversations to various formats
 */
class ExportService {
  /**
   * Export conversation to Markdown format
   */
  exportToMarkdown(conversation) {
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `**Provider:** ${conversation.provider}\n`;
    markdown += `**Model:** ${conversation.model}\n`;
    markdown += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n`;
    markdown += `**Updated:** ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    if (conversation.messages && conversation.messages.length > 0) {
      conversation.messages.forEach((message, index) => {
        const role = message.role === 'user' ? '**You**' : '**AI**';
        const timestamp = new Date(message.timestamp).toLocaleTimeString();

        markdown += `### ${role} (${timestamp})\n\n`;
        markdown += `${message.content}\n\n`;

        if (index < conversation.messages.length - 1) {
          markdown += `---\n\n`;
        }
      });
    } else {
      markdown += `*No messages in this conversation*\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `*Exported from Aether - ${new Date().toLocaleString()}*\n`;

    return markdown;
  }

  /**
   * Export conversation to JSON format
   */
  exportToJSON(conversation) {
    const exportData = {
      ...conversation,
      exportedAt: Date.now(),
      exportedBy: 'Aether v1.0.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export conversation to plain text format
   */
  exportToText(conversation) {
    let text = `${conversation.title}\n`;
    text += `${'='.repeat(conversation.title.length)}\n\n`;
    text += `Provider: ${conversation.provider}\n`;
    text += `Model: ${conversation.model}\n`;
    text += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    text += `Updated: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    text += `${'-'.repeat(60)}\n\n`;

    if (conversation.messages && conversation.messages.length > 0) {
      conversation.messages.forEach((message, index) => {
        const role = message.role === 'user' ? 'You' : 'AI';
        const timestamp = new Date(message.timestamp).toLocaleTimeString();

        text += `[${role}] ${timestamp}\n`;
        text += `${message.content}\n\n`;

        if (index < conversation.messages.length - 1) {
          text += `${'-'.repeat(60)}\n\n`;
        }
      });
    } else {
      text += `No messages in this conversation\n`;
    }

    text += `\n${'='.repeat(60)}\n`;
    text += `Exported from Aether - ${new Date().toLocaleString()}\n`;

    return text;
  }

  /**
   * Export conversation to HTML format
   */
  exportToHTML(conversation) {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${conversation.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f7;
      color: #1d1d1f;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #1d1d1f;
    }
    .meta {
      color: #6e6e73;
      font-size: 14px;
    }
    .message {
      background: white;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .message.user {
      background: #00d4ff;
      color: white;
      margin-left: 60px;
    }
    .message.assistant {
      background: white;
      margin-right: 60px;
    }
    .message-header {
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .message.user .message-header {
      color: rgba(255,255,255,0.9);
    }
    .message.assistant .message-header {
      color: #6e6e73;
    }
    .message-content {
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .footer {
      text-align: center;
      color: #6e6e73;
      font-size: 12px;
      margin-top: 40px;
    }
    code {
      background: #f5f5f7;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    .message.user code {
      background: rgba(255,255,255,0.2);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${conversation.title}</h1>
    <div class="meta">
      <strong>Provider:</strong> ${conversation.provider} |
      <strong>Model:</strong> ${conversation.model}<br>
      <strong>Created:</strong> ${new Date(conversation.createdAt).toLocaleString()} |
      <strong>Updated:</strong> ${new Date(conversation.updatedAt).toLocaleString()}
    </div>
  </div>

  <div class="messages">
`;

    if (conversation.messages && conversation.messages.length > 0) {
      conversation.messages.forEach(message => {
        const role = message.role === 'user' ? 'user' : 'assistant';
        const label = message.role === 'user' ? 'You' : 'AI';
        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        const content = this.escapeHtml(message.content);

        html += `
    <div class="message ${role}">
      <div class="message-header">${label} - ${timestamp}</div>
      <div class="message-content">${content}</div>
    </div>
`;
      });
    } else {
      html += `
    <div class="message assistant">
      <div class="message-content"><em>No messages in this conversation</em></div>
    </div>
`;
    }

    html += `
  </div>

  <div class="footer">
    Exported from Aether on ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Helper: Escape HTML special characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Save conversation to file
   */
  async saveToFile(conversation, format = 'markdown') {
    let content, filename, mimeType;

    switch (format) {
      case 'markdown':
        content = this.exportToMarkdown(conversation);
        filename = `${this.sanitizeFilename(conversation.title)}.md`;
        mimeType = 'text/markdown;charset=utf-8';
        break;

      case 'json':
        content = this.exportToJSON(conversation);
        filename = `${this.sanitizeFilename(conversation.title)}.json`;
        mimeType = 'application/json;charset=utf-8';
        break;

      case 'text':
        content = this.exportToText(conversation);
        filename = `${this.sanitizeFilename(conversation.title)}.txt`;
        mimeType = 'text/plain;charset=utf-8';
        break;

      case 'html':
        content = this.exportToHTML(conversation);
        filename = `${this.sanitizeFilename(conversation.title)}.html`;
        mimeType = 'text/html;charset=utf-8';
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, filename);
  }

  /**
   * Sanitize filename to remove invalid characters
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);
  }

  /**
   * Export multiple conversations as a single file
   */
  async exportAllConversations(conversations, format = 'json') {
    if (format === 'json') {
      const exportData = {
        exportedAt: Date.now(),
        exportedBy: 'Aether v1.0.0',
        totalConversations: conversations.length,
        conversations: conversations,
      };

      const content = JSON.stringify(exportData, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const filename = `aether_all_conversations_${Date.now()}.json`;
      saveAs(blob, filename);
    } else {
      throw new Error('Only JSON format is supported for bulk export');
    }
  }

  /**
   * Import conversations from JSON file
   */
  async importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Validate data structure
      if (data.conversations && Array.isArray(data.conversations)) {
        return data.conversations;
      } else if (data.id && data.messages) {
        // Single conversation
        return [data];
      } else {
        throw new Error('Invalid conversation data format');
      }
    } catch (error) {
      console.error('Failed to import conversations:', error);
      throw error;
    }
  }
}

// Create singleton instance
const exportService = new ExportService();

export default exportService;
