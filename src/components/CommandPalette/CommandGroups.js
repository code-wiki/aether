import {
  MessageSquare,
  Settings,
  Download,
  Moon,
  Sun,
  Sparkles,
  FileText,
  Trash2,
  Search,
  Key,
  Cloud,
  Users,
  BarChart3,
  Database,
} from 'lucide-react';

/**
 * Define all command groups for the command palette
 * Commands are dynamically populated with data from contexts
 */

export const getCommands = ({
  createConversation,
  loadConversation,
  deleteConversation,
  conversations,
  openSettings,
  toggleTheme,
  currentTheme,
  exportConversation,
  searchConversations,
}) => {
  const commands = [
    // Actions group
    {
      group: 'Actions',
      commands: [
        {
          id: 'new-conversation',
          label: 'New Conversation',
          icon: MessageSquare,
          shortcut: '⌘N',
          action: createConversation,
        },
        {
          id: 'search-conversations',
          label: 'Search Conversations',
          icon: Search,
          shortcut: '⌘F',
          action: searchConversations,
        },
        {
          id: 'export',
          label: 'Export Conversation',
          icon: Download,
          action: exportConversation,
        },
        {
          id: 'settings',
          label: 'Open Settings',
          icon: Settings,
          shortcut: '⌘,',
          action: openSettings,
        },
      ],
    },

    // Settings group
    {
      group: 'Settings',
      commands: [
        {
          id: 'settings-gcp',
          label: 'Google Cloud Settings',
          icon: Cloud,
          action: () => {
            openSettings();
            // TODO: Navigate to GCP tab
          },
        },
        {
          id: 'settings-api',
          label: 'API Keys',
          icon: Key,
          action: () => {
            openSettings();
            // TODO: Navigate to API tab
          },
        },
        {
          id: 'settings-personas',
          label: 'Manage Personas',
          icon: Users,
          action: () => {
            openSettings();
            // TODO: Navigate to Personas tab
          },
        },
        {
          id: 'settings-usage',
          label: 'View Usage Statistics',
          icon: BarChart3,
          action: () => {
            openSettings();
            // TODO: Navigate to Usage tab
          },
        },
        {
          id: 'settings-data',
          label: 'Data Management',
          icon: Database,
          action: () => {
            openSettings();
            // TODO: Navigate to Data tab
          },
        },
      ],
    },

    // Theme group
    {
      group: 'Appearance',
      commands: [
        {
          id: 'toggle-theme',
          label: currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          icon: currentTheme === 'dark' ? Sun : Moon,
          shortcut: '⌘⇧T',
          action: toggleTheme,
        },
      ],
    },

    // Models group
    {
      group: 'Switch Model',
      commands: [
        {
          id: 'model-gemini-flash',
          label: 'Gemini 1.5 Flash',
          icon: Sparkles,
          model: 'gemini-1.5-flash',
          provider: 'gemini',
        },
        {
          id: 'model-gemini-pro',
          label: 'Gemini 1.5 Pro',
          icon: Sparkles,
          model: 'gemini-1.5-pro',
          provider: 'gemini',
        },
        {
          id: 'model-claude-sonnet',
          label: 'Claude 3.5 Sonnet',
          icon: Sparkles,
          model: 'claude-3-5-sonnet@20240620',
          provider: 'claude',
        },
        {
          id: 'model-gpt4o',
          label: 'GPT-4o',
          icon: Sparkles,
          model: 'gpt-4o',
          provider: 'openai',
        },
        {
          id: 'model-gpt4o-mini',
          label: 'GPT-4o Mini',
          icon: Sparkles,
          model: 'gpt-4o-mini',
          provider: 'openai',
        },
      ],
    },

    // Conversations group (dynamic)
    {
      group: 'Recent Conversations',
      commands: conversations?.slice(0, 10).map((conv) => ({
        id: `conv-${conv.id}`,
        label: conv.title,
        icon: MessageSquare,
        action: () => loadConversation(conv.id),
        meta: new Date(conv.updatedAt).toLocaleDateString(),
      })) || [],
    },

    // Danger zone
    {
      group: 'Danger Zone',
      commands: [
        {
          id: 'delete-conversation',
          label: 'Delete Current Conversation',
          icon: Trash2,
          variant: 'danger',
          action: deleteConversation,
        },
      ],
    },
  ];

  return commands;
};

export default getCommands;
