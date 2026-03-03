import React, { useRef } from 'react';
import { useConversation } from '../../context/ConversationContext';
import exportService from '../../services/storage/exportService';
import conversationDB from '../../services/storage/conversationDB';

function ImportExport() {
  const { conversations } = useConversation();
  const fileInputRef = useRef(null);

  const handleExportAll = async () => {
    try {
      await exportService.exportAllConversations(conversations, 'json');
    } catch (error) {
      console.error('Failed to export all conversations:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = await exportService.importFromJSON(text);

      // Save to database
      for (const conversation of imported) {
        await conversationDB.saveConversation({
          ...conversation,
          id: conversation.id || uuidv4(),
          importedAt: Date.now(),
        });
      }

      alert(`Successfully imported ${imported.length} conversation(s)!`);
      window.location.reload(); // Reload to show imported conversations
    } catch (error) {
      console.error('Failed to import conversations:', error);
      alert('Import failed: ' + error.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('⚠️ This will delete ALL conversations permanently. Are you sure?')) {
      return;
    }

    if (!confirm('Really delete everything? This cannot be undone!')) {
      return;
    }

    try {
      await conversationDB.clearAllConversations();
      alert('All conversations deleted.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      alert('Clear failed: ' + error.message);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Import & Export</h3>

      <div className="space-y-4">
        {/* Export All */}
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary mb-1">Export All Conversations</h4>
              <p className="text-sm text-text-secondary">
                Download all your conversations as a JSON file for backup.
              </p>
            </div>
            <button
              onClick={handleExportAll}
              disabled={conversations.length === 0}
              className="ml-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export All
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary mb-1">Import Conversations</h4>
              <p className="text-sm text-text-secondary">
                Import conversations from a JSON file.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-surface-elevated hover:bg-border text-text-primary rounded-lg text-sm font-medium transition-colors"
              >
                Import JSON
              </button>
            </div>
          </div>
        </div>

        {/* Clear All */}
        <div className="p-4 bg-danger bg-opacity-10 rounded-lg border border-danger">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-danger mb-1">⚠️ Danger Zone</h4>
              <p className="text-sm text-text-secondary">
                Delete all conversations permanently. This cannot be undone.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              disabled={conversations.length === 0}
              className="ml-4 px-4 py-2 bg-danger hover:bg-opacity-80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-accent bg-opacity-10 border border-accent rounded-lg">
        <div className="text-sm font-medium text-accent mb-1">💡 Backup Tips</div>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Export your conversations regularly as backup</li>
          <li>• Imported conversations will appear in your conversation list</li>
          <li>• JSON files can be shared with other Aether users</li>
        </ul>
      </div>
    </div>
  );
}

export default ImportExport;
